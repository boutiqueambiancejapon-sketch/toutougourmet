Réécrire le ton de quelques articles de Toutou Gourmet pour la V2 (www.toutou-gourmet.com). Tu tournes sur le serveur, dans une copie de travail de `v2`, sans personne pour répondre. Les articles à traiter sont donnés à la fin de cette consigne.

## Avant d'écrire
Lis `docs/09-seo-geo-guide.md` (section « Ton et longueur ») et le skill `boileau` en entier (`.claude/skills/boileau/SKILL.md`). Exemple du ton voulu : `content/blog/calendrier-avent-chien.mdx`.

## Le ton
Informatif, intéressant, légèrement scientifique et divertissant : un article de vulgarisation qu'on a plaisir à lire, pas une étude scientifique. Réponse dans les 2 premières phrases. Tutoiement. Le lecteur apprend quelque chose à chaque section, avec des mots simples, et sourit parfois.

## Pour chaque article
- Réécris le texte courant pour qu'il se lise bien : phrases naturelles, scènes de la vie avec un chien, moins de listes. Coupe les répétitions, les calculs détaillés, les tableaux de calcul, les avalanches de pourcentages. Vise 1 000 à 1 200 mots : un article plus court garde sa longueur s'il couvre déjà bien le sujet, sans remplissage. Les contenus longs sont mieux repris par les IA, à condition de rester agréables à lire.
- Références scientifiques : retire-les du texte (auteur, année, revue, DOI, PMID) et mets-les, complètes, dans `## Sources` en fin d'article. Aucune perdue, aucune inventée.
- Faits : tu n'inventes rien. Tu reformules ce que l'article dit déjà. Un fait nouveau seulement s'il est vérifié par une recherche sur une source sérieuse, et sa référence va dans Sources. Dans le doute, tu l'omets.
- Sécurité, sans exception : aliment toxique, urgence, maladie, médicament, complément. Doses, seuils, symptômes, délais, conduite à tenir et numéros restent exacts et complets, ton sérieux, aucune blague. Ne retire aucune mise en garde, ne rends aucun risque moins grave qu'il n'est écrit. `<WhatToDo>`, `<PoisonCenters>`, `verdict` restent en place.
- Marques : tu ne changes ni les recommandations, ni les notes, ni les offres, ni les liens affiliés, ni leurs composants, et tu n'ajoutes aucune marque. Ne retire pas les `<ToolCta>`, `<BrandCTA>`, `<BreedBrandCompare>`.
- NE PAS toucher : nom de fichier, `categorySlug`, `category`, `date`, `aggregateRating`, `editorialRating`, liens internes existants (ils doivent continuer à exister). H2 en questions naturelles. FAQ de 4 à 6 questions courtes, FaqList conservée. `updatedAt` = date du jour. `title` ≤ 60 caractères, `description` ≤ 155, sans changer le mot-clé visé.
- Règles boileau dès le premier jet. Un article déjà agréable à lire change peu : ne casse rien pour le plaisir.
- Pour un article que tu ne peux pas traiter proprement, annule (`git checkout -- fichier`) et marque-le `- [~] \`slug\` · raison`.

## Vérifications
- Compare à l'ancienne version (`git diff`) dans les sections sécurité : aucun nombre, aucune dose, aucun numéro modifié.
- `nice -n 10 npm run build > /tmp/tone-v2-build.log 2>&1`, une seule fois. Échec à cause d'un article : corrige, sinon annule-le et relance une fois.

## Commit
Coche chaque article dans `docs/tone-v2-queue.md` (`- [x] \`slug\``). Un commit Conventional Commits en anglais, `content(tone): rewrite N articles for v2 (slug1, slug2, …)`, terminé par une ligne vide puis `Co-Authored-By: Claude <noreply@anthropic.com>`. NE PAS pousser : le script s'en charge.

## Compte rendu
3 lignes maximum : articles traités, mots avant et après, faits ajoutés avec leur source, état du build.
