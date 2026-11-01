#!/usr/bin/env bash
# Installation unique sur le VPS (Ubuntu 26.04, Caddy/Node/PostgreSQL déjà installés).
# Usage : sudo bash -c 'cd /srv/toutou/repo/deploy && bash setup-server.sh'
# Sans risque à relancer : chaque étape vérifie si elle est déjà faite.
set -euo pipefail
ROOT=/srv/toutou
REPO_URL=git@github.com:boutiqueambiancejapon-sketch/toutougourmet.git

# 1. Utilisateur dédié, sans mot de passe (connexion par clé uniquement)
id toutou >/dev/null 2>&1 || adduser --system --group --shell /bin/bash --home "$ROOT" toutou
mkdir -p "$ROOT"/{releases,shared,backups} "$ROOT/.ssh"
touch "$ROOT/shared/.env"
chmod 600 "$ROOT/shared/.env"

# 2. Clé de déploiement (lecture seule sur GitHub) pour cloner le repo privé
if [[ ! -f "$ROOT/.ssh/id_ed25519" ]]; then
  ssh-keygen -t ed25519 -N "" -C "toutou-vps-deploy" -f "$ROOT/.ssh/id_ed25519" >/dev/null
fi
ssh-keyscan -H github.com >> "$ROOT/.ssh/known_hosts" 2>/dev/null
touch "$ROOT/.ssh/authorized_keys"
chmod 700 "$ROOT/.ssh"; chmod 600 "$ROOT/.ssh/authorized_keys"
chown -R toutou:toutou "$ROOT"

# 3. Scripts de déploiement
install -m 755 -o toutou -g toutou deploy.sh rollback.sh backup-db.sh "$ROOT/"

# 4. Droit de redémarrer le site, et rien d'autre
echo 'toutou ALL=(root) NOPASSWD: /usr/bin/systemctl restart toutou-web' > /etc/sudoers.d/toutou
chmod 440 /etc/sudoers.d/toutou
visudo -cf /etc/sudoers.d/toutou >/dev/null

# 5. Service systemd
install -m 644 toutou-web.service /etc/systemd/system/toutou-web.service
systemctl daemon-reload
systemctl enable toutou-web >/dev/null

# 6. Base de données (connexion locale par l'utilisateur système toutou, sans mot de passe)
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='toutou'" | grep -q 1 \
  || sudo -u postgres createuser toutou
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='toutou'" | grep -q 1 \
  || sudo -u postgres createdb -O toutou toutou

# 7. Sauvegarde chaque nuit à 3 h 15
{ crontab -u toutou -l 2>/dev/null | grep -v backup-db.sh || true; echo "15 3 * * * $ROOT/backup-db.sh >> $ROOT/backups/backup.log 2>&1"; } | crontab -u toutou -

echo
echo "=== Clé publique de déploiement (à ajouter sur GitHub, lecture seule) ==="
cat "$ROOT/.ssh/id_ed25519.pub"
echo
echo "Ensuite, en tant que toutou :"
echo "  sudo -u toutou git clone $REPO_URL $ROOT/repo"
