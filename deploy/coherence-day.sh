#!/usr/bin/env bash
# Relecture de cohérence en continu sur une journée (demande du propriétaire, 2026-11-09) : lots de 6 articles
# (deploy/coherence-prompt.md), chaque lot poussé sur v2 et mis en ligne, arrêt à l'heure donnée (Paris).
#   nohup setsid deploy/coherence-day.sh '2026-11-10 19:40' [prompt] [file] &
# Par défaut : deploy/coherence-prompt.md et docs/coherence-queue.md.
# Sa propre copie (~/toutou-coherence) : ne gêne ni ~/Toutou, ni les articles, ni la tâche de nuit.
set -uo pipefail
FIN=$(TZ=Europe/Paris date -d "${1:-today 19:40}" +%s)
PROMPT=${2:-deploy/coherence-prompt.md}
QUEUE=${3:-docs/coherence-queue.md}
NOM=$(basename "$PROMPT" -prompt.md)
REPO_URL=https://github.com/boutiqueambiancejapon-sketch/toutougourmet
WORK=/home/administrator/toutou-coherence
LOGS=/home/administrator/toutou-seo-logs
LOCK=/home/administrator/.toutou-day.lock
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin
mkdir -p "$LOGS"
exec 9>"$LOCK"
flock -n 9 || { echo "Une relecture est déjà en cours."; exit 0; }
exec >>"$LOGS/$(date +%F)-$NOM.log" 2>&1
avant_fin() { [[ $(date +%s) -lt $FIN ]]; }
reste() { grep -c '^- \[ \]' "$QUEUE"; }
[[ -d "$WORK/.git" ]] || git clone --quiet "$REPO_URL" "$WORK"
cd "$WORK"
lot=0
while avant_fin; do
  # La tâche de nuit ou un article en cours de publication : on attend qu'ils aient fini.
  while ! flock -n /home/administrator/.toutou-seo.lock true || ! flock -n /home/administrator/.toutou-article.lock true; do sleep 120; done
  lot=$((lot + 1))
  git fetch --quiet origin v2 && git checkout --quiet -B coherence origin/v2 && git clean -fdq -e node_modules
  [[ "$(reste)" -gt 0 ]] || { echo "File vide : fin."; break; }
  npm ci --no-audit --no-fund --silent
  BEFORE=$(git rev-parse HEAD)
  echo "=== $(date -Is) lot $lot ($(reste) articles restants)"
  claude -p "$(cat "$PROMPT")" --permission-mode auto --output-format text || echo "claude a terminé avec une erreur"
  if [[ "$(git rev-parse HEAD)" == "$BEFORE" ]]; then echo "Lot $lot : aucun commit"; sleep 60; continue; fi
  ok=0
  for i in 1 2 3; do
    git fetch --quiet origin v2
    if git rebase --quiet origin/v2 && git push --quiet origin HEAD:v2; then ok=1; break; fi
    git rebase --abort 2>/dev/null || true
    sleep $((i * 10))
  done
  if [[ $ok == 1 ]]; then
    echo "✓ Lot $lot poussé : $(git log -1 --format='%h %s')"
    sudo -n systemctl start toutou-deploy.service || echo "Mise en ligne à la prochaine heure pile."
  else
    echo "✗ Lot $lot : push impossible, commits gardés sur la branche locale coherence"
  fi
done
echo "=== $(date -Is) fin de journée : $lot lot(s)"
