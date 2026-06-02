import os
import sys


ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from services.knowledge_service.knowledge_index import KnowledgeBase, parse_frontmatter


def test_parse_frontmatter_with_list_values():
    frontmatter, body = parse_frontmatter(
        """---
title: Nota de Prueba
tags:
  - tarot
  - memoria
published: false
---
# Cuerpo
Texto."""
    )

    assert frontmatter["title"] == "Nota de Prueba"
    assert frontmatter["tags"] == ["tarot", "memoria"]
    assert frontmatter["published"] is False
    assert "# Cuerpo" in body


def test_knowledge_base_indexes_and_searches_markdown(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    note = vault / "Tarot como Memoria.md"
    note.write_text(
        """---
tags: [tarot, memoria]
---
# Tarot como Memoria

El tarot funciona como una interfaz simbólica de memoria e intención.
Conecta arcanos, preguntas y contexto vivo de Velora.
""",
        encoding="utf-8",
    )

    knowledge_base = KnowledgeBase(vault_path=str(vault), max_chunk_chars=500)
    results = knowledge_base.search("memoria tarot velora", limit=3)

    assert results
    assert results[0]["title"] == "Tarot como Memoria"
    assert results[0]["relative_path"] == "Tarot como Memoria.md"
    assert "tarot" in results[0]["tags"]

    context = knowledge_base.format_context(results)
    assert "Fuente: Tarot como Memoria.md" in context
    assert "interfaz simbólica" in context
