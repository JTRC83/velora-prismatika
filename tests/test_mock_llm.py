import sys
import os

# Agrega la carpeta raíz del proyecto al path para que "orchestrator" sea importable
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))  # sube un nivel desde tests/
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import pytest
import re
from orchestrator import mock_llm

# Obtener firmas de los avatares
from orchestrator.mock_llm import AVATAR_FIRMAS, respuesta_avatar, generar_reflejo

@pytest.mark.parametrize("avatar, signature", list(AVATAR_FIRMAS.items()))
def test_response_avatar_ends_with_signature(avatar, signature):
    # Verificar que respuesta_avatar devuelve una cadena que termine con la firma del avatar
    try:
        result = respuesta_avatar(avatar, "¿Cómo está mi destino?")
    except Exception as e:
        pytest.fail(f"respuesta_avatar lanzó una excepción para {avatar}: {e}")
    assert isinstance(result, str), "La respuesta debe ser una cadena"
    assert result.strip().endswith(signature), f"La respuesta no termina con la firma para {avatar}"

def test_generar_reflejo_word_count_and_content():
    # Crear una respuesta de ejemplo con sustantivos conocidos
    sample_response = "El fuego arde en tu alma como llama sagrada que impulsa tu sombra."
    reflejo = generar_reflejo("sibylla", "¿Qué ves?", sample_response)
    assert isinstance(reflejo, str), "El reflejo debe ser una cadena"
    words = reflejo.split()
    assert len(words) <= 25, "El reflejo debe tener como máximo 25 palabras"
    # Verificar que al menos un sustantivo de sample_response aparezca en el reflejo
    assert re.search(r"\b(fuego|alma|sombra)\b", reflejo), "El reflejo debe contener uno de los sustantivos frecuentes"

@pytest.mark.parametrize("avatar", list(AVATAR_FIRMAS.keys()))
def test_respuesta_avatar_no_exception_and_non_empty(avatar):
    # Asegurarse de que respuesta_avatar no lance excepciones y devuelva contenido
    try:
        result = respuesta_avatar(avatar, "Prueba de pregunta")
    except Exception as e:
        pytest.fail(f"respuesta_avatar lanzó una excepción para {avatar}: {e}")
    assert isinstance(result, str), "La respuesta debe ser una cadena"
    assert result.strip() != "", "La respuesta no debe estar vacía"