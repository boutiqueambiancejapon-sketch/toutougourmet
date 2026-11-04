Tâche quotidienne : réécrire et optimiser 2 articles existants du site Toutou Gourmet (www.toutou-gourmet.com), en français, selon la méthode fan-out IA du guide SEO/GEO du repo. Tu tournes sur le serveur de Toutou, dans une copie de travail de la branche `v2` (la V2 du site). Le site en ligne n'est pas modifié avant la bascule : tu ne touches JAMAIS à la branche de production.

## Ton de l'article (priorité sur tout le reste)
**Priorité sur tout le reste (demande du propriétaire, 2026-11-04).** Les gens veulent la réponse vite et passer un bon moment.
- Réponse dans les 2 premières phrases, en langage courant, puis des conseils qu'on peut suivre tout de suite.
- Ton vivant : des scènes de la vie avec un chien, un peu d'humour quand le sujet s'y prête. Jamais de blague sur une urgence ou un chien malade.
- Pas trop chiffré, pas trop scientifique : pas de calculs de kcal, de pourcentages d'ingrédients, de mg/kg, de tableaux de calcul ni de références d'études dans le texte courant. On garde un chiffre seulement s'il change ce que le lecteur va faire.
- Exception sécurité : toxique, urgence, maladie, médicament. Là, les doses, les symptômes et les numéros restent exacts et le ton reste sérieux.
- Jamais de référence façon article scientifique dans le texte : pas de « (Noble et al., 2017) », d'auteur, de revue, de DOI ni de PMID. On écrit « une étude britannique » ou « les vétérinaires conseillent », et les références vont seulement dans « Sources » en fin d'article, si besoin. Une affirmation de santé reste vérifiée à une source sérieuse. Plus court, jamais moins vrai.
- 600 à 1 000 mots en général. FAQ de 4 à 6 questions courtes.
- Produit cité : partir de sa page officielle. Pas de conclusion tirée d'une estimation maison.
- Une réécriture rend l'article plus simple et plus court : elle n'ajoute ni tableau de calcul ni chiffres. Déplace les références scientifiques du texte, comme « (Auteur et al., 2019) », vers « Sources » en fin d'article, sections sécurité comprises. Tu peux retirer les chiffres inutiles au lecteur, sauf dans les sections sécurité. Les règles ci-dessous sur le tableau par gabarit et la FAQ de 8 questions ne valent que pour une section sécurité où elles aident vraiment.

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
- Si l'article n'a pas encore d'encart outil et qu'un outil de `components/outils/tool-list.ts` répond à une question de l'article (ration, poids, bilan, scanner, âge, budget, coût, test, fiche de garde), pose **un seul** `<ToolCta tool="{slug}" />` juste après la section concernée. Jamais sur un article urgences ou un aliment « danger » avant les gestes et les numéros, et pas de deuxième encart si l'article en a déjà un (`<ToolCta`, `<SitterSheetCta`, `<BreedBrandCompare`, `<BrandCTA`).
- Ne créer AUCUNE nouvelle page race × question.
- Miniature de partage : renseigner ou vérifier dans le frontmatter `ogTitle` (titre court accrocheur, ≤ 40 caractères si possible, modèle « Poire : ton chien peut en manger ? »), et pour les articles « peut-il manger » et urgences `verdict` (`oui` | `moderation` | `danger`, fidèle au texte) et `verdictNote` (≤ 28 caractères pour oui/danger, ≤ 45 pour moderation, minuscule, sans point final). Espace insécable avant `:` et `?`.
- Marques : seules les marques affiliées sont recommandées, avec leurs liens : Dog Chef https://www.dogchef.com/fr/code/WZU7090 (−30 % sur la box d'essai, livraison gratuite), Elmut https://c3po.link/QWMW4k6mbU (−40 % sur la première commande), Franklin Pet Food https://c3po.link/Q3xbJhfapn (−30 % en abonnement), Ultra Premium Direct https://c3po.link/QqJYNnzYD8 (−20 % sur la première commande en abonnement), Dogfy Diet https://tidd.ly/4jT3Tqg (−50 % sur la box d'essai de 14 jours), Fidelis https://tidd.ly/48rl0Z3 (bocaux en rupture au 1er novembre 2026 : ne pas les mettre en avant). Maxi Zoo est partenaire : garder les liens tidd.ly vers ses fiches produits (Royal Canin https://tidd.ly/3PnVz4E, Eukanuba https://tidd.ly/4rPSibE et les autres liens tidd.ly déjà présents), sans les présenter comme une recommandation nutritionnelle. Petty Well n'est plus partenaire : retirer toute mention restante. Aucune autre marque recommandée avec un lien.
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
