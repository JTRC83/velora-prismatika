#!/usr/bin/env python3
"""
Builds a local macOS launcher app for Velora Prismätika.

It creates:
- launcher/assets/VeloraPrismatika.svg
- launcher/assets/VeloraPrismatika-1024.png
- launcher/assets/VeloraPrismatika.icns
- launcher/Velora Prismatika.app
"""

from __future__ import annotations

import base64
import os
import plistlib
import shutil
import stat
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_COLOR = Path(os.environ.get("VELORA_ICON_SOURCE", "/Users/joantoniramoncrespi/Desktop/Crowley/velora.png"))
LAUNCHER_DIR = ROOT / "launcher"
ASSETS_DIR = LAUNCHER_DIR / "assets"
APP_DIR = LAUNCHER_DIR / "Velora Prismatika.app"
CONTENTS_DIR = APP_DIR / "Contents"
MACOS_DIR = CONTENTS_DIR / "MacOS"
RESOURCES_DIR = CONTENTS_DIR / "Resources"
ICONSET_DIR = ASSETS_DIR / "VeloraPrismatika.iconset"
SVG_PATH = ASSETS_DIR / "VeloraPrismatika.svg"
PNG_1024 = ASSETS_DIR / "VeloraPrismatika-1024.png"
ICNS_PATH = ASSETS_DIR / "VeloraPrismatika.icns"


ICON_SIZES = {
    "icon_16x16.png": 16,
    "icon_16x16@2x.png": 32,
    "icon_32x32.png": 32,
    "icon_32x32@2x.png": 64,
    "icon_128x128.png": 128,
    "icon_128x128@2x.png": 256,
    "icon_256x256.png": 256,
    "icon_256x256@2x.png": 512,
    "icon_512x512.png": 512,
    "icon_512x512@2x.png": 1024,
}


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def ensure_tools() -> None:
    for tool in ("qlmanage", "sips", "iconutil"):
        if shutil.which(tool) is None:
            raise RuntimeError(f"No encuentro la herramienta de macOS requerida: {tool}")


def build_svg() -> None:
    if not SOURCE_COLOR.exists():
        raise FileNotFoundError(f"No existe la imagen base: {SOURCE_COLOR}")

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    image_data = base64.b64encode(SOURCE_COLOR.read_bytes()).decode("ascii")

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="roundedIcon">
      <rect x="34" y="34" width="956" height="956" rx="186" ry="186"/>
    </clipPath>
    <radialGradient id="glassGlow" cx="28%" cy="16%" r="86%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24"/>
      <stop offset="42%" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edgeGlass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.48"/>
      <stop offset="42%" stop-color="#d9f4ff" stop-opacity="0.14"/>
      <stop offset="62%" stop-color="#c89d42" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.28"/>
    </linearGradient>
    <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff1b8" stop-opacity="0.78"/>
      <stop offset="48%" stop-color="#b8860b" stop-opacity="0.56"/>
      <stop offset="100%" stop-color="#5d4513" stop-opacity="0.74"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="26" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
    <filter id="innerGlass" x="-15%" y="-15%" width="130%" height="130%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/>
      <feBlend in="SourceGraphic" in2="blur" mode="screen"/>
    </filter>
  </defs>

  <rect width="1024" height="1024" rx="210" fill="#07101f"/>
  <g filter="url(#softShadow)">
    <g clip-path="url(#roundedIcon)">
      <image href="data:image/png;base64,{image_data}" x="62" y="48" width="900" height="900" preserveAspectRatio="xMidYMid meet"/>
      <rect x="34" y="34" width="956" height="956" rx="186" fill="url(#glassGlow)"/>
      <rect x="34" y="34" width="956" height="956" rx="186" fill="none" stroke="#ffffff" stroke-opacity="0.11" stroke-width="28"/>
      <rect x="74" y="74" width="876" height="876" rx="150" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="14"/>
      <path d="M102 164c178-98 418-112 692-46" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="24" stroke-linecap="round"/>
      <path d="M92 830c232 70 520 68 838-52" fill="none" stroke="#000000" stroke-opacity="0.22" stroke-width="36" stroke-linecap="round"/>
    </g>
  </g>
  <rect x="34" y="34" width="956" height="956" rx="186" fill="none" stroke="url(#edgeGlass)" stroke-width="26" filter="url(#innerGlass)"/>
  <rect x="58" y="58" width="908" height="908" rx="166" fill="none" stroke="url(#goldEdge)" stroke-width="8"/>
  <rect x="86" y="86" width="852" height="852" rx="140" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3"/>
</svg>
"""
    SVG_PATH.write_text(svg, encoding="utf-8")


def render_png() -> None:
    # Quick Look writes <source-name>.png into the requested output directory.
    generated = ASSETS_DIR / f"{SVG_PATH.name}.png"
    if generated.exists():
        generated.unlink()
    run(["qlmanage", "-t", "-s", "1024", "-o", str(ASSETS_DIR), str(SVG_PATH)])
    if generated.exists():
        generated.replace(PNG_1024)
    if not PNG_1024.exists():
        raise RuntimeError("No se pudo renderizar el PNG principal del icono.")


def build_icns() -> None:
    if ICONSET_DIR.exists():
        shutil.rmtree(ICONSET_DIR)
    ICONSET_DIR.mkdir(parents=True)

    for name, size in ICON_SIZES.items():
        out = ICONSET_DIR / name
        run(["sips", "-z", str(size), str(size), str(PNG_1024), "--out", str(out)])

    if ICNS_PATH.exists():
        ICNS_PATH.unlink()
    run(["iconutil", "-c", "icns", str(ICONSET_DIR), "-o", str(ICNS_PATH)])


def write_app_bundle() -> None:
    MACOS_DIR.mkdir(parents=True, exist_ok=True)
    RESOURCES_DIR.mkdir(parents=True, exist_ok=True)

    shutil.copy2(ICNS_PATH, RESOURCES_DIR / "VeloraPrismatika.icns")

    plist = {
        "CFBundleDevelopmentRegion": "es",
        "CFBundleDisplayName": "Velora Prismätika",
        "CFBundleExecutable": "Velora Prismatika",
        "CFBundleIconFile": "VeloraPrismatika",
        "CFBundleIdentifier": "local.velora.prismatika.launcher",
        "CFBundleInfoDictionaryVersion": "6.0",
        "CFBundleName": "Velora Prismätika",
        "CFBundlePackageType": "APPL",
        "CFBundleShortVersionString": "1.0",
        "CFBundleVersion": "1",
        "LSMinimumSystemVersion": "12.0",
        "NSHighResolutionCapable": True,
    }
    with (CONTENTS_DIR / "Info.plist").open("wb") as handle:
        plistlib.dump(plist, handle)

    executable = MACOS_DIR / "Velora Prismatika"
    executable.write_text(
        f"""#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="{ROOT}"
LOG_DIR="$PROJECT_ROOT/.runtime/logs"
mkdir -p "$LOG_DIR"

osascript -e 'display notification "Arrancando Ollama, Qwen y Velora…" with title "Velora Prismätika"' >/dev/null 2>&1 || true
"$PROJECT_ROOT/scripts/start_velora.sh" --restart-stuck-ollama >>"$LOG_DIR/macos-launcher.log" 2>&1 &
""",
        encoding="utf-8",
    )
    executable.chmod(executable.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)


def main() -> None:
    ensure_tools()
    build_svg()
    render_png()
    build_icns()
    write_app_bundle()
    print(f"App creada: {APP_DIR}")
    print(f"Icono creado: {ICNS_PATH}")


if __name__ == "__main__":
    main()
