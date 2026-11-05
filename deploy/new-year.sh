#!/usr/bin/env bash
# La nuit du 1er janvier : reconstruit le site pour que les titres passent à la nouvelle année (lib/title-year.ts).
# Les pages sont pré-générées et deploy.sh ignore un commit déjà en ligne : il lui faut un nouveau commit.
#   deploy/new-year.sh [--essai]
set -euo pipefail

REPO_URL=https://github.com/boutiqueambiancejapon-sketch/toutougourmet
WORK=/home/administrator/toutou-article
LOCK=/home/administrator/.toutou-article.lock
export PATH=/home/administrator/.local/bin:/usr/local/bin:/usr/bin:/bin
YEAR=$(TZ=Europe/Paris date +%Y)

exec 9>"$LOCK"
flock -w 3600 9
[[ -d "$WORK/.git" ]] || git clone --quiet "$REPO_URL" "$WORK"
cd "$WORK"
git fetch --quiet origin v2
git checkout --quiet -B new-year origin/v2
git -c user.name="Toutou Gourmet" -c user.email="boutiqueambiancejapon@gmail.com" commit --quiet --allow-empty -m "chore(seo): rebuild for $YEAR titles

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
if [[ "${1:-}" == "--essai" ]]; then
  git log -1 --format='Essai, rien poussé : %s'
  git checkout --quiet -B article origin/v2
  exit 0
fi
git push --quiet origin HEAD:v2
sudo -n systemctl start --no-block toutou-deploy.service
echo "✓ Reconstruction lancée pour $YEAR"
