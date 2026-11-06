# Plan éditorial par outil (2026-11-03)

Demande du propriétaire : un maximum d'articles de blog qui mènent vers les outils et la création de compte, pour le maillage interne. La tâche de nuit (`deploy/new-article-prompt.md`) prend le premier sujet non coché de cette liste, vérifie la demande et l'absence de doublon, écrit l'article, pose **un** encart `<ToolCta tool="…" />` vers l'outil de la section, puis coche le sujet ici (`[x]` + slug).

Règles :
- Un sujet = une requête réelle (vérifiée par WebSearch : autocomplétion, « Autres questions posées »). Si la requête est déjà couverte par un article existant, cocher `[~]` avec le slug existant et passer au suivant : la réécriture SEO le renforcera.
- L'encart outil se place juste après la section qui pose la question à laquelle l'outil répond, jamais en tête d'article. Aucun autre encart ajouté à la main.
- Un outil absent de `components/outils/tool-list.ts` (ex. fiche de garde tant qu'elle n'est pas en ligne) : sauter ses sujets jusqu'à sa mise en ligne.
- Liens internes : vers l'outil, vers 2 à 4 articles proches, et depuis 1 à 2 articles existants vers le nouvel article (ajout d'une phrase naturelle).

## Avis + Maxi Zoo (`scanner`)

Demande du propriétaire (2026-11-05). Deux étages à relier : l'avis sur une marque et l'avis sur un modèle précis de cette marque. Requêtes relevées dans les suggestions Google le 2026-11-05 : 198 modèles de croquettes sur 373 y figurent. Ce test dit que Google connaît la requête, pas son volume. Toutes les pages vivent sous `/chien/avis-marques/`. Article transactionnel de 7 h (`deploy/new-article-prompt.md`).

Maillage, le point fort de ces pages :
- Une page modèle cite sa page marque dès l'introduction. Elle cite aussi 2 modèles voisins de la marque déjà publiés et, s'il existe, un duel. Si sa page marque n'existe pas, écrire d'abord la page marque.
- Chaque page marque garde une section « Quel modèle {marque} choisir ? » : à chaque nouvelle page modèle, ajouter une ligne avec le lien et le fait qui distingue la recette. Page marque non encore dotée de cette section : la créer juste avant « Questions fréquentes ».
- Les duels citent les deux pages marques, et ces pages citent le duel.

Règles de ces pages, en plus de celles du haut du fichier :
- Le ton du haut de `deploy/new-article-prompt.md` passe avant les règles ci-dessous : une page d'avis se lit avec plaisir, ce n'est pas un rapport (rappel du propriétaire, 2026-11-06).
- Partir des vraies pages produit : `node_modules/.bin/tsx scripts/maxizoo-lookup.ts royal canin mini adulte` donne les codes-barres, puis `--lire=CODE` donne la composition, l'analyse, les calories, la note du scanner, le lien exact et l'image. 15 lectures au plus par article. Page illisible : essayer une autre taille, sinon ne rien affirmer sur ce produit.
- Lire deux tailles de la même recette quand elles existent. Notes différentes de plus de 5 points : ne pas citer la note, s'en tenir à la composition, et le dire dans le compte rendu.
- Une page modèle doit dire ce que ce modèle a de propre face à ses voisins : premier ingrédient, protéines, matières grasses, calories, chien visé. Une taille de sac n'est jamais un sujet. Modèle introuvable dans l'outil, ou composition identique à un modèle déjà publié : cocher `[~]` avec la raison et passer au suivant.
- Le verdict tombe dans le TL;DR en langage courant : la note, ce qui est bien, ce qui coince. Protéines, matières grasses et calcium vont dans le tableau de la page, pas dans la phrase.
- Bloc produits, un seul, avec 1 à 3 produits : `<ProductPicks title="…"><ProductPick name="…" why="…" href="LIEN" image="IMAGE" /></ProductPicks>`, `LIEN` et `IMAGE` copiés de l'outil, jamais de lien tidd.ly ni de lien inventé. `why` donne un fait lu sur la page. Une formule vétérinaire porte `vet`.
- Recette notée sous 55 : proposer une recette Maxi Zoo notée au moins 70 et 15 points plus haut, lue avec l'outil, ou un partenaire si le sujet s'y prête.
- Jamais : faux témoignage, note d'avis clients recopiée sans la page, « notre test » ou « testé » (on lit des étiquettes, on ne nourrit pas de chiens), « recommandé par les vétérinaires » sans source, « scanné » pour un produit qu'aucun lecteur n'a scanné, promesse de soin. Prix seulement avec « relevé le {date} ».
- Requête « avis vétérinaire » : répondre à ce que disent les sources publiées et renvoyer vers le vétérinaire du chien. Le site n'a pas de vétérinaire relecteur, ne pas le laisser croire.
- Frontmatter : `category: "Avis & Comparatif"`, `categorySlug: "avis-marques"`. Couverture : un chien et sa gamelle, sans paquet, sans logo, sans nom de marque.

### Avis marques

Pages mères déjà en ligne, à doter de la section des modèles au premier modèle publié : Royal Canin, Hill's, Pro Plan, Acana, Orijen.

- [x] Edgard & Cooper : avis sur les croquettes et la composition (edgard cooper avis, avis vétérinaire) → avis-edgard-cooper
- [ ] Select Gold : avis sur les croquettes de Maxi Zoo (select gold avis, avis vétérinaire)
- [ ] Real Nature : avis sur la marque, les croquettes et la pâtée (real nature avis, real nature wilderness avis)
- [ ] Atavik : avis sur la marque (atavik avis)
- [ ] Eukanuba : avis sur les croquettes (eukanuba avis, avis vétérinaire)
- [ ] Premiere : avis sur les croquettes et les pâtées Meati (premiere croquette chien avis)
- [ ] Carnilove : avis sur les croquettes (carnilove avis chien)
- [ ] Nature's Variety : avis sur les croquettes (nature's variety chien avis)
- [ ] Ultima chien : avis sur les croquettes (ultima chien avis vétérinaire)
- [ ] Pedigree : bon ou mauvais, avis sur la composition (pedigree bon ou mauvais)
- [ ] Advance chien : avis sur les croquettes (croquettes advance chien avis)
- [ ] Pâtée Cesar : avis pour un chien (pâtée cesar chien avis)
- [ ] Dentastix : avis et composition (dentastix avis, avis vétérinaire)
- [ ] Dentalife : avis et composition (avis dentalife chien)
- [ ] Whimzees : avis et composition (whimzees chien avis)

### Avis modèles

Titre : « {Modèle} : avis et composition ». Les marques alternent dans la liste. Les modèles dont Google suggère déjà « … avis » passent devant dans leur marque. Les 175 autres modèles du fichier restent hors liste tant que la Search Console ne montre pas de demande.

- [ ] Edgard & Cooper chiot : avis et quantités (edgard cooper chiot avis, quantité)
- [ ] Edgard & Cooper barquettes : avis sur la pâtée (edgard cooper barquette chien)
- [ ] Pro Plan Sensitive Digestion à l'agneau : avis (pro plan sensitive digestion agneau avis)
- [ ] Select Gold Sensitive : pour quel chien (select gold sensitive chien avis)
- [ ] Wilderness pâtée pour chien : avis (real nature pâtée chien avis)
- [ ] Premiere Meati : avis sur la pâtée (premiere meati chien)
- [ ] Eukanuba Puppy : avis pour un chiot (eukanuba puppy avis)
- [ ] Orijen Original : avis et composition (orijen original chien)
- [ ] Royal Canin Bouledogue Français Adulte (royal canin bouledogue français adulte)
- [ ] Pro Plan Puppy Medium Sensitive Digestion (pro plan puppy medium sensitive digestion)
- [ ] Orijen Chiot (orijen chiot)
- [ ] Acana Chiot Grande Race (acana chiot grande race)
- [ ] Hill's Sensitive Stomach & Skin (hill's sensitive stomach & skin)
- [ ] Real Nature Country Selection Adulte Scandinavia (real nature country selection adulte scandinavia)
- [ ] Eukanuba Adulte Grande Taille Poulet (eukanuba adulte grande taille poulet)
- [ ] Ultima Medium Maxi Light (ultima medium maxi light)
- [ ] Select Gold Complete Adulte Medium Poulet (select gold complete adulte medium poulet)
- [ ] Premiere Best Meat Adulte Bœuf (premiere best meat adulte bœuf)
- [ ] Nature's Variety Healthy Grains Adulte Mini (nature's variety healthy grains adulte mini)
- [ ] Carnilove Active Agneau & Sanglier (carnilove active agneau & sanglier)
- [ ] Royal Canin Chihuahua Puppy (royal canin chihuahua puppy)
- [ ] Pro Plan Adult 7+ Medium (pro plan adult 7+ medium)
- [ ] Orijen Fit & Trim (orijen fit & trim)
- [ ] Acana Light & Fit (acana light & fit)
- [ ] Hill's Adult Healthy Mobility Poulet (hill's adult healthy mobility poulet)
- [ ] Real Nature Country Selection Irish Green (real nature country selection irish green)
- [ ] Eukanuba Breed Specific Berger Allemand (eukanuba breed specific berger allemand)
- [ ] Ultima Medium Maxi Adulte Poulet (ultima medium maxi adulte poulet)
- [ ] Select Gold Complete Maxi Junior Poulet (select gold complete maxi junior poulet)
- [ ] Premiere Best Meat Junior Volaille (premiere best meat junior volaille)
- [ ] Nature's Variety Healthy Grains Chiot Mini (nature's variety healthy grains chiot mini)
- [ ] Royal Canin Dermacomfort Mini (royal canin dermacomfort mini)
- [ ] Pro Plan Adult Large Athletic Everyday (pro plan adult large athletic everyday)
- [ ] Orijen Senior (orijen senior)
- [ ] Acana Pacifica (acana pacifica)
- [ ] Hill's Mature Adult 7+ (hill's mature adult 7+)
- [ ] Real Nature Country Selection Mini Adult (real nature country selection mini adult)
- [ ] Eukanuba Breed Specific Boxer (eukanuba breed specific boxer)
- [ ] Ultima Medium Maxi Senior Poulet (ultima medium maxi senior poulet)
- [ ] Select Gold Complete Senior Maxi Poulet (select gold complete senior maxi poulet)
- [ ] Nature's Variety Healthy Grains Mini Adulte (nature's variety healthy grains mini adulte)
- [ ] Royal Canin Giant Chiot (royal canin giant chiot)
- [ ] Pro Plan Adult Large Robust Everyday (pro plan adult large robust everyday)
- [ ] Orijen Six Fish (orijen six fish)
- [ ] Acana Puppy Large Breed (acana puppy large breed)
- [ ] Hill's Mature Adult Mini (hill's mature adult mini)
- [ ] Real Nature Wilderness Adulte Pure Chicken (real nature wilderness adulte pure chicken)
- [ ] Eukanuba Breed Specific Golden Retriever (eukanuba breed specific golden retriever)
- [ ] Ultima Petit Adulte Poulet (ultima petit adulte poulet)
- [ ] Select Gold Light Mini Adulte Poulet (select gold light mini adulte poulet)
- [ ] Nature's Variety No Grain Mini Adulte (nature's variety no grain mini adulte)
- [ ] Royal Canin Giant Junior (royal canin giant junior)
- [ ] Pro Plan Adult Medium Sensitive Digestion (pro plan adult medium sensitive digestion)
- [ ] Orijen Small Breed (orijen small breed)
- [ ] Acana Senior (acana senior)
- [ ] Hill's Puppy Medium Breed (hill's puppy medium breed)
- [ ] Real Nature Wilderness Adulte Pure Salmon (real nature wilderness adulte pure salmon)
- [ ] Eukanuba Breed Specific Rottweiler (eukanuba breed specific rottweiler)
- [ ] Ultima Petit Junior Poulet (ultima petit junior poulet)
- [ ] Royal Canin Golden Retriever Chiot (royal canin golden retriever chiot)
- [ ] Pro Plan Adult Small & Mini (pro plan adult small & mini)
- [ ] Orijen Chiot Grande Race (orijen chiot grande race)
- [ ] Acana Adult Dog (acana adult dog)
- [ ] Hill's Chiot Grande Race Poulet (hill's chiot grande race poulet)
- [ ] Real Nature Wilderness Fresh Meat Beef (real nature wilderness fresh meat beef)
- [ ] Eukanuba Breed Specific West Highland (eukanuba breed specific west highland)
- [ ] Royal Canin Maxi Adulte (royal canin maxi adulte)
- [ ] Pro Plan Adulte Large Athletic Sensitive (pro plan adulte large athletic sensitive)
- [ ] Orijen Regional Red (orijen regional red)
- [ ] Acana Adult Small Breed (acana adult small breed)
- [ ] Hill's Healthy Mobility Grande Race (hill's healthy mobility grande race)
- [ ] Real Nature Wilderness Fresh Meat Turkey (real nature wilderness fresh meat turkey)
- [ ] Eukanuba Premium Working & Endurance (eukanuba premium working & endurance)
- [ ] Royal Canin Medium Adulte (royal canin medium adulte)
- [ ] Pro Plan Adulte Medium Everyday Nutrition (pro plan adulte medium everyday nutrition)
- [ ] Orijen Small Breed Marine Adult (orijen small breed marine adult)
- [ ] Acana Adulte Grande Race (acana adulte grande race)
- [ ] Hill's Healthy Mobility Medium Adult (hill's healthy mobility medium adult)
- [ ] Real Nature Wilderness Junior Pure Chicken (real nature wilderness junior pure chicken)
- [ ] Eukanuba Weight Control Medium Breed (eukanuba weight control medium breed)
- [ ] Royal Canin Medium Chiot (royal canin medium chiot)
- [ ] Pro Plan Adulte Medium Sensitive Skin (pro plan adulte medium sensitive skin)
- [ ] Orijen Tundra (orijen tundra)
- [ ] Acana Chiot Petite Race (acana chiot petite race)
- [ ] Hill's Hypoallergenic Medium Adult Saumon (hill's hypoallergenic medium adult saumon)
- [ ] Real Nature Wilderness Junior True Country (real nature wilderness junior true country)
- [ ] Royal Canin Medium Starter (royal canin medium starter)
- [ ] Pro Plan All Sizes Adult Dog (pro plan all sizes adult dog)
- [ ] Acana Classic Red (acana classic red)
- [ ] Hill's Large Breed Adult Poulet (hill's large breed adult poulet)
- [ ] Real Nature Wilderness Junior Wild Valley (real nature wilderness junior wild valley)
- [ ] Royal Canin Mini Adulte (royal canin mini adulte)
- [ ] Pro Plan All Sizes Adult Light (pro plan all sizes adult light)
- [ ] Acana Grasslands (acana grasslands)
- [ ] Hill's Large Breed Mature Adult (hill's large breed mature adult)
- [ ] Real Nature Wilderness Maxi Junior (real nature wilderness maxi junior)
- [ ] Royal Canin Rottweiler (royal canin rottweiler)
- [ ] Pro Plan Large Athletic Puppy Sensitive (pro plan large athletic puppy sensitive)
- [ ] Acana Prairie Poultry (acana prairie poultry)
- [ ] Hill's Light Large Breed Adult (hill's light large breed adult)
- [ ] Real Nature Wilderness Mini Adult Green (real nature wilderness mini adult green)
- [ ] Royal Canin Sterilised Medium (royal canin sterilised medium)
- [ ] Pro Plan Large Puppy Athletic Poulet (pro plan large puppy athletic poulet)
- [ ] Acana Recette Chiot (acana recette chiot)
- [ ] Hill's Light Medium Mature Adult (hill's light medium mature adult)
- [ ] Real Nature Wilderness Senior Dark Fjord (real nature wilderness senior dark fjord)
- [ ] Royal Canin Adult X Small (royal canin adult x small)
- [ ] Pro Plan Large Robust Puppy Poulet (pro plan large robust puppy poulet)
- [ ] Acana Wild Prairie (acana wild prairie)
- [ ] Hill's Light Small & Mini (hill's light small & mini)
- [ ] Real Nature Wilderness Senior Pure Beef (real nature wilderness senior pure beef)
- [ ] Royal Canin Beagle Adulte (royal canin beagle adulte)
- [ ] Pro Plan Medium & Large Adult (pro plan medium & large adult)
- [ ] Hill's Medium Adult 1-6 (hill's medium adult 1-6)
- [ ] Real Nature Wilderness Senior Pure Chicken (real nature wilderness senior pure chicken)
- [ ] Royal Canin Berger Allemand Adulte (royal canin berger allemand adulte)
- [ ] Pro Plan Puppy Large Athletic Healthy (pro plan puppy large athletic healthy)
- [ ] Hill's Medium Adulte Poulet (hill's medium adulte poulet)
- [ ] Real Nature Wilderness Senior True Country (real nature wilderness senior true country)
- [ ] Royal Canin Berger Allemand Chiot (royal canin berger allemand chiot)
- [ ] Pro Plan Puppy Medium Healthy Start (pro plan puppy medium healthy start)
- [ ] Hill's Medium Chiot Poulet (hill's medium chiot poulet)
- [ ] Real Nature Wilderness Wild Valley Senior (real nature wilderness wild valley senior)
- [ ] Royal Canin Bichon Frise Adulte (royal canin bichon frise adulte)
- [ ] Pro Plan Puppy Medium Sensitive Skin (pro plan puppy medium sensitive skin)
- [ ] Hill's Oral Care Adult Poulet (hill's oral care adult poulet)
- [ ] Royal Canin Boxer Adulte (royal canin boxer adulte)
- [ ] Pro Plan Small & Mini Puppy (pro plan small & mini puppy)
- [ ] Hill's Perfect Digestion Medium Adult (hill's perfect digestion medium adult)
- [ ] Royal Canin Boxer Chiot (royal canin boxer chiot)
- [ ] Hill's Perfect Digestion Small & Mini (hill's perfect digestion small & mini)
- [ ] Royal Canin Bulldog Adulte (royal canin bulldog adulte)
- [ ] Hill's Perfect Weight & Active (hill's perfect weight & active)
- [ ] Royal Canin Caniche Adulte (royal canin caniche adulte)
- [ ] Hill's Perfect Weight Active Mobility (hill's perfect weight active mobility)
- [ ] Royal Canin Carlin Adulte (royal canin carlin adulte)
- [ ] Hill's Perfect Weight Medium Adult (hill's perfect weight medium adult)
- [ ] Royal Canin Carlin Chiot (royal canin carlin chiot)
- [ ] Hill's Puppy Large Breed Chicken (hill's puppy large breed chicken)
- [ ] Royal Canin Cavalier King Charles Adulte (royal canin cavalier king charles adulte)
- [ ] Hill's Senior Small & Mini (hill's senior small & mini)
- [ ] Royal Canin Cavalier King Charles Chiot (royal canin cavalier king charles chiot)
- [ ] Hill's Senior Vitality Medium Mature (hill's senior vitality medium mature)
- [ ] Royal Canin Chihuahua Adulte (royal canin chihuahua adulte)
- [ ] Hill's Small & Mini Adult (hill's small & mini adult)
- [ ] Royal Canin Chiot Yorkshire Terrier (royal canin chiot yorkshire terrier)
- [ ] Hill's Small & Mini Mature (hill's small & mini mature)
- [ ] Royal Canin Club Special Performance Adulte (royal canin club special performance adulte)
- [ ] Hill's Small & Mini Puppy (hill's small & mini puppy)
- [ ] Royal Canin Cocker Adulte (royal canin cocker adulte)
- [ ] Royal Canin Cocker Chiot (royal canin cocker chiot)
- [ ] Royal Canin Dalmatian Puppy (royal canin dalmatian puppy)
- [ ] Royal Canin Dalmatien Adulte (royal canin dalmatien adulte)
- [ ] Royal Canin Dental Care Maxi (royal canin dental care maxi)
- [ ] Royal Canin Dental Care Medium (royal canin dental care medium)
- [ ] Royal Canin Dermacomfort Maxi (royal canin dermacomfort maxi)
- [ ] Royal Canin Dermacomfort Medium (royal canin dermacomfort medium)
- [ ] Royal Canin Digestive Care Maxi (royal canin digestive care maxi)
- [ ] Royal Canin Digestive Care Medium (royal canin digestive care medium)
- [ ] Royal Canin Digestive Care Mini (royal canin digestive care mini)
- [ ] Royal Canin Energy 4100 Agility (royal canin energy 4100 agility)
- [ ] Royal Canin Exigent Mini (royal canin exigent mini)
- [ ] Royal Canin Giant Adult (royal canin giant adult)
- [ ] Royal Canin Giant Starter (royal canin giant starter)
- [ ] Royal Canin Golden Retriever Adulte (royal canin golden retriever adulte)
- [ ] Royal Canin Labrador Adulte Stérilisé (royal canin labrador adulte stérilisé)
- [ ] Royal Canin Labrador Retriever 5+ Adult (royal canin labrador retriever 5+ adult)
- [ ] Royal Canin Labrador Retriever Adulte (royal canin labrador retriever adulte)
- [ ] Royal Canin Labrador Retriever Chiot (royal canin labrador retriever chiot)
- [ ] Royal Canin Light Weight Care Medium (royal canin light weight care medium)
- [ ] Royal Canin Light Weight Care Mini (royal canin light weight care mini)
- [ ] Royal Canin Maltese Adult (royal canin maltese adult)
- [ ] Royal Canin Maxi Adult 5+ (royal canin maxi adult 5+)
- [ ] Royal Canin Maxi Ageing 8+ (royal canin maxi ageing 8+)
- [ ] Royal Canin Maxi Chiot (royal canin maxi chiot)
- [ ] Royal Canin Maxi Joint Care (royal canin maxi joint care)
- [ ] Royal Canin Maxi Starter (royal canin maxi starter)
- [ ] Royal Canin Medium Adult 7+ (royal canin medium adult 7+)
- [ ] Royal Canin Medium Ageing 10+ (royal canin medium ageing 10+)
- [ ] Royal Canin Mini Adult 8+ (royal canin mini adult 8+)
- [ ] Royal Canin Mini Ageing 12+ (royal canin mini ageing 12+)
- [ ] Royal Canin Mini Chiot (royal canin mini chiot)
- [ ] Royal Canin Mini Starter (royal canin mini starter)
- [ ] Royal Canin Pomeranian Adult (royal canin pomeranian adult)
- [ ] Royal Canin Poodle Puppy (royal canin poodle puppy)
- [ ] Royal Canin Relax Care Maxi (royal canin relax care maxi)
- [ ] Royal Canin Relax Care Medium (royal canin relax care medium)
- [ ] Royal Canin Relax Care Mini (royal canin relax care mini)
- [ ] Royal Canin Rottweiler Puppy (royal canin rottweiler puppy)
- [ ] Royal Canin Shih Tzu Adulte (royal canin shih tzu adulte)
- [ ] Royal Canin Shih Tzu Puppy (royal canin shih tzu puppy)
- [ ] Royal Canin Sterilised Maxi (royal canin sterilised maxi)
- [ ] Royal Canin Sterilised Mini (royal canin sterilised mini)
- [ ] Royal Canin Teckel Adulte (royal canin teckel adulte)
- [ ] Royal Canin Teckel Chiot (royal canin teckel chiot)
- [ ] Royal Canin Urinary Care Mini (royal canin urinary care mini)
- [ ] Royal Canin West Highland White Terrier (royal canin west highland white terrier)
- [ ] Royal Canin X Small Adult 8+ (royal canin x small adult 8+)
- [ ] Royal Canin X Small Ageing 12+ (royal canin x small ageing 12+)
- [ ] Royal Canin X Small Chiot (royal canin x small chiot)
- [ ] Royal Canin X Small Sterilised (royal canin x small sterilised)
- [ ] Royal Canin Yorkshire Terrier 8+ (royal canin yorkshire terrier 8+)
- [ ] Royal Canin Yorkshire Terrier Adult (royal canin yorkshire terrier adult)

### Duels et besoins

- [ ] Royal Canin ou Pro Plan : lequel choisir pour son chien (royal canin ou proplan chien)
- [ ] Quelles croquettes choisir chez Maxi Zoo (croquettes maxi zoo chien)
- [ ] Orijen ou Acana : quelles différences (orijen ou acana)
- [ ] Royal Canin ou Hill's : lequel choisir (royal canin ou hills)
- [ ] Pro Plan ou Hill's : lequel choisir (hill's ou proplan)
- [ ] Select Gold, Real Nature, Premiere : quelles différences entre les marques de Maxi Zoo (croquettes maxi zoo select gold, wilderness)
- [ ] Eukanuba ou Pro Plan : lequel choisir (eukanuba ou proplan)
- [ ] Edgard & Cooper ou Royal Canin : lequel choisir (edgard cooper vs royal canin)
- [ ] Croquettes hypoallergéniques pour chien : avis et lecture de l'étiquette (croquettes hypoallergéniques chien avis)
- [ ] Eukanuba ou Hill's : lequel choisir (eukanuba ou hill's)
- [ ] Select Gold ou Royal Canin : lequel choisir (select gold ou royal canin)
- [ ] Acana ou Royal Canin : lequel choisir (acana ou royal canin)
- [ ] Carnilove ou Orijen : lequel choisir (carnilove ou orijen)
- [ ] Carnilove ou Wilderness : lequel choisir (carnilove ou wilderness)
- [ ] Dentastix ou Dentalife : lequel choisir (dentastix ou dentalife)

## Compléments Maxi Zoo (`scanner`)

Demande du propriétaire (2026-11-05). Requêtes relevées dans les suggestions Google le 2026-11-05. Environ 30 compléments pour chien dans le fichier Maxi Zoo (PetBalance, Premiere, Beaphar, Canosept, FortiFlora). Article transactionnel.

Règles de ces pages, en plus de celles de « Avis + Maxi Zoo » :
- Pas de note ni de classement : le barème du scanner vise les aliments. On présente une sélection, avec ce que contient le produit et à qui il s'adresse.
- `node_modules/.bin/tsx scripts/maxizoo-lookup.ts petbalance articulations` donne les produits et, avec `--lire=CODE`, le lien exact et l'image. Sur un complément, `--lire` s'arrête souvent après le lien : lire la composition sur la page indiquée par WebFetch, et ne rien affirmer si elle est absente.
- Un complément ne soigne pas : jamais de promesse de guérison, efficacité dite telle que les études la montrent, dose et contre-indications exactes, avis du vétérinaire pour un chien malade, gestant ou sous traitement. Chiot : jamais de calcium ajouté à un aliment complet sans avis vétérinaire.
- Maillage : la page centrale liste les pages par besoin et les articles par ingrédient (`huile-saumon-chien-bienfaits-dosage`, `probiotiques-chien-bienfaits-dosage`, `glucosamine-chondroitine-chien-articulations`, `omega-3-chien-comparatif-sources`, `levure-de-biere-chien-bienfaits-dosage`, `spiruline-chien-bienfaits-dosage`, `collagene-chien-bienfaits-dosage`, `curcuma-chien-bienfaits-dosage`, `huile-de-coco-chien-bienfaits-dosage`). Chaque nouvelle page les cite et leur ajoute, si le produit s'y prête, un bloc `<ProductPicks>` et un lien vers la page centrale.
- Barre collante : si un produit Maxi Zoo correspond exactement au sujet, ajouter au frontmatter `stickyProduct:` avec `name` (court) et `url` (lien de l'outil), et un bloc `<ProductPicks>` avant la FAQ. Aucun produit exact : pas de barre. Jamais sur une page d'urgence ou de maladie grave.
- Frontmatter : même `category` et `categorySlug` que `huile-saumon-chien-bienfaits-dosage`. Une page par besoin, jamais par taille de flacon.

- [ ] Complément alimentaire pour chien : lesquels servent vraiment (meilleur complement alimentaire chien) : page centrale, à écrire en premier
- [ ] Complément alimentaire pour les articulations du chien (complement alimentaire articulation chien, maxi zoo)
- [ ] Complément alimentaire contre les démangeaisons du chien (meilleur complement alimentaire chien demangeaison)
- [ ] Complément alimentaire pour chien senior (meilleur complement alimentaire chien senior)
- [ ] Complément alimentaire pour chien arthrosique (complément alimentaire chien arthrose)
- [ ] FortiFlora pour chien : avis et dosage (probiotique chien fortiflora)
- [ ] Complément alimentaire pour le pelage du chien (complement alimentaire pelage chien)
- [ ] Complément pour la digestion du chien (complement alimentaire digestion chien)
- [ ] Apaisant naturel pour chien : ce qui marche (calmant naturel chien, apaisant naturel chien)
- [ ] Complément alimentaire pour faire grossir un chien (complément alimentaire chien prise de poids)
- [ ] Complément alimentaire pour chiot : faut-il en donner (complément alimentaire chiot)
- [ ] Huile de saumon de Maxi Zoo : laquelle choisir (huile de saumon chien maxi zoo)

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

- [x] Le chien peut-il manger du paprika ? → chien-peut-manger-paprika
- [ ] Le chien peut-il manger des merguez ?
- [ ] Le chien peut-il manger du skyr ?
- [ ] Le chien peut-il manger de la choucroute ?
- [ ] Mon chien ne mange plus et reste couché : que faire ? (`bien-nourri`)
- [ ] Ultra Premium Direct ou Franklin Pet Food : lequel choisir ? (`quiz`)
- [ ] Le chien peut-il manger du curry ?
- [ ] Le chien peut-il manger des châtaignes ?
- [ ] Le chien peut-il manger du ketchup ?

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
