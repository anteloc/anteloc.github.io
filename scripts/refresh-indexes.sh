#!/bin/bash
#
# Writes the gallery indexes the landing page loads, one per gallery folder,
# next to it:
#
#   models-gallery-nova/   ->  models-gallery-nova.json
#   models-gallery-mecha/  ->  models-gallery-mecha.json
#
# GitHub Pages has no backend, so each index lists every model with what its
# card and viewers need: title, part count (from the BOM), notes heading (the
# first "## " of its .md) and a URL for each of its files.
#
# Files that .gitattributes stores in Git LFS (*.glb, *.blend) are published by
# GitHub Pages only as small pointer files, so their "url" is GitHub's LFS media
# URL instead; "pages_url" keeps the Pages path. Other files are served by Pages
# and their URLs are relative to the site root.
#
# Usage: ./scripts/refresh-indexes.sh [--branch master] [gallery-folder ...]
#   --branch  the branch whose LFS files the media URLs point to (default: the
#             remote's default branch, or master)
# Run it after adding, removing or renaming gallery files, then commit the JSON.

set -euo pipefail

cd "$(dirname "$0")/.."

branch=""
folders=()
while [ $# -gt 0 ]; do
  case "$1" in
    --branch) branch="$2"; shift 2 ;;
    -h|--help) sed -n '2,23p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) folders+=("${1%/}"); shift ;;
  esac
done
if [ -z "$branch" ]; then
  branch="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||' || true)"
  branch="${branch:-master}"
fi
if [ ${#folders[@]} -eq 0 ]; then
  folders=(models-gallery-nova models-gallery-mecha)
fi

for folder in "${folders[@]}"; do
  if [ ! -d "$folder" ]; then
    echo "No such gallery folder: $folder" >&2
    exit 1
  fi
  python3 -I - "$folder" "$branch" <<'PYTHON'
import csv, json, re, subprocess, sys
from functools import partial
from pathlib import Path
from urllib.parse import quote

quote = partial(quote, safe="/")

folder, branch = Path(sys.argv[1]), sys.argv[2]
REPO = "anteloc/anteloc.github.io"
LFS_BASE = f"https://media.githubusercontent.com/media/{REPO}/{branch}/"
MODEL_SUFFIXES = (".mpd", ".ldr", ".dat")
# Same rules as the Docker apps' backend (ldraw.title_of).
TITLE_SKIP = ("Name:", "Author:", "!", "FILE", "NOFILE", "//", "BFC", "STEP")


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


files = sorted(p for p in folder.iterdir() if p.is_file() and not p.name.startswith("."))
lfs = {line.split(": ")[0] for line in git("check-attr", "filter", "--", *map(str, files)).splitlines()
       if line.endswith(": filter: lfs")}


def entry(path):
    item = {"path": path.as_posix(), "size": path.stat().st_size, "lfs": path.as_posix() in lfs}
    if item["lfs"]:
        pointer = path.read_text(errors="replace") if item["size"] < 1024 else ""
        size = re.search(r"^size (\d+)$", pointer, re.M)
        if size:
            item["size"] = int(size[1])  # the real file's, not the pointer's
        item["url"] = LFS_BASE + quote(path.as_posix())
        item["pages_url"] = quote(path.as_posix())
    else:
        item["url"] = quote(path.as_posix())
    return item


def title_of(path):
    """A model's title: the first line of a single-file model, or the line after `0 FILE`."""
    lines = []
    with path.open(encoding="utf-8", errors="replace") as fh:
        for _, line in zip(range(40), fh):
            if line.strip():
                lines.append(line.strip())
    if not lines:
        return ""
    index = 1 if lines[0].split()[:2] == ["0", "FILE"] else 0
    if index >= len(lines):
        return ""
    words = lines[index].split(None, 1)
    if len(words) < 2 or words[0] != "0" or words[1].startswith(TITLE_SKIP):
        return ""
    return words[1].strip()


def info_heading_of(path):
    """Text of the first ATX H2 in a model's notes, excluding fenced code."""
    fence = ""
    with path.open(encoding="utf-8-sig", errors="replace") as fh:
        for line in fh:
            marker = re.match(r"^ {0,3}(`{3,}|~{3,})(.*)$", line)
            if fence:
                if marker and marker[1][0] == fence[0] and len(marker[1]) >= len(fence) and not marker[2].strip():
                    fence = ""
                continue
            if marker and (marker[1][0] != "`" or "`" not in marker[2]):
                fence = marker[1]
                continue
            heading = re.match(r"^ {0,3}##(?:[ \t]+(.*)|[ \r\n]*$)", line)
            if heading:
                return re.sub(r"[ \t]+#+[ \t]*$", "", heading[1] or "").strip() or None
    return None


def part_count(path):
    """Total parts in a LeoCAD BOM (its Quantity column)."""
    try:
        with path.open(newline="", encoding="utf-8", errors="replace") as fh:
            reader = csv.DictReader(fh)
            if "Quantity" not in (reader.fieldnames or []):
                return None
            return sum(int(row["Quantity"]) for row in reader)
    except (OSError, KeyError, ValueError):
        return None


def committed(paths):
    """When the newest of a bundle's files was last committed (0 if never)."""
    out = git("log", "-1", "--format=%ct", "--", *map(str, paths)).strip()
    return int(out) if out else 0


# One bundle per base name: the model and its siblings (car.mpd, car.png, ...).
bundles = {}
for path in files:
    bundles.setdefault(path.stem, {})[path.suffix.lower().lstrip(".")] = path

models = []
for name, siblings in bundles.items():
    source = next((siblings[s.lstrip(".")] for s in MODEL_SUFFIXES if s.lstrip(".") in siblings), None)
    if not source and not ("glb" in siblings or "blend" in siblings):
        continue  # notes or images without a model
    main = source or siblings.get("glb") or siblings["blend"]
    file_entries = {kind: entry(path) for kind, path in siblings.items()}
    models.append({
        "name": name,
        "file": main.name,
        "description": title_of(source) if source else name.replace("-", " ").replace("_", " "),
        "info_heading": info_heading_of(siblings["md"]) if "md" in siblings else None,
        "parts": part_count(siblings["csv"]) if "csv" in siblings else None,
        "updated": committed(siblings.values()),
        "files": file_entries,
    })
models.sort(key=lambda m: (-m["updated"], m["name"]))

index = {
    "gallery": folder.name,
    "repository": REPO,
    "branch": branch,
    "lfs_base_url": LFS_BASE,
    "lfs_patterns": sorted({line.split()[0] for line in Path(".gitattributes").read_text().splitlines()
                            if "filter=lfs" in line}) if Path(".gitattributes").is_file() else [],
    "models": models,
}
out = Path(folder.name + ".json")
out.write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n")
print(f"{out}: {len(models)} models")
PYTHON
done
