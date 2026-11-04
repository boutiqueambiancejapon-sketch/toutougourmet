# Carte des conversions (proposition du 2026-11-03)

But : un seul objectif principal par type de page, choisi selon l'intention du visiteur, et au plus un objectif secondaire. Aujourd'hui les encarts s'empilent (encart du milieu, encart de fin, lettre, compte) sans logique d'ensemble.

## Le parcours visé

1. Google ou une IA amène un visiteur sur une réponse précise (aliment, urgence, race, outil).
2. Il laisse son e-mail contre quelque chose d'utile (le guide) ou crée un compte pour garder un résultat.
3. La lettre mensuelle et l'espace compte le ramènent, et c'est là que les offres partenaires rapportent.

Valeur : un clic partenaire rapporte tout de suite, un e-mail rapporte sur la durée (une lettre par mois avec une offre), un compte rapporte le plus (il revient pour le scanner et le poids, et voit les offres de son espace).

## Trafic humain sur 30 jours (pages servies, journaux Caddy)

| Type de page | Pages vues | Part |
|---|---|---|
| Articles aliments (« peut-il manger ») | 2 156 | 23 % |
| Autres articles (santé, nutrition, guides) | 1 160 | 13 % |
| Articles urgences | 1 134 | 12 % |
| Outils | 1 016 | 11 % |
| Marques, comparatifs, avis | 875 | 9 % |
| Races | 667 | 7 % |
| Accueil | 493 | 5 % |
| Quiz | 418 | 5 % |
| Recettes | 71 | 1 % |
| Scanner et fiches croquettes | 40 | < 1 % |

Conversions mesurées sur la même période : 1 compte, 1 clic partenaire, 1 quiz terminé (mesure maison active depuis le 2 novembre seulement).

## Un objectif par type de page

| Type de page | Intention du visiteur | Objectif principal | Secondaire | À retirer |
|---|---|---|---|---|
| Aliments « peut-il manger » | réponse rapide, curiosité | **Guide** (la liste complète de 60 aliments) | outil ration | l'offre Dogfy au milieu de l'article, l'encart compte de fin |
| Urgences | panique | **aucun** : numéros antipoison, gestes | en toute fin, la fiche frigo à imprimer (guide) | l'encart « bilan » du milieu |
| Santé, poids, maladies | problème à suivre | **Compte** (suivi du poids, alerte) | outil poids | — |
| Nutrition, croquettes, marques, comparatifs, avis | choix d'achat | **Clic partenaire** (carte offre) | scanner | — |
| Races | profil de son chien | **Compte** (profil et ration pré-remplis) | clic partenaire adapté à la race | — |
| Recettes | cuisiner maison | **Guide** (6 recettes) | repas frais partenaire (« pas le temps de cuisiner ») | — |
| Outils (ration, poids, âge, bilan) | un chiffre pour son chien | **Compte** (garder le résultat) | clic partenaire adapté au résultat | la ligne lettre « Garder ce résultat » si la carte compte est là (déjà fait) |
| Quiz | quelle marque | **Clic partenaire** (marque conseillée) | compte | — |
| Scanner, fiches croquettes | juger ses croquettes | **Compte** (scans photo) | alternative partenaire sous 55/100 | — |
| Accueil | découvrir | **Quiz** | guide | le bloc lettre (remplacé par le guide) |
| Espace compte | revenir | **Clic partenaire** (offres du compte) | Premium | — |

Règles :
- **Un seul encart de fin d'article** et **un seul encart au milieu au plus**, jamais deux fois la même demande.
- **Rien à vendre sur les urgences** ni sur un aliment « danger » avant que les gestes et les numéros soient lus.
- Le guide n'apparaît qu'une fois sur une page (audit mobile du 2026-11-04) : en haut des articles aliments et recettes, en bas de l'accueil, sans répétition en fin d'article ni dans le pied de page. Le panneau du guide reste à part.
- Le bouton « Créer un compte » de l'en-tête reste partout (sauf dans l'espace compte).
- La lettre seule disparaît : on demande l'e-mail contre le guide, qui inscrit à la lettre.

## Mesure

Dans le tableau de bord, une section « Conversions par type de page » : pages vues, puis taux de chaque objectif (guide, compte, clic partenaire) par type de page, sur 7 et 30 jours. Les événements existent déjà (`Guide Signup` à venir, `Account Invite Click`, `Account Created`, `Affiliate Click`, `Tool Result`) ; il manque le type de page sur chaque événement.

## Ordre proposé

1. Aliments → guide (23 % du trafic, le meilleur rapport effort/résultat), dès que le guide est en ligne.
2. Urgences : retirer l'encart du milieu.
3. Mesure par type de page dans le tableau de bord.
4. Marques et comparatifs : vérifier qu'une carte offre est bien visible sans défiler sur mobile.
5. Le reste, type par type, en regardant les chiffres après deux semaines.
