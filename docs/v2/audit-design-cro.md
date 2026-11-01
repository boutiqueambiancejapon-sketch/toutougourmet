# Audit design « anti-IA » et conversion — V2 (2026-11-02)

La direction artistique plaît (ludique, couleurs, Fraunces + DM Sans, chiens à chapeau), mais le rendu reprend des réglages par défaut que les outils d'IA produisent tous. Le problème n'est pas chaque choix pris seul : c'est leur accumulation, choisie par défaut et non pour le produit. Objectif double : un site qui a une identité propre, et un site qui fait **utiliser les outils, s'inscrire et cliquer sur les liens partenaires** (sans usage, la V2 ne sert à rien quand les comptes arriveront).

## 1. Les tics visuels relevés dans la V2

Sources : catalogue [impeccable.style/slop](https://impeccable.style/slop) (68 règles), étude [Design slop sur 1 590 pages Show HN](https://adriankrebs.ch/blog/design-slop/) (16 patterns mesurés en CSS : 22 % des sites en cumulent 4 ou plus), [7 tells that a UI is AI-generated](https://pages.thefountaininstitute.com/posts/7-tells-that-a-ui-is-ai-generated), [AI slop fonts and gradients](https://www.925studios.co/blog/ai-slop-design-tells).

| Tic | Où dans la V2 | Pourquoi ça fait IA |
|---|---|---|
| Palette crème / beige + serif display | tout le site | « deuxième vague » des défauts IA après le violet ; à garder seulement si on la rend propre à la marque |
| Pastille au-dessus du H1 | articles (« 🍓 Fruits »), piliers (« 17 guides ») | badge-avant-titre : pattern mesuré, presque systématique chez les IA |
| Grilles de cartes identiques avec tuile d'icône | hub Guides, « Par où commencer ? », marques | « icon tile + titre + texte » répété : le marqueur le plus cité |
| Emojis comme icônes | barre d'onglets, tuiles, pastilles | icône la moins chère pour un modèle ; aucune cohérence de trait |
| Bandeau de chiffres sous le hero | accueil (356 / 58 / 97) | « stats strip » : pattern mesuré |
| Bordure colorée en haut des cartes | pages marques et duels (V1) | pattern mesuré |
| Petits libellés en majuscules | « L'ESSENTIEL », « SOMMAIRE », « SOURCES », « À LA UNE » | pattern mesuré |
| Rayons très arrondis partout | cartes 24 px, images 32 px | « rounded-everything » |
| Cartes pastel posées sur fond crème, même rythme partout | piliers, accueil, cartes d'articles | espacement monotone, aucune section ne se distingue |
| Tout est une carte, parfois des cartes dans des cartes | aside article, encarts | à aplatir avec espacement et typographie |

## 2. Principes de correction (valables partout)

1. **Garder la palette, changer sa répartition.** Moins de pastel uniforme, plus de grands aplats francs : une section encre (#1A1109) avec texte crème, une section orange pleine pour l'action principale. Le crème devient le fond, pas la couleur de chaque carte.
2. **Remplacer les emojis par notre propre jeu d'icônes dessinées** : les 6 éléments signature déjà définis dans le prompt de marque (gamelle, os, patte, étoile, chapeau, confettis), au même trait noir que les images. Personne d'autre n'a ces icônes.
3. **Supprimer les pastilles au-dessus des titres et les libellés en majuscules.** La rubrique passe dans le fil d'Ariane ou sous le titre, en texte.
4. **Casser les grilles identiques** : une carte large + des lignes compactes, des listes plutôt que des tuiles, de l'asymétrie (image qui déborde, titre qui chevauche une photo).
5. **Rayons réduits et hiérarchisés** : 8-12 px pour les cartes, 16-20 px pour les grandes images, pastilles rondes seulement pour les vrais boutons-filtres.
6. **Les chiens illustrés comme signature** : grands détourages, chien qui « regarde » le bloc d'action, au lieu de photos enfermées dans des rectangles arrondis.
7. **Une seule action principale par écran**, orange plein ; le reste en lien ou bouton discret.

## 3. Par type de page : amélioration design + conversion

Repères conversion (fourchettes d'éditeurs, à vérifier sur notre trafic) : inscription générique 0,5–1,5 % des visiteurs ; un « bonus » lié au contenu (content upgrade) 3–8 % des lecteurs ; placement efficace vers 40 % de la page ; formulaire e-mail seul ; trois emplacements d'inscription au maximum par page, jamais deux visibles en même temps ([guide unilink](https://www.unilink.us/blog/how-to-build-email-list-2026), [lead magnets](https://skillselion.com/skills/coreyhaines31/marketingskills/lead-magnets)).

### Accueil
- **Problème** : hero + stats + tuiles + grilles = gabarit IA ; aucune action utile dans les 5 premières secondes.
- **Design** : hero asymétrique, grand chien détouré à droite qui déborde sur la section suivante ; supprimer le bandeau de chiffres.
- **Conversion** : **l'outil dans le hero** — « Combien de grammes pour ton chien ? » : poids + âge → résultat immédiat en grammes, puis « Reçois sa fiche ration par e-mail » (futur compte). Remplacer les 4 tuiles par une recherche « Mon chien peut-il manger… » qui répond avec le verdict.

### Article (« peut-il manger », urgences, guides)
- **Problème** : pastille au-dessus du H1, encadrés pastel empilés, CTA collant générique.
- **Design** : verdict en tête, en grand, juste sous le titre (✓ OUI / ✕ DANGER dessiné, avec la note courte), sans pastille ; « L'essentiel » en liste simple sans boîte ; sommaire en texte.
- **Conversion** : **mini-calculateur intégré** « Combien de [aliment] pour ton chien de __ kg ? » (réutilise SizeTable) ; **bonus à 40 %** : « La liste des aliments toxiques en fiche à coller sur le frigo » contre l'e-mail ; lien partenaire **en contexte** (une recommandation justifiée au bon paragraphe) plutôt que le bandeau collant sur toutes les pages ; un seul bandeau collant, et seulement sur les articles d'achat.

### Page pilier (rubrique)
- **Problème** : pastille « 17 guides », tableau de pastilles + grille de cartes identiques.
- **Design** : le récapitulatif devient un **outil de recherche d'aliment** (champ + résultats colorés), la grille devient une liste dense « question → verdict », une seule carte « à la une ».
- **Conversion** : le champ de recherche est la porte d'entrée vers l'outil « Il a mangé quoi ? » ; inscription « nouveaux guides de la rubrique » en bas.

### Page race
- **Problème** : 4 cartes chiffres identiques + encart pastel.
- **Design** : fiche d'identité de la race en une bande encre (poids, vie, activité, point à surveiller en ligne), portrait détouré.
- **Conversion** : « Calculer sa ration » **pré-rempli** avec le poids moyen de la race ; « Recevoir la fiche [race] » (poids idéal, aliments à éviter) par e-mail ; marques recommandées **pour cette race** avec la raison.

### Hub Guides et hub Races
- **Problème** : tuiles icône + titre + texte (le pattern le plus IA de tous).
- **Design** : **recherche en premier** sur les 356 guides, puis « questions les plus posées » en liste, puis rubriques en lignes compactes avec compteur. Hub Races : filtres par gabarit (petit / moyen / grand) au-dessus de l'index A-Z.
- **Conversion** : la recherche mesure l'intention (événements) et alimente la file des nouveaux articles.

### Outils (ration, âge, « bien nourri », test)
- **Problème** : pages V1, résultats qui s'arrêtent à l'écran.
- **Conversion** : chaque résultat propose **« Garder ce résultat »** (e-mail aujourd'hui, compte demain) et **une suite logique** (ration → aliments à éviter pour son gabarit → marques adaptées). Le test devient l'entrée principale vers le compte.

### Marques et comparateur
- **Problème** : bordures colorées en haut, notes sur 5 sans méthode visible, gros boutons identiques.
- **Design** : tableau comparatif sobre en premier, choix **par profil** (« chien en surpoids », « allergique », « petit budget ») avec la marque qui y répond et pourquoi.
- **Conversion** : un lien partenaire par profil, mention d'affiliation lisible, événements de clic mesurés par marque.

## 4. Mesure

Aujourd'hui rien ne dit quelle page convertit. À poser avant la refonte : événements Plausible (clic partenaire par marque, outil lancé, outil terminé, inscription, recherche d'aliment), objectif par type de page, et un tableau de bord simple. Sans ça, on ne saura pas si les changements marchent.

## 5. Ordre proposé

1. Jeu d'icônes dessinées + suppression des pastilles au-dessus des titres, libellés majuscules, rayons réduits (passe globale, gros effet).
2. Article : verdict en tête + mini-calculateur + bonus e-mail à 40 %.
3. Accueil : outil dans le hero + recherche d'aliment.
4. Événements de mesure.
5. Pilier, race, hubs, puis outils et marques.
