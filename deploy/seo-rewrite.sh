#!/usr/bin/env bash
# Contenu quotidien sur la branche v2, lancé par toutou-seo-rewrite.timer :
# 2 réécritures SEO (deploy/seo-rewrite-prompt.md),
# 2 fiches races converties au comparatif (deploy/race-compare-prompt.md), 10 articles aux références déplacées (deploy/citations-prompt.md), 4 nettoyages du ton.
# Travaille dans sa propre copie (~/toutou-seo), jamais dans le dossier de travail interactif ~/Toutou.
# Journal : ~/toutou-seo-logs/AAAA-MM-JJ.log
set -euo pipefail

REPO_URL=https://github.com/boutiqueambiancejapon-sketch/toutougourmet
WORK=/home/administrator/toutou-seo
LOGS=/home/administrator/toutou-seo-logs
LOCK=/home/administrator/.toutou-seo.lock
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin

mkdir -p "$LOGS"
exec 9>"$LOCK"
flock -n 9 || { echo "Une réécriture est déjà en cours."; exit 0; }
LOG="$LOGS/$(date +%F).log"
exec >>"$LOG" 2>&1
# Copie du compte rendu pour le tableau de bord (dossier lisible par l'utilisateur toutou)
trap 'install -m 640 "$LOG" /var/lib/toutou-seo-logs/ 2>/dev/null || true' EXIT
echo "=== $(date -Is) début"

[[ -d "$WORK/.git" ]] || git clone --quiet "$REPO_URL" "$WORK"
cd "$WORK"
git fetch --quiet origin v2
git checkout --quiet -B seo-daily origin/v2
git clean -fdq
npm ci --no-audit --no-fund --silent

BEFORE=$(git rev-parse HEAD)
echo "--- réécritures"
claude -p "$(cat deploy/seo-rewrite-prompt.md)" --permission-mode auto --output-format text || echo "claude (réécritures) a terminé avec une erreur"
git clean -fdq -e node_modules
echo "--- comparatif des fiches races (2 fiches)"
claude -p "$(cat deploy/race-compare-prompt.md)" --permission-mode auto --output-format text || echo "claude (comparatif races) a terminé avec une erreur"
git clean -fdq -e node_modules
echo "--- références déplacées vers Sources (10 articles)"
claude -p "$(cat deploy/citations-prompt.md)" --permission-mode auto --output-format text || echo "claude (références) a terminé avec une erreur"
git clean -fdq -e node_modules
echo "--- nettoyage du ton (4 articles)"
claude -p "$(cat deploy/tone-cleanup-prompt.md)" --permission-mode auto --output-format text || echo "claude (nettoyage du ton) a terminé avec une erreur"

if [[ "$(git rev-parse HEAD)" == "$BEFORE" ]]; then
  echo "Aucun commit : rien à pousser."
  exit 0
fi

# Intègre ce qui a été poussé entre-temps sur v2, puis pousse.
for i in 1 2 3; do
  git fetch --quiet origin v2
  if git rebase --quiet origin/v2 && git push --quiet origin HEAD:v2; then
    echo "✓ Poussé sur v2 : $(git log -1 --format='%h %s')"
    exit 0
  fi
  git rebase --abort 2>/dev/null || true
  sleep $((i * 10))
done
echo "✗ Push impossible (conflit) : commits gardés sur la branche locale seo-daily de $WORK"
exit 1
