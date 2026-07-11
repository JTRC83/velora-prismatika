#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/.runtime/logs"
PID_DIR="$ROOT_DIR/.runtime/pids"

OLLAMA_BIN="${OLLAMA_BIN:-/usr/local/bin/ollama}"
OLLAMA_HOST_URL="${OLLAMA_HOST_URL:-http://127.0.0.1:11434}"
OLLAMA_MODEL="${OLLAMA_MODEL:-qwen3:14b}"
OLLAMA_NUM_CTX="${OLLAMA_NUM_CTX:-8192}"
OLLAMA_NUM_PREDICT="${OLLAMA_NUM_PREDICT:-1600}"
API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-8000}"
WEB_HOST="${WEB_HOST:-127.0.0.1}"
WEB_PORT="${WEB_PORT:-5173}"
APP_URL="${APP_URL:-http://${WEB_HOST}:${WEB_PORT}/}"

NO_OPEN=0
SKIP_WARM=0
RESTART_STUCK_OLLAMA="${RESTART_STUCK_OLLAMA:-0}"

for arg in "$@"; do
  case "$arg" in
    --no-open) NO_OPEN=1 ;;
    --skip-warm) SKIP_WARM=1 ;;
    --restart-stuck-ollama) RESTART_STUCK_OLLAMA=1 ;;
    *)
      echo "Argumento desconocido: $arg" >&2
      echo "Uso: scripts/start_velora.sh [--no-open] [--skip-warm] [--restart-stuck-ollama]" >&2
      exit 2
      ;;
  esac
done

mkdir -p "$LOG_DIR" "$PID_DIR"

timestamp() {
  date "+%H:%M:%S"
}

say_step() {
  printf "\n[%s] %s\n" "$(timestamp)" "$1"
}

port_is_open() {
  lsof -ti "tcp:$1" >/dev/null 2>&1
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local timeout="${3:-60}"
  local start
  start="$(date +%s)"

  while true; do
    if curl -fsS -m 2 "$url" >/dev/null 2>&1; then
      echo "✓ $label listo"
      return 0
    fi

    if (( "$(date +%s)" - start >= timeout )); then
      echo "No se pudo confirmar $label en $url tras ${timeout}s" >&2
      return 1
    fi

    sleep 1
  done
}

http_is_ready() {
  local url="$1"
  curl -fsS -m 2 "$url" >/dev/null 2>&1
}

start_ollama() {
  say_step "Arrancando Ollama"
  "$OLLAMA_BIN" serve >"$LOG_DIR/ollama.log" 2>&1 &
  echo $! >"$PID_DIR/ollama.pid"
}

restart_stuck_ollama() {
  local pids
  pids="$(lsof -ti "tcp:11434" -sTCP:LISTEN 2>/dev/null || true)"

  if [[ -z "$pids" ]]; then
    start_ollama
    return
  fi

  say_step "Reiniciando Ollama atascado"
  echo "$pids" | while read -r pid; do
    [[ -n "$pid" ]] && kill "$pid" 2>/dev/null || true
  done

  for _ in {1..20}; do
    if ! port_is_open 11434; then
      start_ollama
      return
    fi
    sleep 1
  done

  echo "Ollama no liberó el puerto 11434 tras pedir el reinicio." >&2
  return 1
}

ensure_ollama() {
  if [[ ! -x "$OLLAMA_BIN" ]]; then
    echo "No encuentro Ollama en $OLLAMA_BIN. Ajusta OLLAMA_BIN o instala Ollama." >&2
    exit 1
  fi

  if http_is_ready "$OLLAMA_HOST_URL/api/tags"; then
    echo "✓ Ollama ya estaba activo"
  else
    if port_is_open 11434; then
      echo "Ollama tiene el puerto ocupado; espero a que la API responda."
      if [[ "$RESTART_STUCK_OLLAMA" -eq 1 ]]; then
        for _ in {1..15}; do
          if http_is_ready "$OLLAMA_HOST_URL/api/tags"; then
            echo "✓ Ollama ya estaba activo"
            break
          fi
          sleep 1
        done

        if ! http_is_ready "$OLLAMA_HOST_URL/api/tags"; then
          restart_stuck_ollama
        fi
      fi
    else
      start_ollama
    fi

    wait_for_http "$OLLAMA_HOST_URL/api/tags" "Ollama" 180
  fi

  if ! "$OLLAMA_BIN" show "$OLLAMA_MODEL" >"$LOG_DIR/ollama-model-check.log" 2>&1; then
    say_step "Descargando modelo $OLLAMA_MODEL"
    "$OLLAMA_BIN" pull "$OLLAMA_MODEL" | tee "$LOG_DIR/ollama-pull.log"
  else
    echo "✓ Modelo disponible: $OLLAMA_MODEL"
  fi

  if [[ "$SKIP_WARM" -eq 0 ]]; then
    say_step "Calentando $OLLAMA_MODEL"
    local payload
    payload="$(printf '{"model":"%s","messages":[{"role":"user","content":"Responde solo: Velora despierta."}],"stream":false,"think":false,"options":{"num_ctx":%s,"num_predict":8}}' "$OLLAMA_MODEL" "$OLLAMA_NUM_CTX")"
    curl -fsS -m 180 "$OLLAMA_HOST_URL/api/chat" \
      -H "Content-Type: application/json" \
      --data "$payload" >"$LOG_DIR/ollama-warmup.json" \
      || echo "Aviso: no se pudo calentar el modelo; la primera respuesta puede tardar." >&2
  fi
}

ensure_backend() {
  if port_is_open "$API_PORT"; then
    echo "✓ Backend ya estaba activo en :$API_PORT"
  else
    say_step "Arrancando backend Velora"
    (
      cd "$ROOT_DIR"
      OLLAMA_MODEL="$OLLAMA_MODEL" \
      OLLAMA_NUM_CTX="$OLLAMA_NUM_CTX" \
      OLLAMA_NUM_PREDICT="$OLLAMA_NUM_PREDICT" \
      PYTHONPYCACHEPREFIX=/private/tmp/velora-pycache \
      venv/bin/uvicorn orchestrator.main:app --host "$API_HOST" --port "$API_PORT"
    ) >"$LOG_DIR/backend.log" 2>&1 &
    echo $! >"$PID_DIR/backend.pid"
  fi

  wait_for_http "http://${API_HOST}:${API_PORT}/docs" "Backend" 75
}

ensure_frontend() {
  if port_is_open "$WEB_PORT"; then
    echo "✓ Frontend ya estaba activo en :$WEB_PORT"
  else
    say_step "Arrancando frontend Velora"
    (
      cd "$ROOT_DIR/frontend"
      npm run vite -- --host "$WEB_HOST" --port "$WEB_PORT"
    ) >"$LOG_DIR/frontend.log" 2>&1 &
    echo $! >"$PID_DIR/frontend.pid"
  fi

  wait_for_http "$APP_URL" "Frontend" 75
}

main() {
  say_step "Despertando Velora Prismätika"
  ensure_ollama
  ensure_backend
  ensure_frontend

  if [[ "$NO_OPEN" -eq 0 ]]; then
    say_step "Abriendo Velora"
    open "$APP_URL"
  fi

  echo
  echo "Velora está lista: $APP_URL"
  echo "Logs: $LOG_DIR"
}

main
