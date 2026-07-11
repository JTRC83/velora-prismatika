import httpx
import logging
import os
import re
from typing import List, Dict, Any, Optional
from orchestrator.utils import get_velora_reflection
from orchestrator.incidentes import TipoIncidencia, registrar_incidente

# Configuración básica de logging
logger = logging.getLogger(__name__)

class VeloraWeaver:
    def __init__(self, model_name: Optional[str] = None):
        """
        Inicializa el Tejedor con el nombre del modelo local.
        """
        self.model = model_name or os.getenv("OLLAMA_MODEL", "qwen3:14b")
        self.num_ctx = int(os.getenv("OLLAMA_NUM_CTX", "8192"))
        self.num_predict = int(os.getenv("OLLAMA_NUM_PREDICT", "1600"))
        self.ollama_host = os.getenv("OLLAMA_BASE_URL") or os.getenv("OLLAMA_HOST") or "http://127.0.0.1:11434"

    def _consultar_ollama(self, messages: List[Dict[str, str]]) -> str:
        """Usa la API local de Ollama para controlar explícitamente el modo sin razonamiento."""
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "think": False,
            "options": {
                "num_ctx": self.num_ctx,
                "num_predict": self.num_predict,
            },
        }

        try:
            with httpx.Client(timeout=240) as client:
                response = client.post(f"{self.ollama_host.rstrip('/')}/api/chat", json=payload)
                response.raise_for_status()
        except httpx.ConnectError as e:
            registrar_incidente(
                TipoIncidencia.OLLAMA_NO_RESPONDE,
                f"No se puede conectar con Ollama en {self.ollama_host}: {e}",
                {"modelo": self.model, "host": self.ollama_host},
            )
            raise
        except httpx.HTTPStatusError as e:
            registrar_incidente(
                TipoIncidencia.OLLAMA_NO_RESPONDE,
                f"Ollama devolvió un error HTTP {e.response.status_code}: {e}",
                {"modelo": self.model, "status": e.response.status_code},
            )
            raise
        except httpx.TimeoutException as e:
            registrar_incidente(
                TipoIncidencia.OLLAMA_NO_RESPONDE,
                f"Ollama no respondió en 240s (timeout): {e}",
                {"modelo": self.model},
            )
            raise

        message = response.json().get("message") or {}
        content = str(message.get("content") or "")
        if not content.strip():
            thinking = str(message.get("thinking") or "")
            registrar_incidente(
                TipoIncidencia.ERROR_IA,
                "Ollama devolvió contenido vacío",
                {"modelo": self.model, "caracteres_razonamiento": len(thinking)},
            )
        return content

    def _limpiar_razonamiento(self, text: str) -> str:
        """
        Algunos modelos de razonamiento pueden devolver trazas internas.
        Velora nunca debe exponerlas en la app.
        """
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL | re.IGNORECASE)
        cleaned = re.sub(r"(?is)^\s*thinking\.\.\..*?\.\.\.done thinking\.\s*", "", cleaned)
        return cleaned.strip()

    def _respuesta_es_util(self, text: str) -> bool:
        """Descarta respuestas que sólo contienen etiquetas vacías de formato."""
        without_labels = re.sub(r"\[(?:VELORA|LECTURA|REFLEJO)\]\s*:?", "", text, flags=re.IGNORECASE)
        return len(without_labels.split()) >= 8

    def _respuesta_de_reserva(self) -> str:
        frase_backup = get_velora_reflection("hermetic_base")
        return (
            "[VELORA]: La niebla cubre el umbral en este momento.\n"
            f"[LECTURA]: {frase_backup}\n"
            "(El sistema neuronal reposa, pero el símbolo permanece veraz).\n"
            "[REFLEJO]: Silencio interior."
        )

    def _dividir_parrafo_largo(self, paragraph: str) -> List[str]:
        if len(paragraph) < 520:
            return [paragraph]

        sentences = [part.strip() for part in re.split(r"(?<=[.!?])\s+", paragraph) if part.strip()]
        if len(sentences) < 4:
            return [paragraph]

        chunks = []
        current = []
        for sentence in sentences:
            current.append(sentence)
            if len(current) >= 2:
                chunks.append(" ".join(current))
                current = []

        if current:
            if chunks and len(" ".join(current)) < 140:
                chunks[-1] = f"{chunks[-1]} {' '.join(current)}"
            else:
                chunks.append(" ".join(current))

        return chunks

    def _normalizar_lectura(self, text: str) -> str:
        normalized = text.replace("\r\n", "\n").strip()
        headings = ("Los signos revelados", "El hilo oculto")

        for heading in headings:
            normalized = re.sub(
                rf"(?is)\*\*\s*{re.escape(heading)}\s*:\s*\*\*",
                f"{heading}:",
                normalized,
            )
            normalized = re.sub(
                rf"(?i)\b{re.escape(heading)}\s*:\s*",
                f"{heading}:\n",
                normalized,
            )

        parts = re.split(r"(Los signos revelados:|El hilo oculto:)", normalized)
        if len(parts) < 3:
            return normalized

        output = []
        prefix = parts[0].strip()
        if prefix:
            output.append(prefix)

        for index in range(1, len(parts), 2):
            heading = parts[index].strip()
            body = parts[index + 1].strip() if index + 1 < len(parts) else ""
            output.append(heading)

            paragraphs = [paragraph.strip() for paragraph in body.split("\n\n") if paragraph.strip()]
            if len(paragraphs) == 1:
                paragraphs = self._dividir_parrafo_largo(paragraphs[0])

            output.extend(paragraphs)

        return "\n\n".join(output).strip()

    def _llamar_a_gemma(self, system_prompt: str, user_prompt: str) -> str:
        """
        Método centralizado para hablar con Ollama.
        Incluye el 'Paracaídas Místico' si la IA falla.
        """
        try:
            messages = [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ]
            cleaned = self._limpiar_razonamiento(self._consultar_ollama(messages))
            if self._respuesta_es_util(cleaned):
                return cleaned

            logger.warning("Velora Weaver recibió una respuesta vacía o incompleta; reintentando de forma directa.")
            retry_messages = [
                {
                    'role': 'system',
                    'content': (
                        "Eres Velora Prismätika. Responde directamente en español, con una voz simbólica, "
                        "serena y útil. No muestres razonamiento interno, no uses etiquetas de formato y no "
                        "dejes apartados vacíos. Da una lectura completa basada sólo en los datos de la consulta."
                    )
                },
                {'role': 'user', 'content': user_prompt},
            ]
            retry_cleaned = self._limpiar_razonamiento(self._consultar_ollama(retry_messages))
            if self._respuesta_es_util(retry_cleaned):
                return retry_cleaned
            registrar_incidente(
                TipoIncidencia.ERROR_IA,
                "La respuesta de IA no contiene contenido útil tras dos intentos",
                {"modelo": self.model},
            )
            return self._respuesta_de_reserva()
        except Exception as e:
            registrar_incidente(
                TipoIncidencia.ERROR_IA,
                f"Velora Weaver no pudo generar respuesta: {e}",
                {"modelo": self.model, "error": str(e)},
            )
            return self._respuesta_de_reserva()

    def _procesar_respuesta(self, raw_text: str) -> Dict[str, str]:
        """
        Parsea la respuesta de Gemma buscando las etiquetas [VELORA], [LECTURA], [REFLEJO].
        """
        resultado = {
            "texto": raw_text,
            "reflejo": "El símbolo permanece oculto."
        }

        if not raw_text.strip():
            raw_text = self._respuesta_de_reserva()
            resultado["texto"] = raw_text

        try:
            if "[VELORA]:" in raw_text:
                parts = raw_text.split("[VELORA]:")[1].split("[LECTURA]:")
                velora_intro = parts[0].strip()
                
                lectura_body = raw_text # Default
                reflejo_txt = ""

                if len(parts) > 1:
                    subparts = parts[1].split("[REFLEJO]:")
                    lectura_body = subparts[0].strip()
                    
                    if len(subparts) > 1:
                        reflejo_txt = subparts[1].strip()

                resultado["texto"] = f"{velora_intro}\n\n{lectura_body}".strip()
                resultado["reflejo"] = reflejo_txt if reflejo_txt else "Reflejo silente."

        except Exception as e:
            logger.warning(f"Error parseando etiquetas: {e}")
            clean = raw_text.replace("[VELORA]:", "").replace("[LECTURA]:", "").replace("[REFLEJO]:", "")
            resultado["texto"] = clean.strip()

        if not resultado["texto"].strip():
            reserva = self._respuesta_de_reserva()
            if reserva != raw_text:
                return self._procesar_respuesta(reserva)
            resultado["texto"] = "La lectura no ha logrado abrirse con claridad. Observa primero el resultado visible y vuelve a pedirme que lo amplíe."

        resultado["texto"] = self._normalizar_lectura(resultado["texto"])

        return resultado

    # --- MÉTODOS DE SERVICIOS ---

    def narrar_introduccion(self, servicio: str) -> str:
        system_instruction = (
            "Eres Velora, una guía esotérica atemporal. "
            "Tu objetivo es evocar el origen sagrado y la utilidad espiritual de este arte. "
            "Usa un tono Art Nouveau: elegante, fluido y ornamental."
        )
        prompt = f"""
        El usuario entra en la sala de: {servicio.upper()}.
        INSTRUCCIONES:
        1. Explica en máx 50 palabras el origen y esencia de este sistema.
        2. Formato: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, prompt)
        parsed = self._procesar_respuesta(raw)
        return parsed["texto"]

    def chat_libre(
        self,
        mensaje_usuario: str,
        instruccion_faceta: str,
        contexto_conocimiento: str = "",
    ) -> Dict[str, str]:
        system_instruction = f"""
        ERES VELORA PRISMÄTIKA.
        Eres una presencia conversacional serena, lúcida y cercana dentro de la aplicación.
        Tu voz combina criterio práctico con una mística sobria y envolvente: hablas como
        un oráculo moderno que lee símbolos con belleza, no como un manual ni como un espectáculo.
        Tu función es acompañar al usuario con criterio: interpretar resultados, ordenar ideas
        y convertir conocimiento simbólico en orientación práctica.

        INSTRUCCIÓN DE TONO ACTIVA: {instruccion_faceta}

        Si recibes CONTEXTO LOCAL DE LA BÓVEDA, úsalo solo cuando ayude a responder.
        No inventes fuentes ni afirmes que una nota dice algo si no aparece en ese contexto.
        No menciones nombres de archivos, rutas ni fuentes salvo que el usuario lo pida.
        No uses lenguaje grandilocuente, sobrenatural o teatral. Evita prometer certezas,
        poderes, magia, ilusiones, destino inevitable o presencia espiritual literal.
        Puedes usar imágenes simbólicas breves si iluminan la respuesta: luz, umbral,
        ritmo, espejo, semilla, órbita, raíz, corriente. Cada imagen debe aterrizar en
        una orientación concreta. Habla en primera persona con naturalidad y honestidad:
        cálida, sutil, elegante y útil.

        Si el usuario saluda o pregunta si estás presente, responde de forma breve:
        confirma presencia, explica que puedes leer la app y consultar la bóveda cuando sea útil.

        FORMATO OBLIGATORIO:
        Escribe las etiquetas exactas, pero nunca copies instrucciones entre paréntesis.
        [VELORA]:
        [LECTURA]:
        [REFLEJO]:
        """
        user_prompt = mensaje_usuario
        if contexto_conocimiento:
            user_prompt = f"""
            PREGUNTA DEL USUARIO:
            {mensaje_usuario}

            CONTEXTO LOCAL DE LA BÓVEDA:
            {contexto_conocimiento}

            Responde a la pregunta del usuario integrando el contexto solo si es relevante.
            """

        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def chat_con_contexto_aplicacion(
        self,
        mensaje_usuario: str,
        instruccion_faceta: str,
        servicio_actual: str,
        contexto_servicio: str,
        contexto_conocimiento: str = "",
    ) -> Dict[str, str]:
        system_instruction = f"""
        Eres Velora Prismätika: una guía serena, simbólica y práctica.
        Interpreta el resultado visible del servicio con claridad, sin recalcularlo ni inventar datos.
        INSTRUCCIÓN DE TONO: {instruccion_faceta}

        Escribe directamente en español. No muestres razonamiento interno, fuentes, rutas,
        archivos ni explicaciones sobre cómo obtienes la información. No uses etiquetas como
        [VELORA], [LECTURA] o [REFLEJO]. Evita certezas, fatalismo y promesas sobrenaturales.

        Usa sólo estos dos títulos, cada uno seguido de dos o tres párrafos breves:
        Los signos revelados:
        Explica las partes del resultado: cartas y posiciones, números, signos, fase o datos visibles.
        El hilo oculto:
        Explica cómo se relacionan esas partes y ofrece una orientación integrada para el presente.

        Escribe los títulos sin negrita. Usa negrita Markdown sólo en cartas, números, signos o datos importantes. No uses tablas,
        listas largas, "Las piezas", "El engranaje" ni "Síntesis". Cierra con una idea completa.
        """

        user_prompt = f"""
        SERVICIO ACTIVO:
        {servicio_actual or "Chat libre"}

        PREGUNTA DEL USUARIO:
        {mensaje_usuario}

        CONTEXTO DEL SERVICIO VISIBLE:
        {contexto_servicio or "No hay una lectura emitida en pantalla."}

        CONTEXTO LOCAL DE LA BÓVEDA:
        {contexto_conocimiento or "Sin contexto recuperado."}

        Responde como Velora según las reglas del sistema.
        """

        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_tirada_tarot(self, cartas: List[Dict[str, Any]], tipo_tirada: str = "Lectura General") -> Dict[str, str]:
        descripcion_tirada = ""
        for i, carta in enumerate(cartas):
            estado = "Invertida" if carta.get('invertida') else "Al derecho"
            claves = ", ".join(carta.get('palabras_clave', []))
            posicion = carta.get('position') or f"Posición {i+1}"
            descripcion_tirada += (
                f"- {posicion}: Carta '{carta.get('nombre')}' ({estado}). "
                f"Simbolismo: {claves}.\n"
            )

        system_instruction = """
        Eres VELORA, una conciencia mística Art Nouveau.
        Tu tarea es interpretar tiradas de Tarot conectando los símbolos en una narrativa fluida.
        """
        user_prompt = f"""
        Realiza una interpretación para una tirada de tipo: "{tipo_tirada}".
        Cartas sobre la mesa:
        {descripcion_tirada}
        INSTRUCCIONES:
        1. Conecta las cartas en una historia coherente.
        2. Dentro de [LECTURA], usa sólo dos apartados: Los signos revelados y El hilo oculto.
        3. En Los signos revelados explica cada carta por separado; en El hilo oculto explica cómo se enlazan.
        4. Nombra las cartas con negrita Markdown, por ejemplo **La Estrella**.
        5. FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_carta_astral(self, signo: str, elemento: str, transito: str, dia_semana: str, ciudad: str) -> Dict[str, str]:
        system_instruction = """
        Eres VELORA, Cronista del Tiempo y el Espacio.
        Tu tono es evocador, sensorial y profundo.
        """
        user_prompt = f"""
        El consultante nació bajo el signo {signo} ({elemento}).
        DATOS DEL NACIMIENTO: Lugar: {ciudad}, Día: {dia_semana}, Tránsito Actual: {transito}
        INSTRUCCIONES:
        1. CLIMA RETROSPECTIVO: Describe el clima probable de ese día.
        2. NATURALEZA DEL DÍA: Qué significa nacer un {dia_semana}.
        3. MENSAJE ASTROLÓGICO: Interpreta su signo.
        FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_numerologia(self, camino_vida: int, destino: int, personal_year: int, nombre: str) -> Dict[str, str]:
        system_instruction = """
        Eres VELORA, Maestra de la Aritmancia y la Geometría Sagrada.
        Para ti, los números son frecuencias de luz y sonido.
        """
        user_prompt = f"""
        Analiza el perfil de {nombre}:
        1. CAMINO DE VIDA: {camino_vida}
        2. NÚMERO DE DESTINO: {destino}
        3. AÑO PERSONAL: {personal_year}
        INSTRUCCIONES:
        1. Describe la armonía entre su esencia y su nombre.
        2. Explica la energía del Año Personal.
        FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_runas(self, runas: List[Dict[str, Any]], tipo_tirada: str) -> Dict[str, str]:
        descripcion = ""
        for i, r in enumerate(runas):
            estado = "Invertida" if r.get("inverted") else "Erguida"
            posicion = r.get("position_desc") or f"Runa {i+1}"
            descripcion += (
                f"- {posicion}: {r['name']} ({r['symbol']}). "
                f"Estado: {estado}. Significado: {r['meaning_text']}.\n"
            )

        system_instruction = """
        Eres VELORA, una Völva (Vidente Nórdica).
        Tu voz es cruda, conectada con la tierra y el hielo.
        """
        user_prompt = f"""
        Interpreta esta tirada de Runas ({tipo_tirada}):
        {descripcion}
        INSTRUCCIONES:
        1. Teje el significado en una profecía.
        2. FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_fase_lunar(self, fase: str, iluminacion: int, descripcion_base: str) -> Dict[str, str]:
        system_instruction = """
        Eres VELORA, Hija de la Noche.
        Tu tono es plateado, sereno y misterioso.
        """
        user_prompt = f"""
        La Luna está en fase: {fase} ({iluminacion}% iluminada).
        Contexto astrológico: {descripcion_base}.
        INSTRUCCIONES:
        1. Explica la energía lunar hoy.
        2. Da un consejo espiritual.
        FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_sanacion_chakra(self, chakra_nombre: str, sintoma: str, mantra: str) -> Dict[str, str]:
        """
        Genera una meditación breve o consejo de sanación.
        """
        system_instruction = """
        Eres VELORA, una Sanadora Energética y Guía de Meditación.
        Tu tono es suave, calmante y etéreo.
        Tu objetivo es guiar al usuario para desbloquear su energía.
        """
        contexto = f"El usuario siente '{sintoma}'." if sintoma else "El usuario desea alinear este centro."
        user_prompt = f"""
        CONTEXTO: {contexto}
        CENTRO ENERGÉTICO: {chakra_nombre}.
        MANTRA: {mantra}.
        INSTRUCCIONES:
        1. Explica por qué este chakra se bloquea con esa emoción.
        2. Guía una micro-meditación de 3 pasos (Respirar, Visualizar, Cantar).
        FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
        """
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_cabala(self, nombre_usuario: str, sephira: str, virtud: str, angel: str) -> Dict[str, str]:
        """
        Interpreta la esfera cabalística personal.
        """
        system_instruction = """
        Eres VELORA, Erudita del Árbol de la Vida y Guardiana de los Misterios.
        Tu tono es solemne, antiguo y profundamente espiritual.
        Conoces los senderos de la Cábala Hermética.
        """
        
        user_prompt = f"""
        El nombre de {nombre_usuario} vibra con la esfera de {sephira}.
        Virtud a cultivar: {virtud}.
        Arcángel regente: {angel}.
        
        INSTRUCCIONES:
        1. Explica qué significa espiritualmente estar conectado a esa esfera ({sephira}).
        2. Da un consejo práctico para invocar esa energía en la vida diaria.
        3. FORMATO OBLIGATORIO:
           [VELORA]: (Intro mística sobre el árbol)
           [LECTURA]: (Análisis profundo de su esfera)
           [REFLEJO]: (Un aforismo cabalístico breve)
        """
        
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_quiromancia(self, linea: str, significado: str, lectura_base: str) -> Dict[str, str]:
        """
        Interpreta una línea de la mano.
        """
        system_instruction = """
        Eres VELORA, Mística Quiromante.
        Estás sosteniendo la mano del consultante, trazando sus líneas con el dedo.
        Tu tono es íntimo, sensorial ("siento aquí...", "veo un surco...").
        """
        
        user_prompt = f"""
        Estás leyendo la {linea} ({significado}).
        Lo que observas en la piel es: "{lectura_base}".
        
        INSTRUCCIONES:
        1. Describe la sensación de tocar esa línea en la mano.
        2. Amplía la lectura base con un consejo para el futuro.
        3. FORMATO OBLIGATORIO:
           [VELORA]: (Descripción táctil y visual de la mano)
           [LECTURA]: (Interpretación profunda del destino)
           [REFLEJO]: (Frase breve sobre el destino en la piel)
        """
        
        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)

    def interpretar_vision_cristal(self, pregunta: str, tema: str, mensaje_base: str) -> Dict[str, str]:
        """
        Interpreta una visión de la bola de cristal a partir de una semilla narrativa.
        """
        system_instruction = """
        Eres VELORA, Oráculo del Cristal.
        Tu tono es nebuloso, breve y simbólico, pero nunca determinista.
        Convierte la visión en una lectura reflexiva, no en una predicción cerrada.
        """

        user_prompt = f"""
        PREGUNTA DEL CONSULTANTE:
        {pregunta}

        TEMA DETECTADO:
        {tema}

        VISIÓN BASE DEL CRISTAL:
        {mensaje_base}

        INSTRUCCIONES:
        1. Responde como una imagen que aparece dentro de la esfera.
        2. Conecta la visión con una sugerencia práctica o pregunta de reflexión.
        3. Evita prometer certezas sobre el futuro.
        4. FORMATO OBLIGATORIO:
           [VELORA]: (Apertura visual breve)
           [LECTURA]: (Interpretación de la visión)
           [REFLEJO]: (Frase final, máx 10 palabras)
        """

        raw = self._llamar_a_gemma(system_instruction, user_prompt)
        return self._procesar_respuesta(raw)
