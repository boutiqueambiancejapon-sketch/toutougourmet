#!/usr/bin/env bash
# Un nouvel article sur la branche v2, mis en ligne dans la foulée (toutou-article-matin et -soir).
#   deploy/article.sh transactionnel | informatif
# Sa propre copie (~/toutou-article) : ne gêne ni ~/Toutou ni la tâche de nuit (~/toutou-seo).
set -euo pipefail

TYPE=${1:?type attendu : transactionnel ou informatif}
REPO_URL=https://github.com/boutiqueambiancejapon-sketch/toutougourmet
WORK=/home/administrator/toutou-article
LOGS=/home/administrator/toutou-seo-logs/articles
LOCK=/home/administrator/.toutou-article.lock
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin

mkdir -p "$LOGS"
exec 9>"$LOCK"
flock -n 9 || { echo "Un article est déjà en cours."; exit 1; }
exec >>"$LOGS/$(date +%F)-$TYPE.log" 2>&1
echo "=== $(date -Is) début ($TYPE)"

[[ -d "$WORK/.git" ]] || git clone --quiet "$REPO_URL" "$WORK"
cd "$WORK"
git fetch --quiet origin v2
git checkout --quiet -B article origin/v2
git clean -fdq -e node_modules
npm ci --no-audit --no-fund --silent

# Questions posées à Milo sans article du site (60 jours, les plus fréquentes) : sujets pour l'article informatif.
sudo -n -u postgres psql -d toutou -At -c "SELECT count(*) || '× ' || min(question) FROM analytics.assistant_questions WHERE kind = 'ia' AND created_at > now() - interval '60 days' GROUP BY lower(regexp_replace(question, '[^[:alnum:]]+', ' ', 'g')) ORDER BY count(*) DESC, max(created_at) DESC LIMIT 25" > "$LOGS/milo-sujets.txt" 2>/dev/null || : > "$LOGS/milo-sujets.txt"
BEFORE=$(git rev-parse HEAD)
claude -p "Type d'article aujourd'hui : $TYPE.

$(cat deploy/new-article-prompt.md)" --permission-mode auto --output-format text

if [[ "$(git rev-parse HEAD)" == "$BEFORE" ]]; then
  echo "✗ Aucun commit : pas d'article."
  exit 1
fi

for i in 1 2 3; do
  git fetch --quiet origin v2
  if git rebase --quiet origin/v2 && git push --quiet origin HEAD:v2; then
    echo "✓ Poussé sur v2 : $(git log -1 --format='%h %s')"
    sudo -n systemctl start --no-block toutou-deploy.service || echo "Mise en ligne à la prochaine heure pile."
    exit 0
  fi
  git rebase --abort 2>/dev/null || true
  sleep $((i * 10))
done
echo "✗ Push impossible (conflit) : commit gardé sur la branche locale article de $WORK"
exit 1
