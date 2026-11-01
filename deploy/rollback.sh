#!/usr/bin/env bash
# Revient à la version précédente : /srv/toutou/rollback.sh
set -euo pipefail
ROOT=/srv/toutou
CURRENT=$(readlink -f "$ROOT/current")
PREV=$(ls -1dt "$ROOT"/releases/*/ | sed 's:/$::' | grep -vx "$CURRENT" | head -n 1)
[[ -z "$PREV" ]] && { echo "Aucune version précédente."; exit 1; }
ln -sfn "$PREV" "$ROOT/current.new"
mv -Tf "$ROOT/current.new" "$ROOT/current"
sudo /usr/bin/systemctl restart toutou-web
echo "✓ Revenu à $(basename "$PREV")"
