Tâche quotidienne : réécrire et optimiser 2 articles existants du site Toutou Gourmet (www.toutou-gourmet.com), en français, selon la méthode fan-out IA du guide SEO/GEO du repo. Tu tournes sur le serveur de Toutou, dans une copie de travail de la branche `v2` (la V2 du site). Le site en ligne n'est pas modifié avant la bascule : tu ne touches JAMAIS à la branche de production.

## Avant d'écrire
1. Lire `CLAUDE.md` et `PROGRESS.md`.
2. Lire `docs/09-seo-geo-guide.md` EN ENTIER.
3. Charger le skill `boileau` (`.claude/skills/boileau/SKILL.md`) et appliquer ses règles dès le premier jet.
4. Ouvrir `docs/seo-rewrite-queue.md` et prendre les 2 premiers articles non cochés (`- [ ]`), de haut en bas.

## Pour chaque article (`content/blog/{slug}.mdx`)
Suivre §9 du guide :
- NE PAS toucher : nom de fichier/slug, `categorySlug`, `category`, `date`, chiffres sourcés justes, études citées, numéros de centres antipoison, composants MDX existants.
- Lister les sous-questions des six dimensions du fan-out (chien, aliment, quantité, situation, pourquoi, alternatives). Utiliser WebSearch (« Autres questions posées », saisie semi-automatique, Reddit/forums) pour trouver les sous-questions réelles. Vérifier toute nouvelle donnée chiffrée par une source (auteur, année, revue, DOI/PMID) ; sans source, ne pas l'écrire.
- Ajouter ce qui manque : en priorité un tableau par gabarit avec races nommées et quantités chiffrées (composant V2 `SizeTable` / `SizeRow`, voir §2.7 et l'article pilote `chien-peut-manger-poires`). Dans chaque `SizeRow`, l'attribut `amount` donne les grammes entre parenthèses sous la forme « (20 à 30 g) » ou « (15 g) » : le mini-calculateur de l'article lit ces valeurs, elles doivent être cohérentes avec le texte., une section « Que faire si… » pour tout aliment à risque (composant `WhatToDo` / `Step`, et `PoisonCenters` pour les urgences). Remplacer un ancien `CompareTable` par gabarit par `SizeTable`.
- Pour un article race (`categorySlug: "race"`) : la section « Que peut manger un [race] ? » est générée par le gabarit à partir de `data/breeds.ts` ; si l'article apporte une donnée de race sourcée (poids, espérance de vie, prédisposition), mettre aussi à jour la fiche de la race dans `data/breeds.ts` (mêmes règles : rien qui ne soit écrit et sourcé dans l'article).
- Rendre chaque paragraphe autonome (entité répétée, chiffre + unité dans la même phrase), transformer les H2 en questions naturelles, corriger les tics IA (boileau) sans réécrire ce qui est déjà propre. Ramener les tirets cadratins (—) à 2 au plus par article (deux-points, virgule, parenthèses ou nouvelle phrase) et supprimer les phrases-chutes dramatiques en fin de paragraphe. Tutoiement comme le reste du site.
- FAQ portée à 8 questions si pertinent. 2 à 4 liens internes avec ancres descriptives, vers des slugs qui existent réellement dans `content/blog/` ou `content/comparatifs/` (vérifier avec ls/grep, route `/chien/{categorySlug}/{slug}`).
- Ne créer AUCUNE nouvelle page race × question.
- Miniature de partage : renseigner ou vérifier dans le frontmatter `ogTitle` (titre court accrocheur, ≤ 40 caractères si possible, modèle « Poire : ton chien peut en manger ? »), et pour les articles « peut-il manger » et urgences `verdict` (`oui` | `moderation` | `danger`, fidèle au texte) et `verdictNote` (≤ 28 caractères pour oui/danger, ≤ 45 pour moderation, minuscule, sans point final). Espace insécable avant `:` et `?`.
- Marques : seules les marques affiliées sont recommandées, avec leurs liens : Dog Chef https://www.dogchef.com/fr/code/WZU7090, Elmut https://c3po.link/QWMW4k6mbU, Franklin Pet Food https://c3po.link/Q3xbJhfapn, Ultra Premium Direct https://c3po.link/QqJYNnzYD8, Dogfy Diet https://tidd.ly/4jT3Tqg, Fidelis https://tidd.ly/48rl0Z3 (bocaux en rupture au 1er novembre 2026 : ne pas les mettre en avant). Petty Well n'est plus partenaire : retirer toute mention restante. Aucune autre marque recommandée avec un lien.
- Mettre `updatedAt` à la date du jour (format YYYY-MM-DD).

## Vérifications
- `npm ci` si nécessaire puis `npm run build` : doit passer. Si le build casse à cause d'un article modifié, corriger ; si impossible, annuler les changements de cet article, le marquer `- [~]` avec la raison dans la file et passer au suivant.
- title ≤ 60 caractères, description ≤ 155 caractères.
- Aucune dose ou quantité existante modifiée sans source.

## Commit
- Cocher les 2 articles dans `docs/seo-rewrite-queue.md` : `- [x] \`slug\` · … · réécrit YYYY-MM-DD`.
- Ajouter une ligne datée dans `PROGRESS.md` (section Complété) listant les 2 slugs et les principaux ajouts.
- Un commit Conventional Commits en anglais, par ex. `content(seo): enrich {slug1} and {slug2} for AI fan-out`, terminé par une ligne vide puis :
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- NE PAS pousser : le script qui t'a lancé s'en charge (rebase sur `origin/v2` puis push).

## Compte rendu
Terminer par 3 lignes maximum : les 2 slugs traités, ce qui a été ajouté, et l'état du build.
