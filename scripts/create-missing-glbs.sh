#!/bin/bash
#
# Script to create missing GLB files on the given gallery directory
#
# Usage: ./scripts/create-missing-glbs.sh <gallery-directory>

if [ -z "$1" ]; then
  echo "Usage: ./scripts/create-missing-glbs.sh <gallery-directory>"
  exit 1
fi

GALLERY_DIR="$1"

# Find all .mpd files in the gallery directory that don't have a corresponding .glb file
find "$GALLERY_DIR" -type f -name "*.mpd" | while read -r file; do
  base_name=$(basename "$file" .mpd)
  glb_file="$(dirname "$file")/$base_name.glb"
  if [ ! -f "$glb_file" ]; then
    echo "Creating missing GLB for $file"
   mpd2glb.sh -l $LDRAW_DIR -c draco -o "$glb_file" "$file"
  fi
done

echo "Finished creating missing GLB files."