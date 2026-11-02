#!/usr/bin/env bash
# Sauvegarde quotidienne de la base (cron, 3 h 15).
# Garde 7 copies locales, puis copie hors du serveur avec rclone si un remote "offsite" existe.
set -euo pipefail
umask 077   # sauvegardes lisibles par toutou seulement
DIR=/srv/toutou/backups
DB=toutou
mkdir -p "$DIR"
FILE="$DIR/$DB-$(date +%F).dump"
pg_dump -Fc "$DB" > "$FILE"
pg_restore -l "$FILE" > /dev/null   # vérifie que la copie est lisible
ls -1t "$DIR"/*.dump | tail -n +8 | xargs -r rm -f
if command -v rclone >/dev/null && rclone listremotes | grep -q '^offsite:'; then
  rclone copy "$FILE" offsite:toutou-backups/
fi
echo "✓ Sauvegarde $FILE"
