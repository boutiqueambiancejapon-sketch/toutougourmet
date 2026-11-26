#!/usr/bin/env bash
# Dépose la clé API Cloudflare « noms de domaine » (Registrar) dans /srv/toutou/shared/.env après l'avoir testée.
# Clé séparée de celle du DNS. Rien n'est acheté par ce script. La clé n'est jamais affichée ni gardée dans l'historique.
# Lancer : bash ~/Toutou/deploy/cle-cloudflare-registrar.sh
set -euo pipefail
read -rsp "Colle la clé Cloudflare Registrar (seulement la clé) puis Entrée : " T; echo
T=$(printf '%s' "$T" | tr -d '[:space:]')
[[ ${#T} -ge 40 ]] || { echo "Ça ne ressemble pas à une clé seule. Recommence en copiant uniquement la clé."; exit 1; }
R=$(curl -s -H "Authorization: Bearer $T" https://api.cloudflare.com/client/v4/user/tokens/verify)
grep -q '"status":"active"' <<<"$R" || { echo "✗ Cloudflare refuse cette clé : rien n'est enregistré."; exit 1; }
# Identifiant du compte : lu avec la clé DNS déjà enregistrée (zones du compte).
D=$(sudo grep '^CLOUDFLARE_API_TOKEN=' /srv/toutou/shared/.env | cut -d= -f2-)
A=$(curl -s -H "Authorization: Bearer $D" "https://api.cloudflare.com/client/v4/zones?per_page=1" | python3 -c 'import json,sys;print(json.load(sys.stdin)["result"][0]["account"]["id"])' 2>/dev/null || true)
[[ -n "$A" ]] || { echo "✗ Compte Cloudflare introuvable avec la clé DNS : rien n'est enregistré."; exit 1; }
L=$(curl -s -H "Authorization: Bearer $T" "https://api.cloudflare.com/client/v4/accounts/$A/registrar/domains")
grep -q '"success":true' <<<"$L" || { echo "✗ La clé marche mais n'a pas le droit « Registrar » sur ce compte : ajoute la permission Account › Registrar: Domains › Edit. Rien n'est enregistré."; exit 1; }
sudo sed -i '/^CLOUDFLARE_REGISTRAR_TOKEN=/d;/^CLOUDFLARE_ACCOUNT_ID=/d' /srv/toutou/shared/.env
printf 'CLOUDFLARE_REGISTRAR_TOKEN=%s\nCLOUDFLARE_ACCOUNT_ID=%s\n' "$T" "$A" | sudo tee -a /srv/toutou/shared/.env >/dev/null
echo "✓ Clé valide, elle voit les noms de domaine du compte, et elle est enregistrée sur le serveur."
