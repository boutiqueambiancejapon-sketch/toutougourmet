#!/usr/bin/env bash
# Lance l'outil DNS Cloudflare (scripts/dns.mjs) avec la clé du serveur, sous l'utilisateur toutou (le script passe par
# l'entrée standard : toutou ne lit pas ~/Toutou). Exemples :
#   deploy/dns.sh lister
#   deploy/dns.sh ajouter TXT openai-business-profile "openai-business-profile=…"            (essai)
#   deploy/dns.sh ajouter TXT openai-business-profile "openai-business-profile=…" --appliquer
set -euo pipefail
ICI=$(cd "$(dirname "$0")/.." && pwd)
sudo -n -u toutou bash -c 'cd /tmp && set -a && . /srv/toutou/shared/.env && set +a && exec node --input-type=module - "$@"' dns "$@" < "$ICI/scripts/dns.mjs"
