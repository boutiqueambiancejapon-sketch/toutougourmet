#!/usr/bin/env bash
# Bloque un site référent abusif : au-delà du seuil de pages vues par heure, ses visites reçoivent une erreur 403.
# Le visiteur normal n'est pas touché. Pour lever le blocage : vider /etc/caddy/blocages.caddy puis recharger Caddy.
# Lancé par toutou-referer-guard.timer, en root, pour écrire dans /etc/caddy et recharger Caddy.
set -euo pipefail

REFERENT=aocr.org
SEUIL=100
BLOCAGES=/etc/caddy/blocages.caddy

grep -q "$REFERENT" "$BLOCAGES" 2>/dev/null && exit 0
VUES=$(sudo -u postgres psql -d toutou -Atc "SELECT count(*) FROM analytics.events WHERE name = 'Pageview' AND ref_host = '$REFERENT' AND ts > now() - interval '1 hour'")
echo "$REFERENT : $VUES pages vues en une heure (seuil $SEUIL)"
[ "$VUES" -lt "$SEUIL" ] && exit 0

cp "$BLOCAGES" "$BLOCAGES.avant"
printf '@referent_bloque header_regexp Referer ^https?://([a-z0-9-]+\\.)*%s\nrespond @referent_bloque 403\n' "${REFERENT//./\\.}" > "$BLOCAGES"
if caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1; then
  systemctl reload caddy
  echo "Bloqué : $REFERENT"
  MESSAGE="$REFERENT bloqué : $VUES pages vues en une heure."
else
  mv "$BLOCAGES.avant" "$BLOCAGES"
  echo "Configuration refusée, blocage annulé" >&2
  MESSAGE="$REFERENT dépasse le seuil, mais le blocage automatique a échoué."
fi
# Prévient le propriétaire par le même canal que les alertes du site.
SOURCE=$(ls /home/administrator/.config/toutou/alerts.env /srv/toutou/shared/.env 2>/dev/null | head -1)
TOPIC=$(grep -hE '^NTFY_TOPIC=' /home/administrator/.config/toutou/alerts.env /srv/toutou/shared/.env 2>/dev/null | head -1 | cut -d= -f2-)
SERVEUR=$(grep -hE '^NTFY_SERVER=' "$SOURCE" 2>/dev/null | head -1 | cut -d= -f2-)
if [ -n "$TOPIC" ]; then curl -fsS -m 15 -H 'Title: Toutou Gourmet' -d "$MESSAGE" "${SERVEUR:-https://ntfy.sh}/$TOPIC" >/dev/null || true; fi
