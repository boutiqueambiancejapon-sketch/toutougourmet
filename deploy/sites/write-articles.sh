#!/usr/bin/env bash
# Rédaction de nuit des sites hébergés : 1 article par site, l'un après l'autre (un seul build à la fois).
# Usage (administrator) : write-articles.sh [--site=<nom>]. Lancé par site-articles.timer.
# Les consignes : deploy/sites/article-prompts/. Le serveur publie ensuite dans l'heure (site-deploy@)
# et site-covers.timer ajoute l'image le matin. Journal : ~/sites-logs/articles-AAAA-MM-JJ.log.
# Un site en échec n'arrête pas les suivants ; message ntfy sans détail à la fin.
set -uo pipefail
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin
HERE=$(cd "$(dirname "$0")" && pwd)
OWNER=boutiqueambiancejapon-sketch
WORK=$HOME/sites-writing
LOGDIR=$HOME/sites-logs
ONLY=""
for a in "$@"; do case "$a" in --site=*) ONLY=${a#--site=} ;; esac; done

mkdir -p "$WORK" "$LOGDIR"
DAY=$(TZ=Europe/Paris date +%F)
LOG=$LOGDIR/articles-$DAY.log
exec 9>"$HOME/.toutou-articles.lock"
flock -n 9 || { echo "Une rédaction est déjà en cours." | tee -a "$LOG"; exit 0; }
exec >>"$LOG" 2>&1

NAME=$(git -C "$HERE" config user.name || echo "$OWNER")
EMAIL=$(git -C "$HERE" config user.email || echo "$OWNER@users.noreply.github.com")
FAILED=""

write_one() {
  local site=$1 repo=$2 branch=$3 dir=$WORK/$1 prompt=$HERE/article-prompts/$1.md before
  [[ -f $prompt ]] || { echo "Pas de consigne pour $site"; return 1; }
  [[ -d $dir/.git ]] || git clone -q --branch "$branch" --single-branch "https://github.com/$OWNER/$repo.git" "$dir" || return 1
  cd "$dir" || return 1
  git config user.name "$NAME"; git config user.email "$EMAIL"
  git fetch -q origin "$branch" && git checkout -q -B writing "origin/$branch" && git clean -fdq -e node_modules || return 1
  before=$(git rev-parse HEAD)
  timeout 60m claude -p "$(cat "$HERE/article-prompts/_commun.md" "$prompt")" --permission-mode auto --output-format text || echo "claude a terminé avec une erreur ($site)"
  if [[ $(git rev-parse HEAD) == "$before" ]]; then echo "✗ $site : aucun commit"; return 1; fi
  # Rien d'autre que l'article : les fichiers laissés par le build sont jetés.
  git checkout -q -- . ; git clean -fdq -e node_modules
  for i in 1 2 3; do
    git fetch -q origin "$branch"
    if git rebase -q "origin/$branch" && git push -q origin "HEAD:$branch"; then
      echo "✓ $site poussé : $(git log -1 --format='%h %s')"; return 0
    fi
    git rebase --abort 2>/dev/null || true
    sleep $((i * 10))
  done
  echo "✗ $site : push impossible, commit gardé dans $dir"; return 1
}

while read -r site repo _port branch; do
  [[ -z ${site:-} || $site == \#* ]] && continue
  [[ -n $ONLY && $site != "$ONLY" ]] && continue
  echo "=== $(date -Is) $site"
  write_one "$site" "$repo" "$branch" || FAILED="$FAILED $site"
done < "$HERE/sites.conf"

if [[ -n $FAILED && -f $HOME/.config/toutou/alerts.env ]]; then
  set -a; . "$HOME/.config/toutou/alerts.env"; set +a
  if [[ -n "${NTFY_SERVER:-}" && -n "${NTFY_TOPIC:-}" ]]; then
    curl -s -o /dev/null --max-time 15 -H "Title: Articles de la nuit" -H "Priority: default" \
      -d "Pas d'article cette nuit pour :$FAILED. Voir le journal articles-$DAY.log sur le serveur." \
      "$NTFY_SERVER/$NTFY_TOPIC" || true
  fi
fi
echo "=== $(date -Is) fin (échecs :${FAILED:- aucun})"
[[ -z $FAILED ]]
