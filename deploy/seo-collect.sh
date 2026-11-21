#!/usr/bin/env bash
# Relevés de nuit du tableau de bord SEO (toutou-seo-collect.timer, 04:10 UTC, hors créneaux d'articles de 7 h et 20 h).
# Chaque étape est indépendante : un échec est noté dans le journal et la suivante tourne quand même.
set -uo pipefail
cd /srv/toutou/current
TSX=node_modules/.bin/tsx
step() {
  echo "--- $1"
  shift
  "$@" || echo "échec : $?"
}
step "Search Console, 10 derniers jours (scripts/seo/collect-gsc.ts)" $TSX scripts/seo/collect-gsc.ts
step "notes automatiques (scripts/seo/notes-auto.ts)" $TSX scripts/seo/notes-auto.ts
step "audit des pages et liens internes (scripts/seo/audit.ts)" $TSX scripts/seo/audit.ts
step "inspection d'URL, 2 000 au plus (scripts/seo/inspect.ts)" $TSX scripts/seo/inspect.ts
echo "--- fin"
