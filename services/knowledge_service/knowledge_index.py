import hashlib
import os
import re
import time
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence


DEFAULT_VAULT_PATH = "/Users/joantoniramoncrespi/Documents/Velora Prismätika"

STOPWORDS = {
    "a",
    "al",
    "algo",
    "ante",
    "como",
    "con",
    "cual",
    "cuando",
    "de",
    "del",
    "desde",
    "donde",
    "el",
    "ella",
    "en",
    "entre",
    "es",
    "esa",
    "ese",
    "eso",
    "esta",
    "este",
    "esto",
    "ha",
    "hay",
    "la",
    "las",
    "lo",
    "los",
    "mas",
    "me",
    "mi",
    "no",
    "o",
    "para",
    "por",
    "que",
    "se",
    "si",
    "sin",
    "su",
    "sus",
    "te",
    "tu",
    "un",
    "una",
    "y",
}


@dataclass
class KnowledgeDocument:
    id: str
    title: str
    path: str
    relative_path: str
    frontmatter: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)
    links: List[str] = field(default_factory=list)
    headings: List[str] = field(default_factory=list)
    excerpt: str = ""
    updated_at: float = 0.0


@dataclass
class KnowledgeChunk:
    id: str
    document_id: str
    title: str
    path: str
    relative_path: str
    heading: str
    text: str
    tags: List[str] = field(default_factory=list)
    links: List[str] = field(default_factory=list)


def normalize_text(value: str) -> str:
    decomposed = unicodedata.normalize("NFKD", value)
    ascii_text = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    return ascii_text.lower()


def tokenize(value: str) -> List[str]:
    normalized = normalize_text(value)
    return [
        token
        for token in re.findall(r"[a-z0-9]+", normalized)
        if len(token) > 1 and token not in STOPWORDS
    ]


def _stable_id(value: str) -> str:
    return hashlib.sha1(value.encode("utf-8")).hexdigest()[:16]


def _parse_scalar(value: str) -> Any:
    stripped = value.strip().strip('"').strip("'")
    if stripped.startswith("[") and stripped.endswith("]"):
        inner = stripped[1:-1].strip()
        if not inner:
            return []
        return [item.strip().strip('"').strip("'") for item in inner.split(",") if item.strip()]
    if stripped.lower() in {"true", "false"}:
        return stripped.lower() == "true"
    return stripped


def parse_frontmatter(raw_text: str) -> tuple[Dict[str, Any], str]:
    text = raw_text.replace("\r\n", "\n")
    if not text.startswith("---\n"):
        return {}, text

    end_marker = text.find("\n---\n", 4)
    if end_marker == -1:
        return {}, text

    frontmatter_text = text[4:end_marker]
    body = text[end_marker + len("\n---\n") :]
    frontmatter: Dict[str, Any] = {}
    current_key: Optional[str] = None

    for line in frontmatter_text.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue

        if current_key and line.strip().startswith("- "):
            frontmatter.setdefault(current_key, [])
            if isinstance(frontmatter[current_key], list):
                frontmatter[current_key].append(_parse_scalar(line.strip()[2:]))
            continue

        if ":" not in line:
            current_key = None
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            current_key = None
            continue

        if value:
            frontmatter[key] = _parse_scalar(value)
            current_key = None
        else:
            frontmatter[key] = []
            current_key = key

    return frontmatter, body


def _as_list(value: Any) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in re.split(r"[, ]+", value) if item.strip()]
    return [str(value).strip()]


def extract_tags(body: str, frontmatter: Dict[str, Any]) -> List[str]:
    tags = []
    for key in ("tags", "tag"):
        tags.extend(_as_list(frontmatter.get(key)))

    tags.extend(re.findall(r"(?<!\w)#([\wÁÉÍÓÚÜÑáéíóúüñ/-]+)", body))
    cleaned = []
    seen = set()
    for tag in tags:
        tag_value = tag.strip().lstrip("#")
        if not tag_value:
            continue
        key = normalize_text(tag_value)
        if key not in seen:
            cleaned.append(tag_value)
            seen.add(key)
    return cleaned


def extract_links(body: str) -> List[str]:
    links = []
    seen = set()
    for match in re.findall(r"\[\[([^\]]+)\]\]", body):
        target = match.split("|", 1)[0].split("#", 1)[0].strip()
        if not target:
            continue
        key = normalize_text(target)
        if key not in seen:
            links.append(target)
            seen.add(key)
    return links


def extract_headings(body: str) -> List[str]:
    return [match.strip() for match in re.findall(r"^#{1,6}\s+(.+)$", body, re.MULTILINE)]


def extract_title(body: str, frontmatter: Dict[str, Any], path: Path) -> str:
    frontmatter_title = frontmatter.get("title")
    if isinstance(frontmatter_title, str) and frontmatter_title.strip():
        return frontmatter_title.strip()

    headings = extract_headings(body)
    if headings:
        return headings[0]

    return path.stem


def clean_markdown(value: str) -> str:
    text = re.sub(r"```.*?```", " ", value, flags=re.DOTALL)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]", r"\1", text)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    text = re.sub(r"[*_~>]", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def compact_excerpt(value: str, max_chars: int = 520) -> str:
    text = re.sub(r"\s+", " ", clean_markdown(value)).strip()
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rsplit(" ", 1)[0].strip() + "…"


def split_long_text(value: str, max_chars: int) -> List[str]:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n", value) if part.strip()]
    chunks: List[str] = []
    current = ""

    for paragraph in paragraphs:
        if len(paragraph) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            words = paragraph.split()
            buffer = ""
            for word in words:
                candidate = f"{buffer} {word}".strip()
                if len(candidate) > max_chars and buffer:
                    chunks.append(buffer)
                    buffer = word
                else:
                    buffer = candidate
            if buffer:
                chunks.append(buffer)
            continue

        candidate = f"{current}\n\n{paragraph}".strip()
        if len(candidate) > max_chars and current:
            chunks.append(current)
            current = paragraph
        else:
            current = candidate

    if current:
        chunks.append(current)

    return chunks


def split_into_sections(body: str) -> List[tuple[str, str]]:
    sections: List[tuple[str, str]] = []
    current_heading = "Resumen"
    current_lines: List[str] = []

    for line in body.splitlines():
        heading_match = re.match(r"^(#{1,6})\s+(.+)$", line)
        if heading_match:
            if current_lines:
                sections.append((current_heading, "\n".join(current_lines).strip()))
            current_heading = heading_match.group(2).strip()
            current_lines = [line]
            continue
        current_lines.append(line)

    if current_lines:
        sections.append((current_heading, "\n".join(current_lines).strip()))

    return [(heading, text) for heading, text in sections if clean_markdown(text)]


class KnowledgeBase:
    def __init__(self, vault_path: Optional[str] = None, max_chunk_chars: int = 1400):
        self.vault_path = Path(vault_path or os.getenv("VELORA_VAULT_PATH", DEFAULT_VAULT_PATH)).expanduser()
        self.max_chunk_chars = max_chunk_chars
        self.documents: Dict[str, KnowledgeDocument] = {}
        self.chunks: List[KnowledgeChunk] = []
        self.indexed_at: Optional[float] = None
        self._vault_fingerprint: Optional[Dict[str, float]] = None

    def vault_exists(self) -> bool:
        return self.vault_path.exists() and self.vault_path.is_dir()

    def _calcular_fingerprint(self) -> Dict[str, float]:
        """Devuelve un mapa {ruta_relativa: st_mtime} de los .md de la bóveda."""
        fingerprint = {}
        if not self.vault_exists():
            return fingerprint
        for path in self.vault_path.rglob("*.md"):
            if any(part.startswith(".") for part in path.relative_to(self.vault_path).parts):
                continue
            try:
                rel = str(path.relative_to(self.vault_path))
                fingerprint[rel] = path.stat().st_mtime
            except OSError:
                continue
        return fingerprint

    def _boveda_cambiada(self) -> bool:
        """Compara el fingerprint actual con el guardado tras la última indexación."""
        if self._vault_fingerprint is None:
            return True
        actual = self._calcular_fingerprint()
        if set(actual.keys()) != set(self._vault_fingerprint.keys()):
            return True
        for ruta, mtime in actual.items():
            if self._vault_fingerprint.get(ruta) != mtime:
                return True
        return False

    def refresh(self, force: bool = False) -> None:
        if self.indexed_at and not force and not self._boveda_cambiada():
            return

        self.documents = {}
        self.chunks = []

        if not self.vault_exists():
            self.indexed_at = time.time()
            self._vault_fingerprint = {}
            return

        for path in sorted(self.vault_path.rglob("*.md")):
            if any(part.startswith(".") for part in path.relative_to(self.vault_path).parts):
                continue
            self._index_file(path)

        self.indexed_at = time.time()
        self._vault_fingerprint = self._calcular_fingerprint()

    def _index_file(self, path: Path) -> None:
        try:
            raw_text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            raw_text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return

        frontmatter, body = parse_frontmatter(raw_text)
        relative_path = str(path.relative_to(self.vault_path))
        document_id = _stable_id(relative_path)
        title = extract_title(body, frontmatter, path)
        tags = extract_tags(body, frontmatter)
        links = extract_links(body)
        headings = extract_headings(body)
        cleaned_body = clean_markdown(body)

        document = KnowledgeDocument(
            id=document_id,
            title=title,
            path=str(path),
            relative_path=relative_path,
            frontmatter=frontmatter,
            tags=tags,
            links=links,
            headings=headings,
            excerpt=compact_excerpt(cleaned_body),
            updated_at=path.stat().st_mtime,
        )
        self.documents[document_id] = document

        chunk_number = 0
        for heading, section_text in split_into_sections(body):
            for chunk_text in split_long_text(section_text, self.max_chunk_chars):
                cleaned_chunk = clean_markdown(chunk_text)
                if not cleaned_chunk:
                    continue
                chunk_id = _stable_id(f"{relative_path}:{chunk_number}:{heading}")
                self.chunks.append(
                    KnowledgeChunk(
                        id=chunk_id,
                        document_id=document_id,
                        title=title,
                        path=str(path),
                        relative_path=relative_path,
                        heading=heading,
                        text=cleaned_chunk,
                        tags=tags,
                        links=links,
                    )
                )
                chunk_number += 1

    def status(self) -> Dict[str, Any]:
        self.refresh()
        return {
            "vault_path": str(self.vault_path),
            "vault_exists": self.vault_exists(),
            "documents_indexed": len(self.documents),
            "chunks_indexed": len(self.chunks),
            "indexed_at": self.indexed_at,
            "sample_documents": [
                {
                    "id": document.id,
                    "title": document.title,
                    "relative_path": document.relative_path,
                }
                for document in list(self.documents.values())[:8]
            ],
        }

    def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        self.refresh()
        document = self.documents.get(document_id)
        if not document:
            return None
        return {
            "id": document.id,
            "title": document.title,
            "path": document.path,
            "relative_path": document.relative_path,
            "frontmatter": document.frontmatter,
            "tags": document.tags,
            "links": document.links,
            "headings": document.headings,
            "excerpt": document.excerpt,
            "updated_at": document.updated_at,
        }

    def search(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        self.refresh()
        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        results = []
        normalized_query = normalize_text(query.strip())

        for chunk in self.chunks:
            score = self._score_chunk(chunk, query_tokens, normalized_query)
            if score <= 0:
                continue
            results.append(
                {
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "title": chunk.title,
                    "path": chunk.path,
                    "relative_path": chunk.relative_path,
                    "heading": chunk.heading,
                    "excerpt": compact_excerpt(chunk.text),
                    "tags": chunk.tags,
                    "links": chunk.links,
                    "score": round(score, 3),
                }
            )

        results.sort(key=lambda item: item["score"], reverse=True)
        return results[: max(1, min(limit, 20))]

    def _score_chunk(self, chunk: KnowledgeChunk, query_tokens: Sequence[str], normalized_query: str) -> float:
        text = normalize_text(chunk.text)
        title = normalize_text(chunk.title)
        heading = normalize_text(chunk.heading)
        tags = normalize_text(" ".join(chunk.tags))
        links = normalize_text(" ".join(chunk.links))
        haystack = f"{title} {heading} {tags} {links} {text}"

        score = 0.0
        for token in query_tokens:
            if token in title:
                score += 4.0
            if token in heading:
                score += 3.0
            if token in tags:
                score += 2.5
            if token in links:
                score += 1.5
            occurrences = haystack.count(token)
            if occurrences:
                score += min(occurrences, 8) * 0.6

        if normalized_query and normalized_query in text:
            score += 6.0
        if normalized_query and normalized_query in title:
            score += 8.0

        return score

    def format_context(self, results: Sequence[Dict[str, Any]], max_chars: int = 3200) -> str:
        blocks = []
        current_length = 0

        for result in results:
            block = (
                f"Fuente: {result['relative_path']} > {result['heading']}\n"
                f"{result['excerpt']}"
            )
            if current_length + len(block) > max_chars:
                break
            blocks.append(block)
            current_length += len(block)

        return "\n\n---\n\n".join(blocks)
