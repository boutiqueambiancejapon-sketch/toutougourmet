#!/usr/bin/env bash
# Réécriture SEO quotidienne (2 articles) sur la branche v2, lancée par toutou-seo-rewrite.timer.
# Travaille dans sa propre copie (~/toutou-seo), jamais dans le dossier de travail interactif ~/Toutou.
# Consigne : deploy/seo-rewrite-prompt.md. Journal : ~/toutou-seo-logs/AAAA-MM-JJ.log
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
echo "=== $(date -Is) début"

[[ -d "$WORK/.git" ]] || git clone --quiet "$REPO_URL" "$WORK"
cd "$WORK"
git fetch --quiet origin v2
git checkout --quiet -B seo-daily origin/v2
git clean -fdq
npm ci --no-audit --no-fund --silent

BEFORE=$(git rev-parse HEAD)
claude -p "$(cat deploy/seo-rewrite-prompt.md)" --permission-mode auto --output-format text || echo "claude a terminé avec une erreur"

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
