"""
Sistema de incidencias de Velora Prismátika.

Centraliza el reporting de errores para que ningún fallo quede silenciado
o indetectable. Cada incidencia se registra con un código, un mensaje claro
y el contexto necesario para resolverla.

Tipos de incidencia:
  - backend_no_responde: el frontend no puede alcanzar el backend.
  - servicio_no_cargado: un servicio mecánico no se montó en la app.
  - ollama_no_responde: el modelo de IA local no está disponible.
  - json_corrupto: un archivo JSON de datos no se pudo leer.
  - json_no_encontrado: un archivo JSON esperado no existe.
  - error_ia: Velora no pudo generar una respuesta válida.
  - error_interno: fallo no clasificado.
"""

import logging
import traceback
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

logger = logging.getLogger("Velora-Incidentes")


class TipoIncidencia(str, Enum):
    BACKEND_NO_RESPONDE = "backend_no_responde"
    SERVICIO_NO_CARGADO = "servicio_no_cargado"
    OLLAMA_NO_RESPONDE = "ollama_no_responde"
    JSON_CORRUPTO = "json_corrupto"
    JSON_NO_ENCONTRADO = "json_no_encontrado"
    ERROR_IA = "error_ia"
    ERROR_INTERNO = "error_interno"


class Incidente:
    """Representa una incidencia detectada en el sistema."""

    def __init__(
        self,
        tipo: TipoIncidencia,
        mensaje: str,
        contexto: Optional[Dict[str, Any]] = None,
    ):
        self.tipo = tipo
        self.mensaje = mensaje
        self.contexto = contexto or {}
        self.timestamp = datetime.now().isoformat()
        self.traceback = traceback.format_exc() if contexto and contexto.get("capturar_trace") else None

    def to_dict(self) -> Dict[str, Any]:
        resultado = {
            "tipo": self.tipo.value,
            "mensaje": self.mensaje,
            "timestamp": self.timestamp,
            "contexto": self.contexto,
        }
        if self.traceback:
            resultado["traceback"] = self.traceback
        return resultado

    def log(self) -> None:
        nivel = logging.ERROR
        if self.tipo == TipoIncidencia.OLLAMA_NO_RESPONDE:
            nivel = logging.WARNING
        logger.log(nivel, f"[{self.tipo.value}] {self.mensaje} | Contexto: {self.contexto}")


def registrar_incidente(
    tipo: TipoIncidencia,
    mensaje: str,
    contexto: Optional[Dict[str, Any]] = None,
) -> Incidente:
    """Crea, registra y devuelve una incidencia."""
    incidente = Incidente(tipo, mensaje, contexto)
    incidente.log()
    return incidente


def error_respuesta(
    tipo: TipoIncidencia,
    mensaje: str,
    contexto: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Devuelve un dict listo para enviar al frontend con la incidencia."""
    incidente = registrar_incidente(tipo, mensaje, contexto)
    return {
        "incidencia": incidente.to_dict(),
        "velora_voice": "",
        "reflejo": "",
    }