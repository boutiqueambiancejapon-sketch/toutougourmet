#!/bin/bash
# Applique les migrations Drizzle de la branche v2 à la base de production.
# Sauvegarde la base d'abord. Installé par le propriétaire (root:root, 755) : Claude peut le lancer, pas le modifier.
set -euo pipefail
REPO=/home/administrator/Toutou
D=$(mktemp -d)
trap 'rm -rf "$D"' EXIT
sudo -u toutou /srv/toutou/backup-db.sh
sudo -u administrator git -C "$REPO" fetch -q origin v2
sudo -u administrator git -C "$REPO" archive origin/v2 db drizzle.config.ts | tar -x -C "$D"
ln -s /srv/toutou/current/node_modules "$D/node_modules"
chmod -R a+rX "$D"
cd "$D"
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' /srv/toutou/current/node_modules/.bin/drizzle-kit migrate
echo MIGRATED
