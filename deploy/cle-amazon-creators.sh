#!/usr/bin/env bash
# Dépose l'identifiant et le secret de l'API Amazon Creators (Quel Robot Tondeuse, prix Amazon des deals) dans
# ~/.config/toutou/amazon.env après les avoir testés (jeton Amazon, région Europe). Rien n'est affiché ni gardé dans l'historique.
# Lancer : bash ~/Toutou/deploy/cle-amazon-creators.sh
set -euo pipefail
read -rp "Credential ID (commence par amzn1.application-oa2-client.) : " ID
read -rsp "Credential Secret (colle seulement le secret) : " SEC; echo
read -rp "Identifiant partenaire Amazon.fr (ex. monsite-21) : " TAG
ID=$(printf '%s' "$ID" | tr -d '[:space:]'); SEC=$(printf '%s' "$SEC" | tr -d '[:space:]'); TAG=$(printf '%s' "$TAG" | tr -d '[:space:]')
[[ $ID == amzn1.application-oa2-client.* && ${#SEC} -ge 20 && $TAG == *-21 ]] || { echo "Identifiant, secret ou identifiant partenaire incomplet : rien n'est enregistré."; exit 1; }
B=$(python3 -c 'import json,sys;print(json.dumps({"grant_type":"client_credentials","client_id":sys.argv[1],"client_secret":sys.argv[2],"scope":"creatorsapi::default"}))' "$ID" "$SEC")
R=$(curl -s --max-time 20 -X POST -H 'Content-Type: application/json' -d "$B" https://api.amazon.co.uk/auth/o2/token)
T=$(python3 -c 'import json,sys;print(json.loads(sys.stdin.read()).get("access_token",""))' <<<"$R" 2>/dev/null || true)
[[ -n $T ]] || { echo "✗ Amazon refuse ces identifiants (région Europe) : rien n'est enregistré."; exit 1; }
# Essai d'accès au catalogue (un ASIN de test) : l'accès demande 10 ventes qualifiées sur 30 jours.
C=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X POST https://creatorsapi.amazon/catalog/v1/getItems -H "Authorization: Bearer $T" -H 'Content-Type: application/json' -H 'x-marketplace: www.amazon.fr' -d "{\"itemIds\":[\"B0CJ4F3ZJN\"],\"itemIdType\":\"ASIN\",\"marketplace\":\"www.amazon.fr\",\"partnerTag\":\"$TAG\",\"resources\":[\"offersV2.listings.price\"]}")
mkdir -p ~/.config/toutou && umask 077
printf 'AMAZON_CREATORS_ID=%s\nAMAZON_CREATORS_SECRET=%s\nAMAZON_PARTNER_TAG=%s\n' "$ID" "$SEC" "$TAG" > ~/.config/toutou/amazon.env
chmod 600 ~/.config/toutou/amazon.env
if [[ $C == 200 ]]; then echo "✓ Identifiants valides et catalogue accessible : enregistrés."; else echo "✓ Identifiants valides, enregistrés. Catalogue pas encore ouvert (code $C) : Amazon demande 10 ventes en 30 jours."; fi
