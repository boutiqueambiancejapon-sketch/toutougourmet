#!/usr/bin/env bash
# Met en ligne un site dont le dépôt n'existe qu'en local sur le VPS (pas de GitHub), ex. ambiance-japon (socle neko-voyage).
# Usage (administrator) : deploy-local.sh <nom> [--force]
# Même déroulé que deploy-site.sh, mais la source est la branche locale de ~/sites-src/<nom> (git archive), sans fetch.
set -euo pipefail
command -v vps-build >/dev/null || vps-build() { while [[ $1 != -- ]]; do shift; done; shift; "$@"; }
NAME=${1:?nom du site}
FORCE=${2:-}
CONF=/home/administrator/Toutou/deploy/sites/sites.conf
read -r _ REPO PORT BRANCH < <(awk -v n="$NAME" '$1==n' "$CONF")
# Dépôt « -socle:<dépôt> » : plusieurs sites construits depuis un même dépôt local (~/sites-src/<dépôt>), la destination
# vient de SITE_DEST dans /srv/sites/<nom>/shared/.env ; destinations/<SITE_DEST>/public remplace public/ dans la version.
SRCNAME=$NAME
case "${REPO:-}" in
  -local) ;;
  -socle:*) SRCNAME=${REPO#-socle:} ;;
  *) echo "$NAME n'est pas un site local (colonne dépôt = -local ou -socle:<dépôt>)"; exit 1 ;;
esac
ROOT=/srv/sites/$NAME
SRC=/home/administrator/sites-src/$SRCNAME
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
if [[ "${REPO}" == -socle:* ]]; then
  # SITE_DEST absent ou « japon » : configuration d'Ambiance Japon à la racine du socle (pas de dossier destinations/japon).
  DEST_ID=${SITE_DEST:-japon}
  if [[ "$DEST_ID" != japon ]]; then
    [[ -d "$DEST/destinations/$DEST_ID" ]] || { echo "SITE_DEST inconnu pour $NAME : $DEST_ID"; exit 1; }
    if [[ -d "$DEST/destinations/$DEST_ID/public" ]]; then rm -rf "$DEST/public"; cp -a "$DEST/destinations/$DEST_ID/public" "$DEST/public"; fi
  fi
  # Retire les fichiers de route des autres destinations (HTML d'AJ identique, voir le script).
  if [[ -f "$DEST/scripts/usine/prune-routes.sh" ]]; then bash -euo pipefail "$DEST/scripts/usine/prune-routes.sh" "$DEST" "$DEST_ID"; fi
fi
(cd "$DEST" && NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 vps-build --name "$NAME-deploy" -- npx next build)
chgrp -R sites "$DEST/.next" && chmod -R g+w "$DEST/.next"
ln -sfn "$DEST" "$ROOT/current.new" && mv -T "$ROOT/current.new" "$ROOT/current"
sudo systemctl restart "site@$NAME"
ls -1dt "$ROOT"/releases/* | tail -n +3 | xargs -r sudo rm -rf
echo "✓ $NAME en ligne : $SHA (port $PORT)"
