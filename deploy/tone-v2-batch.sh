#!/usr/bin/env bash
# Réécriture du ton V2 par lots (docs/tone-v2-queue.md), dans sa propre copie, jamais dans ~/Toutou.
# Usage : tone-v2-batch.sh [taille du lot] [nombre max de lots] [minutes max]. Lancé par
# toutou-tone.timer à 1 h. Ne tourne qu'entre 1 h et 8 h à Paris (décision du propriétaire) et
# s'arrête après 2 échecs de suite (alerte ntfy). Laisse passer les autres tâches de nuit.
# Journal : ~/toutou-seo-logs/tone-v2-AAAA-MM-JJ.log
set -uo pipefail
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin
SIZE=${1:-10}; MAX=${2:-1000}; MINUTES=${3:-420}
REPO=https://github.com/boutiqueambiancejapon-sketch/toutougourmet
WORK=$HOME/toutou-tone
LOGS=$HOME/toutou-seo-logs
mkdir -p "$LOGS"
LOG=$LOGS/tone-v2-$(TZ=Europe/Paris date +%F).log
exec 9>"$HOME/.toutou-tone.lock"
flock -n 9 || { echo "Une réécriture est déjà en cours."; exit 0; }
exec >>"$LOG" 2>&1
START=$(date +%s); FAILS=0; DONE=0

alert() {
  [[ -f $HOME/.config/toutou/alerts.env ]] || return 0
  set -a; . "$HOME/.config/toutou/alerts.env"; set +a
  [[ -n "${NTFY_SERVER:-}" && -n "${NTFY_TOPIC:-}" ]] || return 0
  curl -s -o /dev/null --max-time 15 -H "Title: Réécriture du ton" -d "$1" "$NTFY_SERVER/$NTFY_TOPIC" || true
}

[[ -d $WORK/.git ]] || git clone -q "$REPO" "$WORK"
cd "$WORK" || exit 1
git config user.name "$(git -C "$HOME/Toutou" config user.name)"; git config user.email "$(git -C "$HOME/Toutou" config user.email)"

while (( DONE < MAX && $(date +%s) - START < MINUTES * 60 )); do
  NOW=$(TZ=Europe/Paris date +%H%M | sed 's/^0*//;s/^$/0/')
  (( NOW < 100 || NOW >= 800 )) && { echo "Hors de la plage 1 h - 8 h : arrêt."; break; }
  # Un seul gros travail à la fois : le serveur a gelé le 2026-11-04 avec plusieurs constructions en parallèle.
  while (( $(awk '/MemAvailable/ {print int($2/1048576)}' /proc/meminfo) < 4 )) || pgrep -f '/\.bin/nex[t] build|write-articles\.s[h]|seo-rewrite\.s[h]' >/dev/null; do sleep 120; done
  # Copie de travail propre à ce script : un lot interrompu (redémarrage du serveur) ne doit pas la bloquer.
  if ! { git rebase --abort 2>/dev/null; git fetch -q origin v2 && git checkout -q -f -B tone-v2 origin/v2 && git clean -fdq -e node_modules; }; then
    FAILS=$((FAILS+1)); echo "✗ mise à jour impossible ($FAILS)"
    (( FAILS >= 2 )) && { alert "La réécriture du ton s'est arrêtée : mise à jour impossible. Voir le journal $(basename "$LOG")."; break; }
    sleep 60; continue
  fi
  SLUGS=$(grep -m "$SIZE" '^- \[ \] `' docs/tone-v2-queue.md | sed 's/.*`\(.*\)`.*/\1/')
  [[ -z $SLUGS ]] && { echo "File terminée."; alert "Tous les articles de la file sont réécrits."; break; }
  [[ -d node_modules ]] && [[ node_modules/.package-lock.json -nt package-lock.json ]] || npm ci --no-audit --no-fund --silent
  echo "=== $(date -Is) lot : $(echo "$SLUGS" | tr '\n' ' ')"
  BEFORE=$(git rev-parse HEAD)
  timeout 45m claude -p "$(cat deploy/tone-v2-prompt.md; printf '\n## Articles à traiter\n%s\n' "$SLUGS")" --permission-mode auto --output-format text </dev/null || echo "claude a terminé avec une erreur"
  if [[ $(git rev-parse HEAD) == "$BEFORE" ]]; then
    FAILS=$((FAILS+1)); echo "✗ aucun commit ($FAILS)"
    (( FAILS >= 2 )) && { alert "La réécriture du ton s'est arrêtée après 2 échecs. Voir le journal $(basename "$LOG")."; break; }
    continue
  fi
  git checkout -q -- . ; git clean -fdq -e node_modules
  PUSHED=0
  for i in 1 2 3; do
    git fetch -q origin v2
    if git rebase -q origin/v2 && git push -q origin HEAD:v2; then PUSHED=1; break; fi
    git rebase --abort 2>/dev/null || true
    sleep $((i * 15))
  done
  if (( PUSHED )); then FAILS=0; DONE=$((DONE+1)); echo "✓ $(git log -1 --format='%h %s' | cut -c1-120)"
  else FAILS=$((FAILS+1)); echo "✗ push impossible ($FAILS)"; (( FAILS >= 2 )) && { alert "La réécriture du ton n'arrive plus à pousser. Voir le journal $(basename "$LOG")."; break; }; fi
done
echo "=== $(date -Is) fin : $DONE lot(s)"
