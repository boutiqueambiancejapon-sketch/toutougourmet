#!/usr/bin/env bash
# Déploie la dernière version de la branche de prod sur le VPS.
# Lancé par la GitHub Action (deploy-vps.yml) ou à la main : /srv/toutou/deploy.sh
# Principe : chaque version est construite dans son propre dossier (releases/<sha>),
# puis le lien "current" bascule dessus. La version en ligne n'est jamais touchée
# pendant le build (pas de npm ci dans le dossier servi).
set -euo pipefail

ROOT=/srv/toutou
REPO="$ROOT/repo"            # clone git (lecture seule, clé de déploiement)
RELEASES="$ROOT/releases"
SHARED="$ROOT/shared"        # .env, partagé entre les versions
BRANCH="${DEPLOY_BRANCH:-claude/toutou-gourmet-setup-3mRbP}"
KEEP=3                        # versions gardées pour revenir en arrière
LOCK="$ROOT/deploy.lock"

exec 9>"$LOCK"
flock -n 9 || { echo "Un déploiement est déjà en cours."; exit 0; }

git -C "$REPO" fetch --quiet origin "$BRANCH"
SHA=$(git -C "$REPO" rev-parse --short=12 "origin/$BRANCH")
CURRENT_SHA=$(basename "$(readlink -f "$ROOT/current" 2>/dev/null || echo none)")

if [[ "$SHA" == "$CURRENT_SHA" && "${FORCE:-0}" != "1" ]]; then
  echo "Déjà à jour ($SHA)."
  exit 0
fi

DEST="$RELEASES/$SHA"
echo "→ Build de $SHA"
rm -rf "$DEST"
mkdir -p "$DEST"
git -C "$REPO" archive "origin/$BRANCH" | tar -x -C "$DEST"
ln -sf "$SHARED/.env" "$DEST/.env.production.local"

cd "$DEST"
npm ci --no-audit --no-fund
NODE_OPTIONS=--max-old-space-size=4096 npm run build

echo "→ Bascule vers $SHA"
ln -sfn "$DEST" "$ROOT/current.new"
mv -Tf "$ROOT/current.new" "$ROOT/current"
sudo /usr/bin/systemctl restart toutou-web

# Contrôle : le site répond sur le port local
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    echo "✓ En ligne : $SHA"
    break
  fi
  sleep 2
  if [[ $i == 30 ]]; then
    echo "✗ Le site ne répond pas. Retour arrière : /srv/toutou/rollback.sh"
    exit 1
  fi
done

# Ménage : on garde les $KEEP versions les plus récentes
ls -1dt "$RELEASES"/*/ | tail -n +$((KEEP + 1)) | xargs -r rm -rf
