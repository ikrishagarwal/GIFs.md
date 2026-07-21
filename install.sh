#!/usr/bin/env bash
set -euo pipefail

REPO="ikrishagarwal/GIFs.md"
REQUIRED_FILES=("manifest.json" "main.js")
OPTIONAL_FILES=("styles.css")
TARGET_DIR=".obsidian/plugins/gifs-md"

echo "Fetching latest release info from $REPO..."

LATEST=$(curl -sf "https://api.github.com/repos/$REPO/releases/latest") || {
    echo "Failed to fetch latest release. Check the repo name or your network connection."
    exit 1
}

if command -v jq &>/dev/null; then
    TAG=$(echo "$LATEST" | jq -r '.tag_name')
else
    TAG=$(echo "$LATEST" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
fi

if [ -z "$TAG" ] || [ "$TAG" = "null" ]; then
    echo "No releases found for $REPO."
    exit 1
fi

echo "Latest release tag: $TAG"

rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"

echo "Downloading files to $TARGET_DIR..."

for FILE in "${REQUIRED_FILES[@]}"; do
    URL="https://github.com/$REPO/releases/download/$TAG/$FILE"
    echo "  Downloading $FILE..."
    if ! curl -sfL -o "$TARGET_DIR/$FILE" "$URL"; then
        echo "  Error: Failed to download required file $FILE"
        exit 1
    fi
done

for FILE in "${OPTIONAL_FILES[@]}"; do
    URL="https://github.com/$REPO/releases/download/$TAG/$FILE"
    echo "  Downloading optional $FILE..."
    curl -sfL -o "$TARGET_DIR/$FILE" "$URL" || echo "  (Optional file $FILE not present in release, skipping)"
done

echo "Done. Files installed to $TARGET_DIR"
ls -la "$TARGET_DIR"
