#!/usr/bin/env bash
# Dépose l'identifiant et la clé API LWS dans /srv/toutou/shared/.env après les avoir testés en mode test
# (X-Test-Mode : rien n'est acheté ni facturé). Rien n'est affiché ni gardé dans l'historique.
# Lancer : bash ~/Toutou/deploy/cle-lws.sh
set -euo pipefail
read -rp "Identifiant LWS (numéro de compte, X-Auth-Login) : " L
read -rsp "Clé API LWS (colle seulement la clé) : " K; echo
L=$(printf '%s' "$L" | tr -d '[:space:]'); K=$(printf '%s' "$K" | tr -d '[:space:]')
[[ -n "$L" && ${#K} -ge 20 ]] || { echo "Identifiant ou clé vide ou trop courte : rien n'est enregistré."; exit 1; }
C=$(curl -4 -s -o /tmp/lws-test.json -w '%{http_code}' -H "X-Auth-Login: $L" -H "X-Auth-Pass: $K" -H "X-Test-Mode: true" https://api.lws.net/v1/domain/extensions || true)
if [[ "$C" != 200 ]]; then echo "✗ LWS refuse (code $C) : rien n'est enregistré. Vérifie l'identifiant et la clé."; rm -f /tmp/lws-test.json; exit 1; fi
rm -f /tmp/lws-test.json
sudo sed -i '/^LWS_LOGIN=/d;/^LWS_API_KEY=/d' /srv/toutou/shared/.env
printf 'LWS_LOGIN=%s\nLWS_API_KEY=%s\n' "$L" "$K" | sudo tee -a /srv/toutou/shared/.env >/dev/null
echo "✓ LWS répond, identifiant et clé enregistrés sur le serveur."
