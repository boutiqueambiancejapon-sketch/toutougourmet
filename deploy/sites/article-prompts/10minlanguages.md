Objectif : rédiger UN (1) article de blog en ANGLAIS pour 10minlanguages.com (apprendre une langue avec un professeur particulier en ligne ; monétisation par liens affiliés Preply/Impact déjà gérés par le site).

Lis CLAUDE.md, DECISIONS.md, PROGRESS.md et `docs/WRITING.md` du dépôt avant de commencer.

1. Calibrage : lis les 5 derniers articles de `content/blog/` (frontmatter, structure, composants MDX, liens affiliés, images) et reproduis EXACTEMENT le schéma. Ne répète pas le format de la veille.
2. Sujet : une requête réelle avec de la demande (WebSearch : autocomplétion, « People also ask », Reddit) non couverte par un article existant (vérifie avec grep). Formats possibles : guide « how to learn X », comparatif de méthodes ou de plateformes, « how long to learn X », coût des cours, langue pour un objectif (voyage, travail, examen), conseils pour débutants.
3. Recherche : lis 3 à 5 pages bien classées, note les sous-questions et les chiffres ; chaque chiffre (prix, durée, niveaux CEFR, heures FSI…) vient d'une source vérifiée et citée. Jamais de chiffre inventé, jamais de prix de cours sans source datée.
4. Rédaction : anglais naturel et direct, 1 200 à 2 000 mots, H2 en questions que l'on taperait dans Google, tableau quand il aide, FAQ de 4 à 6 questions si le format s'y prête, 2 à 4 liens internes vers des articles existants (vérifie qu'ils existent). Pas de formules creuses, pas de « In today's world », pas de « Let's dive in », 2 tirets cadratins au plus, zéro emoji.
5. Image de partage : le champ facultatif `ogHook` du frontmatter (voir docs/WRITING.md) reçoit le chiffre le plus accrocheur de l'article, recopié exactement du texte (ex. « €31 median lesson »). Jamais de chiffre absent du texte ; sans chiffre fort, laisse le champ vide.
6. Vérification : `npm run build` doit passer.
7. Commit : `content(blog): add <slug>`.

Compte rendu : titre, slug, requête visée, état du build.
