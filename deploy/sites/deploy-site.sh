#!/usr/bin/env bash
# Met en ligne la dernière version d'un site hébergé sur le VPS (hors Toutou Gourmet).
# Usage (administrator) : deploy-site.sh <nom> [--force]
# Construit dans /srv/sites/<nom>/releases/<sha> (le site servi n'est jamais touché pendant le build),
# garde 2 versions, réutilise node_modules si package-lock.json n'a pas changé, redémarre site@<nom>.
set -euo pipefail
NAME=${1:?nom du site}
FORCE=${2:-}
CONF=/home/administrator/Toutou/deploy/sites/sites.conf
read -r _ REPO PORT BRANCH < <(awk -v n="$NAME" '$1==n' "$CONF")
[[ -n "${REPO:-}" ]] || { echo "Site inconnu : $NAME"; exit 1; }
ROOT=/srv/sites/$NAME
SRC=/home/administrator/sites-src/$NAME
exec 9>"$ROOT/deploy.lock"; flock -n 9 || { echo "Déjà en cours."; exit 0; }
[[ -d "$SRC/.git" ]] || git clone -q "https://github.com/boutiqueambiancejapon-sketch/$REPO.git" "$SRC"
git -C "$SRC" fetch -q origin "$BRANCH"
SHA=$(git -C "$SRC" rev-parse --short=12 "origin/$BRANCH")
CUR=$(basename "$(readlink -f "$ROOT/current" 2>/dev/null || echo none)")
if [[ "$SHA" == "$CUR" && "$FORCE" != "--force" ]]; then echo "$NAME déjà à jour ($SHA)."; exit 0; fi
DEST=$ROOT/releases/$SHA
rm -rf "$DEST"; mkdir -p "$DEST"
git -C "$SRC" archive "origin/$BRANCH" | tar -x -C "$DEST"
PREV=$(readlink -f "$ROOT/current" 2>/dev/null || true)
if [[ -n "$PREV" && -d "$PREV/node_modules" ]] && cmp -s "$PREV/package-lock.json" "$DEST/package-lock.json"; then
  cp -al "$PREV/node_modules" "$DEST/node_modules"
else
  (cd "$DEST" && npm ci --no-audit --no-fund --silent)
fi
set -a; [[ -f "$ROOT/shared/.env" ]] && . "$ROOT/shared/.env"; set +a
(cd "$DEST" && NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 nice -n 10 npx next build)
chgrp -R sites "$DEST/.next" && chmod -R g+w "$DEST/.next"
ln -sfn "$DEST" "$ROOT/current.new" && mv -T "$ROOT/current.new" "$ROOT/current"
sudo systemctl restart "site@$NAME"
ls -1dt "$ROOT"/releases/* | tail -n +3 | xargs -r rm -rf
echo "✓ $NAME en ligne : $SHA (port $PORT)"
