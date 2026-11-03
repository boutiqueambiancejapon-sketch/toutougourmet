#!/usr/bin/env bash
# Couvertures d'articles des sites hébergés : génère l'image manquante des articles publiés dans les 7 derniers jours.
# Usage (administrator) : covers.sh [--dry] [--site=<nom>] [--only=<slug>] [--max=N] [--no-push]
# Lancé chaque matin par site-covers.timer. Journal : ~/sites-logs/covers-AAAA-MM-JJ.log.
# En cas d'échec : message ntfy sans détail (NTFY_SERVER / NTFY_TOPIC de ~/.config/toutou/alerts.env).
set -uo pipefail
HERE=$(cd "$(dirname "$0")" && pwd)
LOGDIR=$HOME/sites-logs
mkdir -p "$LOGDIR"
LOG=$LOGDIR/covers-$(TZ=Europe/Paris date +%F).log
exec 9>"$HOME/.toutou-covers.lock"
flock -n 9 || { echo "Un passage est déjà en cours." | tee -a "$LOG"; exit 0; }

node "$HERE/cover-images.mjs" "$@" 2>&1 | tee -a "$LOG"
STATUS=${PIPESTATUS[0]}

if [[ $STATUS -ne 0 && " $* " != *" --dry "* ]]; then
  if [[ -f $HOME/.config/toutou/alerts.env ]]; then
    set -a; . "$HOME/.config/toutou/alerts.env"; set +a
    if [[ -n "${NTFY_SERVER:-}" && -n "${NTFY_TOPIC:-}" ]]; then
      curl -s -o /dev/null --max-time 15 -H "Title: Couvertures d'articles" -H "Priority: default" \
        -d "Le passage du $(TZ=Europe/Paris date +%d/%m) a rencontré un problème. Voir le journal covers-$(TZ=Europe/Paris date +%F).log sur le serveur." \
        "$NTFY_SERVER/$NTFY_TOPIC" || true
    fi
  fi
fi
exit "$STATUS"
