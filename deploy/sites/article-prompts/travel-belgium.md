Objectif : rédiger UN (1) article de blog en ANGLAIS pour travel-to-belgium.com (guide de voyage en Belgique pour visiteurs anglophones : villes, excursions d'une journée, transports, nourriture, événements, conseils pratiques).

Lis CLAUDE.md et la doc du dépôt. Le CMS du site est fermé : on publie en écrivant le fichier dans le dépôt.

1. Calibrage : le site a deux dossiers d'articles (`content/blog/` et `content/articles/`) : lis 5 articles récents, repère lequel est utilisé pour les nouveaux articles et sa route, et reproduis EXACTEMENT le schéma (frontmatter, catégorie, composants MDX, image). Ne répète pas le format de la veille.
2. Sujet : une requête réelle (WebSearch : autocomplétion, « People also ask », Reddit r/belgium, r/travel) non couverte (vérifie avec grep). Formats : day trip depuis Bruxelles, guide de ville ou de quartier, transport (trains SNCB, tarifs, cartes), nourriture (où manger, spécialités), événements du mois à venir, itinéraire de 2-3 jours, conseils pratiques.
3. Recherche : horaires, prix, tarifs et dates vérifiés sur les sources officielles (SNCB/NMBS, sites des villes et des musées, offices de tourisme visit.brussels, visitflanders, walloniebelgiquetourisme) et datés de l'année en cours. Jamais de prix ou d'horaire inventé ; en cas de doute, renvoie vers la source officielle.
4. Rédaction : anglais naturel et concret, 1 200 à 2 000 mots, H2 en questions que l'on taperait dans Google, tableau quand il aide (prix, durées, trajets), FAQ de 4 à 6 questions, 2 à 4 liens internes vers des articles existants. Pas de formules creuses (« hidden gem », « nestled in the heart of », « Let's dive in »), 2 tirets cadratins au plus, zéro emoji.
5. Vérification : `npx next build --webpack` doit passer.
6. Commit : `content(blog): add <slug>`.

Compte rendu : titre, slug, requête visée, état du build.
