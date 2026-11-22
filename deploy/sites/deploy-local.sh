#!/usr/bin/env bash
# Met en ligne un site dont le dépôt n'existe qu'en local sur le VPS (pas de GitHub), ex. ambiance-japon.
# Usage (administrator) : deploy-local.sh <nom> [--force]
# Même déroulé que deploy-site.sh, mais la source est la branche locale de ~/sites-src/<nom> (git archive), sans fetch.
set -euo pipefail
command -v vps-build >/dev/null || vps-build() { while [[ $1 != -- ]]; do shift; done; shift; "$@"; }
NAME=${1:?nom du site}
FORCE=${2:-}
CONF=/home/administrator/Toutou/deploy/sites/sites.conf
read -r _ REPO PORT BRANCH < <(awk -v n="$NAME" '$1==n' "$CONF")
[[ "${REPO:-}" == "-local" ]] || { echo "$NAME n'est pas un site local (colonne dépôt = -local)"; exit 1; }
ROOT=/srv/sites/$NAME
SRC=/home/administrator/sites-src/$NAME
[[ -d "$SRC/.git" ]] || { echo "Dépôt absent : $SRC"; exit 1; }
exec 9>"$ROOT/deploy.lock"; flock -n 9 || { echo "Déjà en cours."; exit 0; }
SHA=$(git -C "$SRC" rev-parse --short=12 "$BRANCH")
CUR=$(basename "$(readlink -f "$ROOT/current" 2>/dev/null || echo none)")
if [[ "$SHA" == "$CUR" && "$FORCE" != "--force" ]]; then echo "$NAME déjà à jour ($SHA)."; exit 0; fi
DEST=$ROOT/releases/$SHA
rm -rf "$DEST"; mkdir -p "$DEST"
git -C "$SRC" archive "$BRANCH" | tar -x -C "$DEST"
PREV=$(readlink -f "$ROOT/current" 2>/dev/null || true)
if [[ -n "$PREV" && -d "$PREV/node_modules" ]] && cmp -s "$PREV/package-lock.json" "$DEST/package-lock.json"; then
  cp -al "$PREV/node_modules" "$DEST/node_modules"
else
  (cd "$DEST" && vps-build --name "$NAME-npm-ci" -- npm ci --no-audit --no-fund --loglevel=error)
fi
set -a; [[ -f "$ROOT/shared/.env" ]] && . "$ROOT/shared/.env"; set +a
(cd "$DEST" && NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 vps-build --name "$NAME-deploy" -- npx next build)
chgrp -R sites "$DEST/.next" && chmod -R g+w "$DEST/.next"
ln -sfn "$DEST" "$ROOT/current.new" && mv -T "$ROOT/current.new" "$ROOT/current"
sudo systemctl restart "site@$NAME"
ls -1dt "$ROOT"/releases/* | tail -n +3 | xargs -r sudo rm -rf
echo "✓ $NAME en ligne : $SHA (port $PORT)"
