#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_VAULT_PATH = Path(
    os.getenv(
        "VELORA_VAULT_PATH",
        "/Users/joantoniramoncrespi/Documents/Velora Prism\u00e4tika",
    )
).expanduser()
DEFAULT_OUTPUT_DIR = Path(
    os.getenv("VELORA_KNOWLEDGE_GRAPH_DIR", PROJECT_ROOT / ".cache" / "knowledge-graph")
).expanduser()

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
EXCLUDED_DIRS = {".git", ".obsidian", ".trash"}


def normalize_link_key(value: str) -> str:
    value = value.strip().replace("\\", "/")
    value = re.sub(r"\.md$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"/+", "/", value)
    decomposed = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return value.casefold()


def parse_wikilink(raw: str) -> tuple[str, str | None]:
    target = raw.split("|", 1)[0].strip()
    target, _, anchor = target.partition("#")
    return target.strip(), anchor.strip() or None


def should_skip_path(path: Path, root: Path) -> bool:
    try:
        parts = path.relative_to(root).parts
    except ValueError:
        return True
    return any(part.startswith(".") or part in EXCLUDED_DIRS for part in parts)


def stage_vault_markdown(vault_path: Path, stage_dir: Path) -> list[Path]:
    if stage_dir.exists():
        shutil.rmtree(stage_dir)
    stage_dir.mkdir(parents=True, exist_ok=True)

    copied: list[Path] = []
    for source in sorted(vault_path.rglob("*.md")):
        if should_skip_path(source, vault_path):
            continue
        relative_path = source.relative_to(vault_path)
        target = stage_dir / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied.append(target)

    return copied


def require_graphify() -> tuple[Any, Any, Any, Any]:
    try:
        from graphify.build import build_from_json
        from graphify.export import to_json
        from graphify.extract import extract
    except ModuleNotFoundError as exc:
        message = (
            "Graphify no esta instalado en este entorno. Instala la dependencia opcional con:\n"
            "  python3 -m pip install -r requirements-graphify.txt\n"
            "Despues vuelve a ejecutar: npm run knowledge:graph"
        )
        raise RuntimeError(message) from exc

    return build_from_json, to_json, extract


def build_graphify_graph(
    stage_dir: Path,
    graphify_out_dir: Path,
    *,
    max_workers: int | None,
    parallel: bool,
) -> dict[str, Any]:
    build_from_json, to_json, extract = require_graphify()

    graphify_out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(stage_dir.rglob("*.md"))
    extraction = extract(
        files,
        cache_root=stage_dir,
        parallel=parallel,
        max_workers=max_workers,
    )
    graph = build_from_json(extraction, directed=True, root=stage_dir)

    graph_path = graphify_out_dir / "graph.json"
    to_json(graph, {}, str(graph_path), force=True)

    relation_counts = Counter(data.get("relation", "unknown") for _, _, data in graph.edges(data=True))
    file_type_counts = Counter(data.get("file_type", "unknown") for _, data in graph.nodes(data=True))

    return {
        "files_extracted": len(files),
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "relation_counts": dict(relation_counts.most_common()),
        "file_type_counts": dict(file_type_counts.most_common()),
        "graph_path": str(graph_path),
    }


def build_file_node_indexes(nodes: list[dict[str, Any]]) -> tuple[dict[str, str], dict[str, str]]:
    file_node_by_source: dict[str, str] = {}
    source_by_file_node: dict[str, str] = {}

    for node in nodes:
        source_file = node.get("source_file")
        label = str(node.get("label", ""))
        node_id = node.get("id")
        if source_file and node_id and label.endswith(".md"):
            source = str(source_file).replace("\\", "/")
            file_node_by_source[source] = str(node_id)
            source_by_file_node[str(node_id)] = source

    return file_node_by_source, source_by_file_node


def build_resolver(file_node_by_source: dict[str, str]):
    exact: dict[str, str] = {}
    basename: dict[str, list[str]] = {}
    suffix: dict[str, list[str]] = {}

    for source in file_node_by_source:
        no_ext = source.removesuffix(".md")
        exact[normalize_link_key(no_ext)] = source
        exact[normalize_link_key(source)] = source
        basename.setdefault(normalize_link_key(Path(no_ext).name), []).append(source)

        parts = no_ext.split("/")
        for index in range(len(parts)):
            suffix.setdefault(normalize_link_key("/".join(parts[index:])), []).append(source)

    def resolve(current_source: str, target: str) -> str | None:
        if not target:
            return None

        candidates = [
            normalize_link_key(target),
            normalize_link_key((Path(current_source).parent / target).as_posix()),
        ]
        for candidate in candidates:
            if candidate in exact:
                return exact[candidate]

        suffix_matches = suffix.get(normalize_link_key(target), [])
        if len(suffix_matches) == 1:
            return suffix_matches[0]

        base_matches = basename.get(normalize_link_key(Path(target).name), [])
        if len(base_matches) == 1:
            return base_matches[0]

        return None

    return resolve


def enrich_obsidian_links(graph_data: dict[str, Any], stage_dir: Path) -> dict[str, Any]:
    nodes = graph_data.get("nodes", [])
    links = graph_data.setdefault("links", [])
    graph_meta = graph_data.setdefault("graph", {})

    file_node_by_source, _ = build_file_node_indexes(nodes)
    resolve = build_resolver(file_node_by_source)

    path_by_source = {
        path.relative_to(stage_dir).as_posix(): path
        for path in sorted(stage_dir.rglob("*.md"))
        if not should_skip_path(path, stage_dir)
    }

    existing = {
        (
            link.get("source"),
            link.get("target"),
            link.get("relation"),
            link.get("source_file"),
        )
        for link in links
    }

    added: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []
    seen_targets: Counter[str] = Counter()

    for source, path in path_by_source.items():
        source_node = file_node_by_source.get(source)
        if not source_node:
            continue

        text = path.read_text(encoding="utf-8", errors="ignore")
        for match in WIKILINK_RE.finditer(text):
            target, anchor = parse_wikilink(match.group(1))
            seen_targets[target] += 1

            resolved_source = resolve(source, target)
            if not resolved_source:
                unresolved.append({"source_file": source, "target": target, "anchor": anchor})
                continue

            target_node = file_node_by_source.get(resolved_source)
            if not target_node or target_node == source_node:
                continue

            key = (source_node, target_node, "links_to", source)
            if key in existing:
                continue

            existing.add(key)
            edge = {
                "source": source_node,
                "target": target_node,
                "relation": "links_to",
                "context": "obsidian_wikilink",
                "confidence": "EXTRACTED",
                "confidence_score": 1.0,
                "source_file": source,
                "target_file": resolved_source,
                "source_location": f"L{text[:match.start()].count(chr(10)) + 1}",
                "weight": 1.4,
            }
            links.append(edge)
            added.append(
                {
                    "source_file": source,
                    "target_file": resolved_source,
                    "target": target,
                    "anchor": anchor,
                }
            )

    graph_meta["obsidian_wikilinks_enriched"] = True
    graph_meta["obsidian_wikilinks_added"] = len(added)

    return {
        "file_nodes": len(file_node_by_source),
        "wikilink_occurrences": sum(seen_targets.values()),
        "wikilink_edges_added": len(added),
        "unresolved_count": len(unresolved),
        "top_targets": seen_targets.most_common(20),
        "sample_edges": added[:30],
        "unresolved": unresolved[:50],
    }


def find_graphify_bin() -> str | None:
    env_path = os.getenv("GRAPHIFY_BIN")
    if env_path:
        return env_path

    local_bin = Path(sys.executable).with_name("graphify")
    if local_bin.exists():
        return str(local_bin)

    return shutil.which("graphify")


def run_cluster(output_dir: Path, graph_path: Path, *, no_viz: bool) -> None:
    graphify_bin = find_graphify_bin()
    if not graphify_bin:
        raise RuntimeError(
            "No encuentro el ejecutable `graphify`. Revisa que `graphifyy` este instalado "
            "en el mismo entorno de Python."
        )

    command = [
        graphify_bin,
        "cluster-only",
        str(output_dir),
        "--graph",
        str(graph_path),
        "--no-label",
    ]
    if no_viz:
        command.append("--no-viz")

    subprocess.run(command, check=True)


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def graph_relation_counts(graph_data: dict[str, Any]) -> dict[str, int]:
    counts = Counter(link.get("relation", "unknown") for link in graph_data.get("links", []))
    return dict(counts.most_common())


def top_connected_nodes(graph_data: dict[str, Any], limit: int = 20) -> list[dict[str, Any]]:
    nodes_by_id = {node.get("id"): node for node in graph_data.get("nodes", [])}
    degree: Counter[str] = Counter()
    for link in graph_data.get("links", []):
        source = link.get("source")
        target = link.get("target")
        if source:
            degree[str(source)] += 1
        if target:
            degree[str(target)] += 1

    top_nodes = []
    for node_id, count in degree.most_common(limit):
        node = nodes_by_id.get(node_id, {})
        top_nodes.append(
            {
                "id": node_id,
                "label": node.get("label", node_id),
                "source_file": node.get("source_file"),
                "degree": count,
                "community": node.get("community"),
            }
        )
    return top_nodes


def write_markdown_summary(path: Path, summary: dict[str, Any]) -> None:
    relation_lines = [
        f"- {relation}: {count}"
        for relation, count in summary["relation_counts"].items()
    ]
    target_lines = [
        f"- `{target}`: {count}"
        for target, count in summary["obsidian_links"]["top_targets"][:12]
    ]
    node_lines = [
        f"- `{node['label']}` ({node['degree']} edges) - `{node.get('source_file')}`"
        for node in summary["top_connected_nodes"][:15]
    ]

    lines = [
        "# Velora Knowledge Graph",
        "",
        f"- Vault: `{summary['vault_path']}`",
        f"- Output: `{summary['output_dir']}`",
        f"- Markdown files staged: {summary['markdown_files_staged']}",
        f"- Nodes: {summary['nodes']}",
        f"- Edges: {summary['edges']}",
        f"- Communities: {summary.get('communities', 'not clustered')}",
        f"- Obsidian wikilinks detected: {summary['obsidian_links']['wikilink_occurrences']}",
        f"- Obsidian `links_to` edges added: {summary['obsidian_links']['wikilink_edges_added']}",
        f"- Unresolved wikilinks: {summary['obsidian_links']['unresolved_count']}",
        "",
        "## Relation Counts",
        *relation_lines,
        "",
        "## Top Wikilink Targets",
        *target_lines,
        "",
        "## Top Connected Nodes",
        *node_lines,
        "",
        "## Notes",
        "- The vault is read-only for this script; generated files live in the output directory.",
        "- PDFs and non-Markdown files are not extracted in this controlled pass.",
        "- No LLM labeling is used; communities keep numeric labels.",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def build_summary(
    *,
    vault_path: Path,
    output_dir: Path,
    graph_path: Path,
    markdown_files_staged: int,
    graphify_summary: dict[str, Any],
    obsidian_summary: dict[str, Any],
) -> dict[str, Any]:
    graph_data = load_json(graph_path)
    communities = {
        node.get("community")
        for node in graph_data.get("nodes", [])
        if node.get("community") is not None
    }

    return {
        "vault_path": str(vault_path),
        "output_dir": str(output_dir),
        "graph_path": str(graph_path),
        "report_path": str(graph_path.parent / "GRAPH_REPORT.md"),
        "html_path": str(graph_path.parent / "graph.html"),
        "markdown_files_staged": markdown_files_staged,
        "nodes": len(graph_data.get("nodes", [])),
        "edges": len(graph_data.get("links", [])),
        "communities": len(communities) if communities else None,
        "relation_counts": graph_relation_counts(graph_data),
        "top_connected_nodes": top_connected_nodes(graph_data),
        "graphify": graphify_summary,
        "obsidian_links": obsidian_summary,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build the Velora knowledge graph from the Obsidian vault."
    )
    parser.add_argument(
        "--vault",
        default=str(DEFAULT_VAULT_PATH),
        help="Path to the Obsidian vault. Defaults to VELORA_VAULT_PATH.",
    )
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUTPUT_DIR),
        help="Output directory for the staged vault and graphify-out files.",
    )
    parser.add_argument(
        "--skip-cluster",
        action="store_true",
        help="Write the enriched graph without regenerating GRAPH_REPORT.md or graph.html.",
    )
    parser.add_argument(
        "--no-viz",
        action="store_true",
        help="Skip graph.html generation during clustering.",
    )
    parser.add_argument(
        "--parallel",
        action="store_true",
        help="Enable Graphify parallel extraction. Disabled by default for local stability.",
    )
    parser.add_argument(
        "--max-workers",
        type=int,
        default=None,
        help="Maximum Graphify extraction workers.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    vault_path = Path(args.vault).expanduser().resolve()
    output_dir = Path(args.out).expanduser().resolve()
    stage_dir = output_dir / "source"
    graphify_out_dir = output_dir / "graphify-out"
    graph_path = graphify_out_dir / "graph.json"

    if not vault_path.exists() or not vault_path.is_dir():
        print(f"Vault no encontrada: {vault_path}", file=sys.stderr)
        return 2

    output_dir.mkdir(parents=True, exist_ok=True)
    if graphify_out_dir.exists():
        shutil.rmtree(graphify_out_dir)

    staged_files = stage_vault_markdown(vault_path, stage_dir)
    graphify_summary = build_graphify_graph(
        stage_dir,
        graphify_out_dir,
        max_workers=args.max_workers,
        parallel=args.parallel,
    )

    graph_data = load_json(graph_path)
    obsidian_summary = enrich_obsidian_links(graph_data, stage_dir)
    write_json(graph_path, graph_data)
    write_json(graphify_out_dir / "OBSIDIAN_LINK_SUMMARY.json", obsidian_summary)

    if not args.skip_cluster:
        run_cluster(output_dir, graph_path, no_viz=args.no_viz)

    summary = build_summary(
        vault_path=vault_path,
        output_dir=output_dir,
        graph_path=graph_path,
        markdown_files_staged=len(staged_files),
        graphify_summary=graphify_summary,
        obsidian_summary=obsidian_summary,
    )
    write_json(graphify_out_dir / "CONTROLLED_SUMMARY.json", summary)
    write_markdown_summary(graphify_out_dir / "CONTROLLED_SUMMARY.md", summary)

    print(json.dumps(summary, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
