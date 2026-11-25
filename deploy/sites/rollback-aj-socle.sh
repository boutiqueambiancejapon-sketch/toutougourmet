#!/usr/bin/env bash
# Retour arrière de la bascule du 25/11/2026 : Ambiance Japon revient sur son ancien dépôt ~/sites-src/ambiance-japon
# (gelé, branche main) au lieu du socle ~/sites-src/neko-voyage.
# Usage (administrator) : bash -euo pipefail ~/Toutou/deploy/sites/rollback-aj-socle.sh
# 1. sites.conf : ambiance-japon redevient « -local ».
# 2. Site : l'ancienne version (4b5d58593743) si elle est encore sur le disque (remise en service en quelques secondes),
#    sinon reconstruction depuis l'ancien dépôt (deploy-local.sh --force, quelques minutes).
# 3. Centre de contrôle : missions du Relecteur, du Rédacteur et du Documentaliste AJ et périmètre « ambiance-japon »
#    rendus à ~/sites-src/ambiance-japon (annulation du commit de bascule + base), puis réinstallation.
# Ensuite : commiter sites.conf dans ~/Toutou (branche depuis v2) et retirer la mention « gelé » du README d'AJ.
set -euo pipefail
HERE=/home/administrator/Toutou/deploy/sites
CONF=$HERE/sites.conf
ROOT=/srv/sites/ambiance-japon
OLD=$ROOT/releases/4b5d58593743
CONTROLE=/home/administrator/controle
CONTROLE_COMMIT=${CONTROLE_COMMIT:-04183f4}
DB=/var/lib/controle/controle.db

sed -i -E 's|^(ambiance-japon[[:space:]]+)-socle:neko-voyage( *)|\1-local\2            |' "$CONF"
awk '$1=="ambiance-japon"' "$CONF"

if [[ -d "$OLD/.next" && -d "$OLD/node_modules" ]]; then
  ln -sfn "$OLD" "$ROOT/current.new" && mv -T "$ROOT/current.new" "$ROOT/current"
  sudo systemctl restart site@ambiance-japon
else
  bash -euo pipefail "$HERE/deploy-local.sh" ambiance-japon --force
fi
sleep 5
curl -s -o /dev/null -w 'ambiance-japon : %{http_code}\n' -H 'host: ambiance-japon.com' http://127.0.0.1:3106/

if git -C "$CONTROLE" cat-file -e "$CONTROLE_COMMIT" 2>/dev/null; then
  cp -p "$DB" "/var/lib/controle/backups/controle-avant-retour-aj-$(date +%Y%m%d-%H%M).db"
  git -C "$CONTROLE" revert --no-edit "$CONTROLE_COMMIT"
  sudo systemctl stop controle.service
  sqlite3 "$DB" "UPDATE agents SET mission = replace(mission, '~/sites-src/neko-voyage (socle commun : Ambiance Japon = build sans SITE_DEST ; ne touche ni à destinations/ ni aux fichiers *.miami.*)', '~/sites-src/ambiance-japon') WHERE name IN ('Relecteur AJ', 'Rédacteur AJ', 'Documentaliste AJ')"
  (cd "$CONTROLE" && sudo -n bash -euo pipefail deploy/install.sh)
fi
echo "Retour arrière fait : Ambiance Japon sert $(readlink -f "$ROOT/current")"
