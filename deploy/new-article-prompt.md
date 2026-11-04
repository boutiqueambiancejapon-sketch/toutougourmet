Tâche quotidienne : rédiger UN nouvel article pour Toutou Gourmet (www.toutou-gourmet.com), site français sur l'alimentation et la santé du chien. Tu tournes sur le serveur de Toutou, dans une copie de travail de la branche `v2` (la V2 du site). Le site en ligne n'est pas modifié avant la bascule : tu ne touches JAMAIS à la branche de production.

## Ton de l'article (priorité sur tout le reste)
**Priorité sur tout le reste (demande du propriétaire, 2026-11-04).** Les gens veulent la réponse vite et passer un bon moment.
- Réponse dans les 2 premières phrases, en langage courant, puis des conseils qu'on peut suivre tout de suite.
- Ton vivant : des scènes de la vie avec un chien, un peu d'humour quand le sujet s'y prête. Jamais de blague sur une urgence ou un chien malade.
- Pas trop chiffré, pas trop scientifique : pas de calculs de kcal, de pourcentages d'ingrédients, de mg/kg, de tableaux de calcul ni de références d'études dans le texte courant. On garde un chiffre seulement s'il change ce que le lecteur va faire.
- Exception sécurité : toxique, urgence, maladie, médicament. Là, les doses, les symptômes et les numéros restent exacts et le ton reste sérieux.
- Jamais de référence façon article scientifique dans le texte : pas de « (Noble et al., 2017) », d'auteur, de revue, de DOI ni de PMID. On écrit « une étude britannique » ou « les vétérinaires conseillent », et les références vont seulement dans « Sources » en fin d'article, si besoin. Une affirmation de santé reste vérifiée à une source sérieuse. Plus court, jamais moins vrai.
- 600 à 1 000 mots en général. FAQ de 4 à 6 questions courtes.
- Produit cité : partir de sa page officielle. Pas de conclusion tirée d'une estimation maison.

## Avant d'écrire
1. Lire `CLAUDE.md` et `PROGRESS.md`.
2. Lire `docs/09-seo-geo-guide.md` EN ENTIER (structure, fan-out §2.7, règle race × question §6.4).
3. Charger le skill `boileau` (`.claude/skills/boileau/SKILL.md`) et l'appliquer dès le premier jet.
4. Lire 2 articles récents de `content/blog/` du même format que celui que tu vas écrire, dont l'article pilote V2 `chien-peut-manger-poires.mdx`, pour reproduire exactement le frontmatter et les composants.

## Choisir le sujet
- **En priorité : le plan éditorial par outil `docs/plan-editorial-outils.md`.** Prends le premier sujet non coché dont l'outil existe dans `components/outils/tool-list.ts`, en suivant les règles en tête du fichier (requête réelle vérifiée, pas de doublon ; sinon coche `[~]` avec le slug existant et passe au suivant). L'article pose **un seul** encart `<ToolCta tool="{slug de l'outil}" />` juste après la section qui pose la question à laquelle l'outil répond. À la fin, coche le sujet (`- [x] … → slug`) dans le même commit. Les règles ci-dessous s'appliquent aussi. Quand tout le plan est coché, reviens au choix libre ci-dessous.
- Varier le format d'un jour à l'autre (regarder les `date` des 7 derniers articles) : guide pratique, « peut-il manger » (aliment), urgence (« mon chien a mangé… »), recette maison, dossier santé/nutrition, guide d'achat.
- Utiliser WebSearch pour trouver une requête réelle avec de la demande (autocomplétion, « Autres questions posées », forums) qui n'est PAS déjà couverte : vérifier avec `ls content/blog` et `grep -ril` sur le sujet. Pas de doublon, pas de cannibalisation d'une page existante.
- Ne créer AUCUNE page « [race] peut-il manger [X] ». Une nouvelle fiche race (`nourriture-{race}`) seulement si la race n'a pas encore d'article ; dans ce cas, ajouter aussi sa fiche dans `data/breeds.ts` (mêmes règles que les autres fiches : rien qui ne soit écrit et sourcé dans l'article).

## Recherche
- Lire 3 à 5 pages qui rankent sur la requête (WebFetch) : sous-questions traitées, manques, mises en garde vétérinaires.
- Toute donnée chiffrée vient d'une source vérifiée (étude avec auteur, année, revue, DOI ou PMID, ou base officielle : USDA FoodData Central, ANSES, FEDIAF), listée dans « Sources » en fin d'article et jamais entre parenthèses dans le texte. Sans source, ne pas l'écrire.

## Rédiger (`content/blog/{slug}.mdx`)
- 600 à 1 000 mots, tutoiement comme le reste du site, H2 en questions naturelles, réponse directe en tête de chaque section, paragraphes autonomes (entité répétée, chiffre + unité dans la même phrase).
- Section `## TL;DR` en tête (puces), puis les composants V2 quand ils ont du sens : `SizeTable` / `SizeRow` (quantités par gabarit avec races nommées). Dans chaque `SizeRow`, l'attribut `amount` donne les grammes entre parenthèses sous la forme « (20 à 30 g) » ou « (15 g) » : le mini-calculateur de l'article lit ces valeurs, elles doivent être cohérentes avec le texte., `WhatToDo` / `Step` et `PoisonCenters` pour un aliment à risque, `FaqList` / `FaqItem` (6 à 8 questions). Les composants utilisables sont listés dans `components/mdx/article-components.tsx` : n'en utiliser aucun autre.
- Santé : rappeler que l'article ne remplace pas l'avis d'un vétérinaire, ne jamais poser de diagnostic ; être ferme sur les aliments dangereux.
- 2 à 4 liens internes vers des articles qui existent (route `/chien/{categorySlug}/{slug}`, vérifier avec ls/grep).
- Frontmatter : reproduire le schéma des articles existants. `category` doit être une clé de `CATEGORY_TABLE` (`components/blog/blog-categories.ts`) et `categorySlug` une rubrique existante (voir `data/categories.ts`). `date` et `updatedAt` = date du jour (YYYY-MM-DD). title ≤ 60 caractères, description ≤ 155.
- Miniature de partage : `ogTitle` (titre court accrocheur, ≤ 40 caractères si possible, modèle « Poire : ton chien peut en manger ? »), et pour un article « peut-il manger » ou urgence `verdict` (`oui` | `moderation` | `danger`, fidèle au texte) et `verdictNote` (≤ 28 caractères pour oui/danger, ≤ 45 pour moderation, minuscule, sans point final). Espace insécable avant `:` et `?`.
- Marques : seules les marques affiliées sont citées avec un lien, et seulement si le sujet s'y prête : Dog Chef https://www.dogchef.com/fr/code/WZU7090 (−30 % sur la box d'essai, livraison gratuite), Elmut https://c3po.link/QWMW4k6mbU (−40 % sur la première commande), Franklin Pet Food https://c3po.link/Q3xbJhfapn (−30 % en abonnement), Ultra Premium Direct https://c3po.link/QqJYNnzYD8 (−20 % sur la première commande en abonnement), Dogfy Diet https://tidd.ly/4jT3Tqg (−50 % sur la box d'essai de 14 jours), Fidelis https://tidd.ly/48rl0Z3 (bocaux en rupture au 1er novembre 2026 : ne pas les mettre en avant). Maxi Zoo est partenaire : garder les liens tidd.ly vers ses fiches produits (Royal Canin https://tidd.ly/3PnVz4E, Eukanuba https://tidd.ly/4rPSibE et les autres liens tidd.ly déjà présents), sans les présenter comme une recommandation nutritionnelle. Petty Well n'est plus partenaire : ne jamais le citer.

## Image de couverture (UNE génération, coût payant : ne pas multiplier)
1. Écrire `/tmp/new-article-image.json` : `[{"slot":"art-{slug}","subject":"…","composition":"…","decorations":["…"],"tone":"…","ratio":"3:2"}]`. Sujet : un chien calme et une scène liée à l'article, sans humain. Composition : plein cadre, sujet bord à bord, au plus 6 à 10 confettis, aucun contour tracé autour du chien ou de l'aliment. Ton selon la rubrique (Alimentation rose, Santé vert, Race ambre, Urgences rose + étoile orange, Comportement bleu, Avis bleu, Nutrition ambre). Race : portrait de la race exacte, un seul élément décoratif (petit chapeau de fête, ou empreinte de patte pour les races brachycéphales).
2. Lancer `node scripts/generate-images.mjs /tmp/new-article-image.json --out public/images/articles` (une seule variante par défaut), puis renommer `public/images/articles/art-{slug}-1.webp` en `art-{slug}.webp`.
3. Regarder l'image (outil Read). Si elle a un défaut net (anatomie déformée, bande vide, texte), UNE seule nouvelle génération ; sinon garder. Si la génération échoue deux fois, publier sans image dédiée (la cover de la rubrique sert de repli) et le signaler.
4. Déclarer le slot dans `data/extra-image-slots.ts` (en tête du tableau, `ext: 'webp'`, `imageReady: true`, même forme que les autres entrées) et ajouter `'{slug}': 'art-{slug}',` dans `ARTICLE_SLOT_BY_SLUG` (`components/blog/blog-categories.ts`).

## Vérifications
- `npm ci` si nécessaire puis `npm run build` : doit passer. Si le build casse à cause de l'article, corriger ; si impossible, ne rien committer et le signaler.
- Tirets cadratins (—) : au plus 2 par article, aucun dans le title, les H2, les puces et la FAQ (compter avec `grep -o '—' fichier | wc -l`). Aucune phrase-chute en fin de paragraphe (« Chaque heure compte. », « Le pronostic est sombre. ») : finir sur un fait.
- Relire l'article avec la checklist du skill boileau (aucun mot interdit sans détail concret, aucune structure rhétorique bannie, typographie française, zéro emoji).

## Commit
- Ajouter une ligne datée dans `PROGRESS.md` (section Complété) : slug, format, requête visée.
- Un commit Conventional Commits en anglais, par ex. `content(blog): add {slug}`, terminé par une ligne vide puis :
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- NE PAS pousser : le script qui t'a lancé s'en charge.

## Compte rendu
3 lignes maximum : slug et format, requête visée, état du build et de l'image.
