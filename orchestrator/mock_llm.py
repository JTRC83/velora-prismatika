import re


AVATAR_FIRMAS = {
    "sibylla": "[Sibylla]",
    "dee": "[John Dee]",
    "nostradamus": "[Nostradamus]",
    "crowley": "[Crowley]",
    "blavatsky": "[Blavatsky]",
    "vanga": "[Vanga]",
    "hermes": "[Hermes]",
    "paracelso": "[Paracelso]",
}


AVATAR_TONOS = {
    "sibylla": "La pregunta abre una puerta velada.",
    "dee": "Todo simbolo pide medida, orden y correspondencia.",
    "nostradamus": "El porvenir habla mejor en imagenes que en certezas.",
    "crowley": "La voluntad se templa cuando reconoce su deseo.",
    "blavatsky": "Toda tradicion conserva una hebra de la misma trama.",
    "vanga": "Mira lo simple: ahi suele estar la senal.",
    "hermes": "Lo alto y lo bajo se responden en espejo.",
    "paracelso": "La transformacion empieza cuando la materia escucha al alma.",
}


KEY_TERMS = [
    "fuego",
    "alma",
    "sombra",
    "destino",
    "luz",
    "camino",
    "voluntad",
    "simbolo",
]


def respuesta_avatar(avatar: str, pregunta: str) -> str:
    signature = AVATAR_FIRMAS.get(avatar, "[Velora]")
    tone = AVATAR_TONOS.get(avatar, "El simbolo responde desde el silencio.")
    question = pregunta.strip() or "Pregunta sin forma"
    return f"{tone} Pregunta recibida: {question}. {signature}"


def generar_reflejo(avatar: str, pregunta: str, respuesta: str) -> str:
    del avatar, pregunta

    normalized = respuesta.lower()
    selected = next((term for term in KEY_TERMS if re.search(rf"\b{term}\b", normalized)), "simbolo")
    return f"El {selected} revela una clave: observa antes de actuar."
