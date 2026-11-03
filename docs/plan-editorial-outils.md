# Plan éditorial par outil (2026-11-03)

Demande du propriétaire : un maximum d'articles de blog qui mènent vers les outils et la création de compte, pour le maillage interne. La tâche de nuit (`deploy/new-article-prompt.md`) prend le premier sujet non coché de cette liste, vérifie la demande et l'absence de doublon, écrit l'article, pose **un** encart `<ToolCta tool="…" />` vers l'outil de la section, puis coche le sujet ici (`[x]` + slug).

Règles :
- Un sujet = une requête réelle (vérifiée par WebSearch : autocomplétion, « Autres questions posées »). Si la requête est déjà couverte par un article existant, cocher `[~]` avec le slug existant et passer au suivant : la réécriture SEO le renforcera.
- L'encart outil se place juste après la section qui pose la question à laquelle l'outil répond, jamais en tête d'article. Aucun autre encart ajouté à la main.
- Un outil absent de `components/outils/tool-list.ts` (ex. fiche de garde tant qu'elle n'est pas en ligne) : sauter ses sujets jusqu'à sa mise en ligne.
- Liens internes : vers l'outil, vers 2 à 4 articles proches, et depuis 1 à 2 articles existants vers le nouvel article (ajout d'une phrase naturelle).

## Friandises Franklin (`scanner`)

Demande du propriétaire (2026-11-03). Marque partenaire : Franklin Pet Food (lien de `data/brands.ts`). Prix et compositions relevés sur franklinpetfood.com le jour de la rédaction, jamais de mémoire. Encart vers le scanner (les friandises y sont notées) et lien vers `/croquettes/friandises`. Sujet « calendrier de l'Avent » à publier avant le 1er décembre.

- [ ] Calendrier de l'Avent pour chien : que contient-il et est-ce raisonnable (Franklin, 24 surprises)
- [ ] Friandises Franklin : avis et composition (sticks, viande séchée, snacks, dressage)
- [ ] Sticks dentaires pour chien : servent-ils vraiment (sticks menthe et sauge, fromage, beurre de cacahuète)
- [ ] Friandises de dressage pour chien : lesquelles choisir et combien par séance
- [ ] Viande séchée pour chien (foie de bœuf, canard, faisan) : bonne friandise ou trop riche
- [ ] Combien de friandises par jour pour un chien : la règle des 10 % des calories
- [ ] Os, poissons et sticks au collagène à mâcher : sans danger pour le chien ?

## Fiche de garde (`fiche-de-garde`) et voyage

- [ ] Partir en vacances avec son chien : la liste de ce qu'il faut emporter (alimentation, eau, papiers)
- [ ] Prendre l'avion avec son chien : repas avant le vol, jeûne, eau
- [ ] Voyager en train avec son chien : repas, eau, friandises pendant le trajet
- [ ] Mettre son chien en pension : que donner, faut-il apporter ses croquettes
- [ ] Faire garder son chien par un proche : les consignes à laisser
- [ ] Pet sitter à domicile : quelles consignes écrire pour les repas
- [ ] Chien qui ne mange plus quand on part : pourquoi et que faire
- [ ] Changer d'eau en voyage : diarrhée du chien, comment l'éviter
- [ ] Partir en camping ou en van avec son chien : repas et conservation des aliments
- [ ] Voyager à l'étranger avec son chien : nourriture autorisée à la frontière (UE, Suisse, Royaume-Uni)

## Ration (`ration`)

- [ ] Combien de croquettes pour un chien de 10 kg (puis 5, 20, 30 kg : un article par poids si la demande existe)
- [ ] Combien de repas par jour pour un chien adulte
- [ ] Mon chien a toujours faim : ration trop faible ou habitude
- [ ] Ration d'un chien stérilisé : de combien baisser
- [ ] Mélanger croquettes et pâtée : comment calculer la ration
- [ ] Ration d'un chien sportif ou de travail en saison
- [ ] Ration d'une chienne gestante ou allaitante

## Poids idéal (`poids`)

- [ ] Poids idéal d'un chien : comment savoir s'il est trop gros (note d'état corporel)
- [ ] Mon chien a grossi après la stérilisation
- [ ] Perte de poids soudaine chez le chien : quand s'inquiéter
- [ ] Faire grossir un chien trop maigre sans le rendre malade
- [ ] Courbe de croissance du chiot : poids adulte selon la race
- [ ] Peser son chien à la maison sans balance pour animaux

## Bilan « Est-il bien nourri ? » (`bien-nourri`)

- [ ] Signes qu'un chien est bien nourri (pelage, selles, énergie)
- [ ] Poil terne chez le chien : l'alimentation est-elle en cause
- [ ] Chien qui mange de l'herbe : faim, carence ou habitude
- [ ] Chien qui mange ses crottes (coprophagie) : rôle de l'alimentation
- [ ] Flatulences du chien : quelle part vient de la gamelle

## Scanner (`scanner`)

- [ ] Comment savoir si des croquettes sont de bonne qualité
- [ ] Taux de protéines idéal dans les croquettes pour chien
- [ ] « Sous-produits animaux » sur l'étiquette : ce que ça veut dire
- [ ] Croquettes premium ou supermarché : la différence sur l'étiquette
- [ ] Friandises pour chien : lesquelles éviter au rayon (sucre, glycérine, colorants)
- [ ] Os à mâcher pour chien : peau de buffle, corne, bois de cerf, lesquels choisir
- [ ] Bâtonnets à mâcher et dentaires : utiles ou pas
- [ ] Pâtée pour chien : comment lire l'étiquette et comparer avec des croquettes

## Âge humain (`age`)

- [ ] À quel âge un chien est-il senior selon sa taille
- [ ] Alimentation du chien âgé de plus de 10 ans
- [ ] Quand passer des croquettes chiot aux croquettes adulte
- [ ] Espérance de vie du chien selon la race et le poids

## Budget et coût (`budget`, `cout`)

- [ ] Combien coûte un chien par an (alimentation, vétérinaire, assurance)
- [ ] Croquettes pas chères mais de qualité : comment choisir
- [ ] Repas frais livrés : le vrai prix par jour selon le poids
- [ ] Acheter ses croquettes en gros : économie réelle et conservation

## Test « Quelle marque lui correspond ? » (`quiz`)

- [ ] Changer de croquettes : la transition alimentaire jour par jour
- [ ] Croquettes pour chien sensible de l'estomac : comment choisir
- [ ] Quelles croquettes pour un chiot de petite race
