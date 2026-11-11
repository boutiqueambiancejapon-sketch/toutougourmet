#!/usr/bin/env bash
# Dépose la clé API Cloudflare (DNS de toutou-gourmet.com) dans /srv/toutou/shared/.env après l'avoir testée.
# La clé n'est jamais affichée ni écrite dans l'historique. Lancer : bash ~/Toutou/deploy/cle-cloudflare.sh
set -euo pipefail
read -rsp "Colle la clé Cloudflare (seulement la clé, qui commence par cfut_) puis Entrée : " T; echo
T=$(printf '%s' "$T" | tr -d '[:space:]')
[[ "$T" == cfut_* || ${#T} -ge 40 ]] || { echo "Ça ne ressemble pas à une clé seule. Recommence en copiant uniquement la clé."; exit 1; }
R=$(curl -s -H "Authorization: Bearer $T" https://api.cloudflare.com/client/v4/user/tokens/verify)
if ! grep -q '"status":"active"' <<<"$R"; then echo "✗ Cloudflare refuse cette clé : rien n'est enregistré."; exit 1; fi
Z=$(curl -s -H "Authorization: Bearer $T" "https://api.cloudflare.com/client/v4/zones?name=toutou-gourmet.com")
grep -q '"name":"toutou-gourmet.com"' <<<"$Z" || { echo "✗ La clé marche mais ne voit pas toutou-gourmet.com : vérifie « Zone Resources ». Rien n'est enregistré."; exit 1; }
sudo sed -i '/^CLOUDFLARE_API_TOKEN=/d' /srv/toutou/shared/.env
printf 'CLOUDFLARE_API_TOKEN=%s\n' "$T" | sudo tee -a /srv/toutou/shared/.env >/dev/null
echo "✓ Clé valide, elle voit toutou-gourmet.com, et elle est enregistrée sur le serveur."
