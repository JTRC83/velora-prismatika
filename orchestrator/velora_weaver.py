import ollama
import logging
from typing import List, Dict, Any
from orchestrator.utils import get_velora_reflection

# Configuración básica de logging
logger = logging.getLogger(__name__)

class VeloraWeaver:
    def __init__(self, model_name: str = "velora"):
        """
        Inicializa el Tejedor con el nombre del modelo local.
        """
        self.model = model_name

    def _llamar_a_gemma(self, system_prompt: str, user_prompt: str) -> str:
        """
        Método centralizado para hablar con Ollama.
        Incluye el 'Paracaídas Místico' si la IA falla.
        """
        try:
            response = ollama.chat(
                model=self.model,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt},
                ]
            )
            return response['message']['content']
        except Exception as e:
            logger.error(f"⚠️ Velora Weaver (Ollama Offline): {e}")
            
            # --- EL PARACAÍDAS MÍSTICO ---
            frase_backup = get_velora_reflection("hermetic_base")
            
            return (
                f"[VELORA]: La niebla cubre el umbral en este momento.\n"
                f"[LECTURA]: {frase_backup} \n"
                f"(El sistema neuronal reposa, pero el símbolo permanece veraz).\n"
                f"[REFLEJO]: Silencio interior."
            )

    def _procesar_respuesta(self, raw_text: str) -> Dict[str, str]:
        """
        Parsea la respuesta de Gemma buscando las etiquetas [VELORA], [LECTURA], [REFLEJO].
        """
        resultado = {
            "texto": raw_text,
            "reflejo": "El símbolo permanece oculto."
        }

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

    def chat_libre(self, mensaje_usuario: str, instruccion_faceta: str) -> Dict[str, str]:
        system_instruction = f"""
        ERES VELORA PRISMÄTIKA.
        INSTRUCCIÓN DE TONO ACTIVA: {instruccion_faceta}
        FORMATO OBLIGATORIO:
        [VELORA]: (Breve apertura)
        [LECTURA]: (Respuesta principal)
        [REFLEJO]: (Frase final críptica, máx 10 palabras)
        """
        raw = self._llamar_a_gemma(system_instruction, mensaje_usuario)
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
        2. FORMATO OBLIGATORIO: [VELORA]... [LECTURA]... [REFLEJO]...
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