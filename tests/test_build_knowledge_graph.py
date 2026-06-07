import os
import sys


ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from scripts.build_knowledge_graph import enrich_obsidian_links, stage_vault_markdown


def test_stage_vault_markdown_excludes_obsidian_metadata(tmp_path):
    vault = tmp_path / "vault"
    vault.mkdir()
    (vault / "Visible.md").write_text("# Visible\n", encoding="utf-8")
    (vault / ".obsidian").mkdir()
    (vault / ".obsidian" / "Hidden.md").write_text("# Hidden\n", encoding="utf-8")

    staged = stage_vault_markdown(vault, tmp_path / "stage")

    assert [path.name for path in staged] == ["Visible.md"]
    assert not (tmp_path / "stage" / ".obsidian" / "Hidden.md").exists()


def test_enrich_obsidian_links_resolves_aliases_anchors_and_missing_links(tmp_path):
    stage = tmp_path / "stage"
    stage.mkdir()
    (stage / "A.md").write_text("[[Folder/B#intro|B visible]]\n[[Missing]]", encoding="utf-8")
    (stage / "Folder").mkdir()
    (stage / "Folder" / "B.md").write_text("# B\n", encoding="utf-8")

    graph = {
        "directed": True,
        "multigraph": False,
        "graph": {},
        "nodes": [
            {"id": "a", "label": "A.md", "source_file": "A.md"},
            {"id": "b", "label": "B.md", "source_file": "Folder/B.md"},
        ],
        "links": [],
        "hyperedges": [],
    }

    summary = enrich_obsidian_links(graph, stage)

    assert summary["wikilink_occurrences"] == 2
    assert summary["wikilink_edges_added"] == 1
    assert summary["unresolved_count"] == 1
    assert graph["links"][0]["relation"] == "links_to"
    assert graph["links"][0]["source"] == "a"
    assert graph["links"][0]["target"] == "b"
    assert graph["links"][0]["target_file"] == "Folder/B.md"
