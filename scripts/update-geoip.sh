#!/usr/bin/env bash
# Met à jour la base de pays DB-IP country lite (CC BY 4.0, format MaxMind DB) lue par
# lib/server/geo.ts et scripts/lib/geo.mjs. Lancé chaque mois par deploy/toutou-geoip.timer.
# Prend le fichier du mois courant, sinon celui du mois précédent (publié en début de mois).
# Vérifie qu'il se décompresse et pèse plus de 1 Mo, puis remplace l'ancien d'un seul coup (mv).
# Le site relit le fichier dans l'heure (lib/server/geo.ts), sans redémarrage.
# Usage : GEOIP_DB=/var/lib/toutou-geo/dbip-country-lite.mmdb scripts/update-geoip.sh
set -euo pipefail

DEST="${GEOIP_DB:-/var/lib/toutou-geo/dbip-country-lite.mmdb}"
DIR="$(dirname "$DEST")"
MIN_BYTES=1048576

# Fichiers temporaires dans le dossier cible : même disque (mv atomique) et groupe hérité (setgid).
TMP_GZ="$(mktemp "$DIR/.dbip-XXXXXX.gz")"
TMP_DB="$(mktemp "$DIR/.dbip-XXXXXX.mmdb")"
trap 'rm -f "$TMP_GZ" "$TMP_DB"' EXIT

fetched=""
for month in "$(date -u +%Y-%m)" "$(date -u -d "$(date -u +%Y-%m-01) -1 month" +%Y-%m)"; do
  url="https://download.db-ip.com/free/dbip-country-lite-${month}.mmdb.gz"
  if curl -fsSL --retry 3 --max-time 300 -o "$TMP_GZ" "$url"; then
    fetched="$month"
    break
  fi
  echo "[geoip] ${month} indisponible"
done
[ -n "$fetched" ] || { echo "[geoip] aucun fichier téléchargé" >&2; exit 1; }

gunzip -c "$TMP_GZ" > "$TMP_DB" || { echo "[geoip] décompression impossible" >&2; exit 1; }
size="$(stat -c %s "$TMP_DB")"
if [ "$size" -le "$MIN_BYTES" ]; then
  echo "[geoip] fichier trop petit (${size} octets), ancien fichier gardé" >&2
  exit 1
fi

chmod 0640 "$TMP_DB"
mv -f "$TMP_DB" "$DEST"
echo "[geoip] base ${fetched} installée (${size} octets) : $DEST"
