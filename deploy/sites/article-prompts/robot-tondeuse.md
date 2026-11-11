Objectif : rédiger UN (1) article de blog en FRANÇAIS pour le site « quel robot tondeuse ».

**Choix du sujet (depuis le 11/11/2026)** : lis d'abord `tasks/equipe.md` (règles de l'équipe) puis `tasks/plan-editorial.md`. Prends le **premier sujet non coché** de la liste « À écrire » : c'est le sujet de la nuit, avec sa requête et son type (gazon, entretien, dépannage, saison, achat). Une fois l'article écrit, coche ce sujet et déplace-le dans « Écrits » (`- [x] AAAA-MM-JJ · slug · titre`) dans le même commit. Si la liste est vide, choisis toi-même un sujet informationnel (gazon, entretien du robot, dépannage, saison) qui n'existe pas encore sur le site.

Pour un sujet **gazon, entretien, dépannage ou saison** : article pratique et sourcé (fabricants, semenciers, organismes), 900 à 1 600 mots, réponse directe dans le chapô, étapes concrètes, erreurs fréquentes, FAQ. Un robot ou un accessoire n'est cité que s'il aide vraiment, avec lien de la base produits. Ignore alors les points 1 et 3 ci-dessous sur les tops et les ASIN, sauf pour les produits cités.

Pour un sujet **achat** : conseil d'achat honnête (le lecteur veut être aidé dans son choix), liens affiliés Amazon avec des ASIN justes, comme décrit ci-dessous.

**Jamais** « testé », « notre test », « nous avons testé » : le site n'a pas d'atelier d'essai. Écris « d'après la fiche du fabricant », « selon les avis d'utilisateurs » ou « nos critères ».

**Images dans le corps** : les 2 images génériques déjà présentes, `/images/robot-tondeuse-generique-1.jpeg` et `/images/robot-tondeuse-generique-2.jpeg`, sont intégrées à TOUS les articles (ne pas en générer d'autres) : la première après la section « Critères pour bien choisir », la seconde vers le milieu ou avant « Notre recommandation », avec la syntaxe d'image des articles existants et un texte alternatif adapté au contexte.

1. Format et sujet : top ou classement, comparatif X vs Y, guide d'achat segmenté (surface, sans câble), guide par fonctionnalité, tutoriel, FAQ ou dossier. Lis les 5 à 7 derniers articles pour ne pas dupliquer un sujet ni répéter le format de la veille.
2. Analyse : WebSearch sur la requête visée, lis 3 à 5 articles bien classés (Les Numériques, 01net, Que Choisir, Frandroid, Darty, Boulanger, guides spécialisés). Note critères, modèles, prix, surfaces, points forts et faibles. Trouve un angle : tableau plus clair, recommandations tranchées par profil (petit budget, grand jardin, pente, multi-zones), honnêteté sur les défauts.
3. Base produits et ASIN (étape critique) : repère le fichier qui stocke les produits et leurs ASIN. Pour chaque produit cité :
   - présent dans la base : réutilise tel quel son ASIN, son slug et son lien ;
   - absent : cherche l'ASIN (`site:amazon.fr <marque> <modèle exact>`, page produit Amazon.fr) et vérifie que la page correspond au bon modèle (titre, marque, caractéristiques), puis ajoute-le à la base avec le même schéma.
   - **Jamais d'ASIN inventé.** En cas de doute, cite le produit sans lien affilié. Le tag d'affiliation est géré par le code du site à partir de l'ASIN.
4. Rédaction : français, ton de conseil honnête, orienté décision, 1 200 à 2 000 mots. Calibre le schéma (frontmatter, dossier, slug, syntaxe d'image) sur 1 ou 2 articles existants. Structure à adapter : titre avec un critère de recherche (année, surface, budget, marque), chapô, « Critères pour bien choisir » (surface, pente, autonomie, navigation, connectivité, bruit, sécurité, budget), tableau comparatif si top ou comparatif, un H2 par modèle (présentation, points forts, points faibles, à qui ça s'adresse, fourchette de prix, lien affilié), « Notre recommandation », FAQ de 3 à 5 questions. Sources citées en lien. Frontmatter : date du jour, description de 150 à 160 caractères, catégorie (guide-achat, comparatif, tuto, faq, ou celle des articles gazon et entretien existants), tags.
5. Contraintes : prix et caractéristiques vérifiés sur au moins 2 sources, jamais de chiffre ni de test inventé ; prix fluctuant = fourchette et « prix indicatif à la date de publication ». Défauts mentionnés, neutralité entre marques.
6. Vérification : `npm run build` doit passer, les 2 images génériques sont dans le corps.
7. Commit : `content(blog): add <slug>` (ajoute « and N products » si la base a changé).

Compte rendu : format, titre, slug, requête visée, produits cités avec ASIN (en signalant les ajouts), état du build.
