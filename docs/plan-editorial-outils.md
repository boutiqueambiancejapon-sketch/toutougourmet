# Plan éditorial par outil (2026-11-03)

Demande du propriétaire : un maximum d'articles de blog qui mènent vers les outils et la création de compte, pour le maillage interne. La tâche de nuit (`deploy/new-article-prompt.md`) prend le premier sujet non coché de cette liste, vérifie la demande et l'absence de doublon, écrit l'article, pose **un** encart `<ToolCta tool="…" />` vers l'outil de la section, puis coche le sujet ici (`[x]` + slug).

Règles :
- Un sujet = une requête réelle (vérifiée par WebSearch : autocomplétion, « Autres questions posées »). Si la requête est déjà couverte par un article existant, cocher `[~]` avec le slug existant et passer au suivant : la réécriture SEO le renforcera.
- L'encart outil se place juste après la section qui pose la question à laquelle l'outil répond, jamais en tête d'article. Aucun autre encart ajouté à la main.
- Un outil absent de `components/outils/tool-list.ts` (ex. fiche de garde tant qu'elle n'est pas en ligne) : sauter ses sujets jusqu'à sa mise en ligne.
- Liens internes : vers l'outil, vers 2 à 4 articles proches, et depuis 1 à 2 articles existants vers le nouvel article (ajout d'une phrase naturelle).

## Avis + Maxi Zoo (`scanner`)

Demande du propriétaire (2026-11-05). Requêtes relevées dans les suggestions Google le 2026-11-05, produits présents dans le fichier Maxi Zoo. La page de marque est la page mère, les pages de gamme, de race et les duels la citent et elle les cite. Aucun changement d'adresse : toutes vivent sous `/chien/avis-marques/`.

Règles de ces pages, en plus de celles du haut du fichier :
- Partir des vraies pages produit : `node_modules/.bin/tsx scripts/maxizoo-lookup.ts royal canin mini adulte` donne les codes-barres, puis `--lire=CODE` donne la composition, l'analyse, les calories, la note du scanner, le lien exact et l'image. 15 lectures au plus par article. Page illisible : ne rien affirmer sur ce produit.
- Lire deux tailles de la même recette quand elles existent. Notes différentes de plus de 5 points : ne pas citer la note, s'en tenir à la composition, et le dire dans le compte rendu.
- Une page de gamme ou de race doit lire sa recette et dire ce qui la distingue de la page mère. Si rien ne la distingue, coche `[~]` et ajoute plutôt une phrase à la page mère. Une taille de sac n'est jamais un sujet.
- Le verdict tombe dans le TL;DR, sourcé par la composition : premier ingrédient, part animale si elle est déclarée, protéines, matières grasses, note du scanner. Calcium ou phosphore absents : écrire « non indiqués sur la page Maxi Zoo », jamais « la marque ne les déclare pas ».
- Bloc produits, un seul, avec 1 à 3 produits : `<ProductPicks title="…"><ProductPick name="…" why="…" href="LIEN" image="IMAGE" /></ProductPicks>`, `LIEN` et `IMAGE` copiés de l'outil, jamais de lien tidd.ly ni de lien inventé. `why` donne un fait lu sur la page. Une formule vétérinaire porte `vet`.
- Recette notée sous 55 : proposer une recette Maxi Zoo notée au moins 70 et 15 points plus haut, lue avec l'outil, ou un partenaire si le sujet s'y prête.
- Jamais : faux témoignage, note d'avis clients recopiée sans la page, « notre test » ou « testé » (on lit des étiquettes, on ne nourrit pas de chiens), « recommandé par les vétérinaires » sans source, « scanné » pour un produit qu'aucun lecteur n'a scanné, promesse de soin. Prix seulement avec « relevé le {date} ».
- Requête « avis vétérinaire » : répondre à ce que disent les sources publiées et renvoyer vers le vétérinaire du chien. Le site n'a pas de vétérinaire relecteur, ne pas le laisser croire.
- Frontmatter : `category: "Avis & Comparatif"`, `categorySlug: "avis-marques"`. Couverture : un chien et sa gamelle, sans paquet, sans logo, sans nom de marque.

### Vague 1 : les marques nommées et les plus grosses requêtes

- [ ] Edgard & Cooper : avis sur les croquettes et la composition (edgard cooper avis, avis vétérinaire)
- [ ] Royal Canin ou Pro Plan : lequel choisir pour son chien (royal canin ou proplan chien)
- [ ] Royal Canin Mini Adulte : avis et composition (royal canin mini adulte avis)
- [ ] Quelles croquettes choisir chez Maxi Zoo (croquettes maxi zoo chien)
- [ ] Select Gold : avis sur les croquettes de Maxi Zoo (select gold avis, avis vétérinaire)
- [ ] Real Nature Wilderness : avis sur les croquettes et la pâtée (real nature wilderness avis)
- [ ] Orijen ou Acana : quelles différences (orijen ou acana)
- [ ] Royal Canin Maxi Adulte : avis et composition (royal canin maxi adulte avis)
- [ ] Eukanuba : avis sur les croquettes (eukanuba avis, avis vétérinaire)
- [ ] Royal Canin ou Hill's : lequel choisir (royal canin ou hills)
- [ ] Premiere : avis sur les croquettes et les pâtées Meati (premiere croquette chien avis)
- [ ] Carnilove : avis sur les croquettes (carnilove avis chien)

### Vague 2 : gammes et âges

- [ ] Royal Canin Medium Adulte : avis et composition (royal canin medium adulte avis)
- [ ] Royal Canin Mini Puppy : avis pour un chiot de petite taille (royal canin puppy mini avis)
- [ ] Royal Canin Medium et Maxi Puppy : avis pour un chiot (royal canin puppy maxi avis)
- [ ] Royal Canin Sterilised : avis pour un chien stérilisé (royal canin medium sterilised avis)
- [ ] Pro Plan Sensitive Digestion à l'agneau : avis (pro plan sensitive digestion agneau avis)
- [ ] Pro Plan Puppy : avis pour un chiot (pro plan puppy avis)
- [ ] Hill's Science Plan chien : quelle recette choisir (hill's science plan chien)
- [ ] Hill's Science Plan chien stérilisé : avis (hill's science plan chien stérilisé)
- [ ] Edgard & Cooper chiot : avis et quantités (edgard cooper chiot avis, quantité)
- [ ] Edgard & Cooper barquettes : avis sur la pâtée (edgard cooper barquette chien)
- [ ] Orijen Original : avis et composition (orijen original chien)
- [ ] Eukanuba Puppy : avis pour un chiot (eukanuba puppy avis)
- [ ] Select Gold Sensitive : pour quel chien (select gold sensitive chien avis)
- [ ] Wilderness pâtée pour chien : avis (real nature pâtée chien avis)
- [ ] Premiere Best Meat : avis et composition (premiere best meat adult)
- [ ] Premiere Meati : avis sur la pâtée (premiere meati chien)

### Vague 3 : duels

- [ ] Pro Plan ou Hill's : lequel choisir (hill's ou proplan)
- [ ] Eukanuba ou Pro Plan : lequel choisir (eukanuba ou proplan)
- [ ] Eukanuba ou Hill's : lequel choisir (eukanuba ou hill's)
- [ ] Edgard & Cooper ou Royal Canin : lequel choisir (edgard cooper vs royal canin)
- [ ] Select Gold ou Royal Canin : lequel choisir (select gold ou royal canin)
- [ ] Acana ou Royal Canin : lequel choisir (acana ou royal canin)
- [ ] Carnilove ou Orijen : lequel choisir (carnilove ou orijen)
- [ ] Carnilove ou Wilderness : lequel choisir (carnilove ou wilderness)
- [ ] Select Gold, Real Nature, Premiere : quelles différences entre les marques de Maxi Zoo (croquettes maxi zoo select gold, wilderness)

### Vague 4 : races Royal Canin

Une fiche `nourriture-{race}` existe souvent : y renvoyer, ne pas la répéter. Le sujet est la recette, pas la race.

- [ ] Royal Canin Bouledogue Français : avis et composition (royal canin bouledogue français)
- [ ] Royal Canin Golden Retriever : avis et composition (royal canin golden retriever adulte)
- [ ] Royal Canin Berger Allemand : avis et composition (royal canin berger allemand adulte)
- [ ] Royal Canin Labrador : avis et composition (royal canin labrador sterilised)
- [ ] Royal Canin Chihuahua : avis et composition (royal canin chihuahua adulte)
- [ ] Royal Canin Caniche : avis et composition (royal canin caniche adulte)

### Vague 5 : petites marques, friandises dentaires, besoins

- [ ] Nature's Variety : avis sur les croquettes (nature's variety chien avis)
- [ ] Pedigree : bon ou mauvais, avis sur la composition (pedigree bon ou mauvais)
- [ ] Ultima chien : avis sur les croquettes (ultima chien avis vétérinaire)
- [ ] Advance chien : avis sur les croquettes (croquettes advance chien avis)
- [ ] Pâtée Cesar : avis pour un chien (pâtée cesar chien avis)
- [ ] Dentastix : avis et composition (dentastix avis, avis vétérinaire)
- [ ] Dentalife : avis et composition (avis dentalife chien)
- [ ] Whimzees : avis et composition (whimzees chien avis)
- [ ] Dentastix ou Dentalife : lequel choisir (dentastix ou dentalife)
- [ ] Croquettes hypoallergéniques pour chien : avis et lecture de l'étiquette (croquettes hypoallergéniques chien avis)

## Friandises Franklin (`scanner`)

Demande du propriétaire (2026-11-03). Marque partenaire : Franklin Pet Food (lien de `data/brands.ts`). Prix et compositions relevés sur franklinpetfood.com le jour de la rédaction, jamais de mémoire. Encart vers le scanner (les friandises y sont notées) et lien vers `/croquettes/friandises`. Sujet « calendrier de l'Avent » à publier avant le 1er décembre.

- [x] Calendrier de l'Avent pour chien : que contient-il et est-ce raisonnable (Franklin, 24 surprises) → calendrier-avent-chien
- [x] Friandises Franklin : avis et composition (sticks, viande séchée, snacks, dressage) → friandises-franklin-avis-composition
- [ ] Sticks dentaires pour chien : servent-ils vraiment (sticks menthe et sauge, fromage, beurre de cacahuète)
- [ ] Friandises de dressage pour chien : lesquelles choisir et combien par séance
- [ ] Viande séchée pour chien (foie de bœuf, canard, faisan) : bonne friandise ou trop riche
- [ ] Combien de friandises par jour pour un chien : la règle des 10 % des calories
- [ ] Os, poissons et sticks au collagène à mâcher : sans danger pour le chien ?

## Pépites Search Console (`ration`, sauf indication)

Validé par le propriétaire (2026-11-04), d'après l'export Search Console. Ces requêtes ont déjà des impressions, sans article dédié. Vérifier le doublon comme pour les autres sujets.

- [ ] Le chien peut-il manger du paprika ?
- [ ] Le chien peut-il manger des merguez ?
- [ ] Le chien peut-il manger du skyr ?
- [ ] Le chien peut-il manger de la choucroute ?
- [ ] Mon chien ne mange plus et reste couché : que faire ? (`bien-nourri`)
- [ ] Ultra Premium Direct ou Franklin Pet Food : lequel choisir ? (`quiz`)

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
