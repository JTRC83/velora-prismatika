import os
import sys
import time


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


def test_knowledge_base_detects_new_files_without_force_reload(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "Primera.md").write_text("# Primera\nContenido inicial.", encoding="utf-8")

    kb = KnowledgeBase(vault_path=str(vault), max_chunk_chars=500)
    kb.refresh()
    assert len(kb.documents) == 1

    # Añadir un archivo nuevo sin llamar refresh(force=True)
    (vault / "Segunda.md").write_text("# Segunda\nContenido nuevo.", encoding="utf-8")
    time.sleep(0.05)

    # El próximo refresh() debería detectar el cambio automáticamente
    kb.refresh()
    assert len(kb.documents) == 2
    assert "Segunda.md" in [d.relative_path for d in kb.documents.values()]


def test_knowledge_base_detects_modified_files_without_force_reload(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    note = vault / "Nota.md"
    note.write_text("# Nota\nVersión original con palabra clave.", encoding="utf-8")

    kb = KnowledgeBase(vault_path=str(vault), max_chunk_chars=500)
    results = kb.search("clave", limit=5)
    assert results

    # Modificar el archivo sin llamar refresh(force=True)
    time.sleep(0.05)
    note.write_text("# Nota\nVersión modificada con palabra secreta.", encoding="utf-8")
    time.sleep(0.05)

    # El próximo refresh() debería detectar el cambio y reindexar
    kb.refresh()
    results = kb.search("secreta", limit=5)
    assert results
    assert "secreta" in results[0]["excerpt"]
