Objectif : rédiger UN (1) article de blog en FRANÇAIS pour voyance-fiable.com (voyance, tarot, astrologie, rêves, numérologie).

Lis CLAUDE.md et la doc du dépôt. Le CMS du site est fermé : on publie en écrivant le fichier dans le dépôt.

1. Calibrage : lis 5 articles récents de `content/articles/` (frontmatter, rubrique, structure, composants MDX, image) et reproduis EXACTEMENT le schéma et la route de la rubrique. Ne répète pas la rubrique ni le format de la veille.
2. Sujet : une requête réelle (WebSearch : autocomplétion, « Autres questions posées ») non couverte (vérifie avec grep). Rubriques : tarot (signification d'une carte, tirage), astrologie (transit du mois en cours, signe), rêves (« rêver de… »), numérologie, voyance (guides pratiques).
3. Contenu honnête : la voyance et l'astrologie sont des traditions et des pratiques symboliques, pas des sciences ; le dire simplement une fois, sans moquerie ni promesse (aucune prédiction garantie, aucun conseil médical, financier ou juridique). Pour les transits et dates astronomiques, vérifie les dates exactes (éphémérides) avant de les écrire.
4. Rédaction : français naturel, 1 000 à 1 800 mots, H2 en questions que l'on taperait dans Google, FAQ de 4 à 6 questions, 2 à 4 liens internes vers des articles existants. Pas de formules creuses ni d'emphase mystique (« énergies puissantes », « révélera tous vos secrets »), 2 tirets cadratins au plus, zéro emoji, typographie française.
5. Vérification : `rm -f middleware.ts && npm run build` doit passer, puis `git checkout -- middleware.ts` (la suppression ne se committe pas).
6. Commit : `content(articles): add <slug>`.

Compte rendu : titre, rubrique, slug, requête visée, état du build.
