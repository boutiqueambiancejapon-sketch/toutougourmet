#!/usr/bin/env bash
# Builds the current commit of the server working copy (branch v2) and serves it
# as the private preview (service toutou-preview, 127.0.0.1:3001, behind Caddy).
# Usage, as administrator: ~/Toutou/deploy/preview.sh   (FORCE=1 to rebuild the same commit)
# Each build goes to its own folder; the served one is never touched during npm ci / next build.
set -euo pipefail

WORK=/home/administrator/Toutou
ROOT=/home/administrator/toutou-preview
RELEASES="$ROOT/releases"
KEEP=3
LOCK="$ROOT/preview.lock"

mkdir -p "$RELEASES"
exec 9>"$LOCK"
flock -n 9 || { echo "Un build de préversion est déjà en cours."; exit 0; }

SHA=$(git -C "$WORK" rev-parse --short=12 HEAD)
CURRENT_SHA=$(basename "$(readlink -f "$ROOT/current" 2>/dev/null || echo none)")
if [[ "$SHA" == "$CURRENT_SHA" && "${FORCE:-0}" != "1" ]]; then
  echo "Préversion déjà à jour ($SHA)."
  exit 0
fi

DEST="$RELEASES/$SHA"
echo "→ Build de la préversion $SHA"
rm -rf "$DEST"
mkdir -p "$DEST"
git -C "$WORK" archive HEAD | tar -x -C "$DEST"

cd "$DEST"
npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=4096 npm run build

ln -sfn "$DEST" "$ROOT/current.new"
mv -Tf "$ROOT/current.new" "$ROOT/current"

if systemctl cat toutou-preview >/dev/null 2>&1; then
  sudo /usr/bin/systemctl restart toutou-preview
  for i in $(seq 1 30); do
    if curl -fs -o /dev/null http://127.0.0.1:3001/; then echo "✓ Préversion en ligne : $SHA"; break; fi
    sleep 2
    [[ $i == 30 ]] && { echo "✗ La préversion ne répond pas : journalctl -u toutou-preview -n 50"; exit 1; }
  done
else
  echo "Service toutou-preview pas encore installé : build prêt dans $DEST."
fi

ls -1dt "$RELEASES"/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
