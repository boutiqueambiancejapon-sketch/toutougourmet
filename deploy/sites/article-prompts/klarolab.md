Objectif : rédiger UN (1) article de blog en FRANÇAIS pour klarolab.be (finances personnelles en Belgique : ETF, courtiers, épargne, fiscalité belge, immobilier, pension).

Lis le README et la doc du dépôt.

Particularités (voir le README) : chaque article est une page Next.js `app/blog/<slug>/page.tsx` (composants `BlogArticleHero`, `TLDRBox`, `FAQ`…). Il doit aussi :
- être ajouté dans `lib/articles.ts` (liste unique utilisée par le blog et par les images de partage) ;
- avoir son image de partage : copie le fichier `opengraph-image.tsx` d'un article existant dans `app/blog/<slug>/` (9 lignes) ; sinon l'article retombe sur l'image de l'accueil ;
- si l'article contient un chiffre fort et vérifié (TER, taux, montant, plafond), ajoute-le dans `lib/og/hooks.ts` comme les autres, en reprenant exactement le chiffre écrit dans l'article. Jamais de chiffre absent du texte.
Ajoute aussi l'article au sitemap s'il est listé à la main.

1. Calibrage : lis 3 articles récents, `lib/articles.ts`, `lib/og/hooks.ts`, `app/blog/page.tsx` et `app/sitemap.ts`, et reproduis EXACTEMENT le schéma (métadonnées, JSON-LD, composants, tag, date, temps de lecture).
2. Sujet : une requête belge réelle (WebSearch : autocomplétion, « Autres questions posées », forums belges) non couverte (vérifie la liste existante). Formats : comparatif de courtiers ou d'ETF, guide fiscal belge (TOB, précompte, taxe sur les plus-values, déclaration), épargne-pension, compte d'épargne, crédit hypothécaire, simulation.
3. Recherche : chiffres officiels et datés uniquement (SPF Finances, FSMA, BNB, sites des courtiers, fiches émetteurs d'ETF : TER, domicile, encours). Chaque taux, frais ou plafond est vérifié à la source et daté de l'année en cours. Jamais de chiffre inventé ; en cas de doute, ne l'écris pas. Aucun conseil personnalisé : rappel que l'article informe et ne remplace pas un conseiller agréé.
4. Rédaction : français clair, vouvoiement si les articles existants l'utilisent, 1 200 à 2 000 mots, H2 en questions naturelles, tableau comparatif quand il aide, FAQ de 4 à 6 questions, 2 à 4 liens internes vers des articles existants. Pas de formules creuses (« Dans un monde où… », « crucial », « il convient de noter »), 2 tirets cadratins au plus, zéro emoji, typographie française (espaces insécables, « »).
5. Vérification : `npx tsc --noEmit` et `npm run build` doivent passer.
6. Commit : `content(blog): add <slug>`.

Compte rendu : titre, slug, requête visée, état du build.
