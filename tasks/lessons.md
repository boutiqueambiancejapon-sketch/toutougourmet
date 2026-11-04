
## 2026-11-02 — Ne jamais committer après un build sans vérifier son code de sortie
Un `npm run build … | grep` dans une chaîne `&&` a laissé passer un build cassé (InfoBox mal fermé après une substitution perl `\s*$` qui avalait les retours à la ligne) : le commit est parti sur v2. La préversion n'a pas été touchée (le script garde l'ancienne version si le build échoue).
Règle : `npm run build > log 2>&1 || { tail log; exit 1; }` avant tout commit, et pas de `\s*$` dans une substitution perl ligne à ligne (utiliser `[ \t]*$`).

## 2026-11-03 — serveurs de test oubliés
- Des `next start` / `next dev` lancés par les chantiers (ports 3093, 3099, 3199) sont restés allumés des heures après la fin, ~500 Mo de mémoire.
- Règle : tout chantier arrête son serveur de test par son PID (`ss -ltnp | grep :PORT`) avant son compte rendu ; le coordinateur vérifie `ss -ltnp | grep next-server` après chaque compte rendu.

## 2026-11-03 — `public/sitemap*.xml` : plus rien à restaurer après un build
- Avant, le postbuild next-sitemap réécrivait `public/sitemap.xml`, `public/sitemap-0.xml` et `public/robots.txt` à chaque build (date du build partout) ; il fallait les restaurer avant de committer.
- Depuis `feat/sitemaps`, les sitemaps et robots.txt sont des routes (`app/sitemap.xml`, `app/sitemaps/[type]`, `app/robots.ts`) et ces fichiers n'existent plus. Règle : ne jamais recréer de `sitemap*.xml` ni de `robots.txt` dans `public/` (ils passeraient devant les routes). Nouvelle page statique indexable : l'ajouter à `data/page-dates.ts`.

## 2026-11-03 — Ration : « repas frais » n'est pas du BARF
- Le propriétaire (chien de 17 kg au BARF, 250 g par jour) a lu 661 g de « repas frais » : l'outil ne connaissait que le frais cuit livré (133 kcal/100 g, beaucoup d'eau).
- Règle : chaque type d'aliment a sa densité sourcée (croquettes 360, frais cuit 133, BARF cru 200). Un nouveau type d'aliment = une option et une densité, jamais un réemploi d'une autre.
- Contrôle : comparer le résultat au repère courant du type (BARF : 2 à 3 % du poids) avant de mettre en ligne.

## 2026-11-04 — Articles trop chiffrés et produit non vérifié
- Le propriétaire a trouvé l'article du calendrier de l'Avent ennuyeux : des calculs que personne ne lit, et une conclusion « pas une case entière sous 15 kg » tirée d'une estimation (poids trouvé chez un tiers × kcal d'une seule recette), contre la fiche Franklin qui dit « une case par jour ».
- Règle : partir de la page officielle du produit, écrire pour un maître de chien, un chiffre seulement s'il change la décision. Règle ajoutée à `deploy/new-article-prompt.md`.

## 2026-11-04 — Le serveur a gelé puis redémarré
- Vers 10 h 45 à Paris, plus aucun journal jusqu'au redémarrage de 10 h 51. Aucune trace de manque de mémoire ni d'arrêt propre : cause non prouvée. À ce moment tournaient la réécriture par lots, un chantier en parallèle et leurs constructions du site, en plus de 7 serveurs Next.
- Règle : une seule construction à la fois sur ce serveur. `tone-v2-batch.sh` attend qu'aucune autre ne tourne et qu'il reste 4 Go libres.
- `pgrep -f "next build"` se trouve lui-même dans la commande qui le lance : écrire `pgrep -f '/\.bin/nex[t] build'`.

## 2026-11-04 — Note fausse sur une étiquette italienne
- Les listes du scanner ne lisaient que le français et quelques mots d'anglais. Le premier vrai scan affichait « carne di agnello n'est ni une viande ni un poisson ». Contrôler un scan réel de bout en bout, explications comprises, dès qu'il arrive.
