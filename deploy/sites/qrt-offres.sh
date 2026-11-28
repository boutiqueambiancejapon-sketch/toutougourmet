#!/usr/bin/env bash
# Relevé hebdomadaire des prix Cdiscount et Fnac (flux Awin) pour Quel Robot Tondeuse.
# Propriétaire : une fois par semaine (16/11/2026), puis deux fois par jour à 12 h et minuit (28/11/2026).
# Télécharge les flux (adresses privées dans ~/.config/toutou/awin.env), met à jour content/offres/offres.json
# dans une copie de travail à part, puis envoie sur la branche en ligne si les prix ont changé
# (la mise à jour automatique du site les publie dans l'heure).
set -euo pipefail
REPO=/home/administrator/sites-src/robot-tondeuse
WORK=/home/administrator/sites-work-offres
FEEDS=/home/administrator/.cache/qrt-feeds
BRANCH=claude/setup-nextjs-apple-guide-En4gb
mkdir -p "$FEEDS"; chmod 700 "$FEEDS"
set -a; . /home/administrator/.config/toutou/awin.env; set +a
curl -sf --max-time 1800 -o "$FEEDS/cdiscount.csv.gz.new" "$AWIN_FEED_CDISCOUNT" && mv "$FEEDS/cdiscount.csv.gz.new" "$FEEDS/cdiscount.csv.gz"
curl -sf --max-time 300 -o "$FEEDS/fnac.csv.gz.new" "$AWIN_FEED_FNAC" && mv "$FEEDS/fnac.csv.gz.new" "$FEEDS/fnac.csv.gz"
[[ -e "$WORK/.git" ]] || git -C "$REPO" worktree add -q --detach "$WORK"
cd "$WORK"
git fetch -q origin "$BRANCH"
git checkout -q -B offres "origin/$BRANCH"
node scripts/offres-awin.mjs "$FEEDS/cdiscount.csv.gz" "$FEEDS/fnac.csv.gz"
rm -f "$FEEDS/cdiscount.csv.gz"  # 700 Mo, retéléchargé chaque semaine
if git diff --quiet -- content/offres/offres.json; then echo "Prix inchangés."; exit 0; fi
git add content/offres/offres.json
git commit -qm "chore(offres): Cdiscount and Fnac prices (twice a day)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
for i in 1 2 3; do
  if git push -q origin "HEAD:$BRANCH"; then echo "Prix envoyés."; exit 0; fi
  git fetch -q origin "$BRANCH" && git rebase -q "origin/$BRANCH"
done
echo "Envoi impossible après 3 essais." >&2; exit 1
