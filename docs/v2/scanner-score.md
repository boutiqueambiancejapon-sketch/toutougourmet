# Barème du scanner d'étiquette (version 1.0, 2026-11-02)

Code : `lib/scanner/score.ts` (fonction pure `scoreLabel`) et `lib/scanner/ingredients.ts` (reconnaissance des ingrédients). Tests : `npx tsx scripts/test-scanner-score.ts`. Page publique qui résume ce document : `/scanner#methode`.

Principe : l'IA recopie l'étiquette (`ExtractedLabel`), elle ne note pas. La note est calculée par ce barème, identique pour tous les produits. Toute modification d'un seuil ou d'un poids change `SCORE_VERSION` ; les analyses en cache sont alors recalculées à la lecture (l'étiquette lue est conservée, seule la note change).

## Calculs de base

- Matière sèche (MS) : `valeur × 100 ÷ (100 − humidité)`. Les minimums FEDIAF, NRC et AAFCO sont exprimés sur MS (ou pour 1 000 kcal) : comparer des valeurs « telles quelles » entre une croquette à 8 % d'eau et une pâtée à 80 % n'a pas de sens.
- Glucides (extractif non azoté) : `100 − protéines − matières grasses − cendres − cellulose − humidité`, ramené sur MS. Méthode par différence utilisée par la FEDIAF et le NRC (2006, chap. 3) faute de déclaration obligatoire des glucides.
- Humidité absente : le règlement (CE) n° 767/2009 (annexe VII, chapitre I) n'impose sa mention pour les aliments des animaux familiers qu'au-delà de 14 %. Pour un aliment sec dont protéines + MG + cendres + cellulose ≤ 80 %, on retient 10 % et l'hypothèse est affichée. Pour une pâtée, aucune hypothèse : les critères sur MS ne sont pas évalués.

## Critères (100 points, + 5 si le rapport Ca/P est écrit)

| Critère | Points | Barème | Justification |
|---|---|---|---|
| Protéines sur MS | 20 | < 18 % : 0 · 18-22 : 6 · 22-26 : 11 · 26-30 : 15 · 30-36 : 18 · ≥ 36 : 20 | Minimum adulte : 18 g/100 g MS (FEDIAF 2021, base 110 kcal/kg^0,75 ; 21 g à 95 kcal), 18 % MS (AAFCO, entretien). La marge au-dessus du minimum couvre la digestibilité variable des protéines. Plafond à 36 % : au-delà, pas de bénéfice démontré pour un adulte sain. |
| Matières grasses sur MS | 10 | < 5,5 : 0 · 5,5-10 : 5 · 10-22 : 10 · 22-28 : 8 · > 28 : 6 | Minimum 5,5 g/100 g MS (FEDIAF 2021, AAFCO). Au-delà de 22 %, densité énergétique élevée : risque de surpoids pour un chien peu actif (NRC 2006, chap. 3 et 15). |
| Glucides estimés sur MS | 15 | ≤ 30 : 15 · 30-40 : 11 · 40-50 : 6 · > 50 : 2 | Pas de besoin minimal en glucides chez le chien adulte quand l'apport en protéines et graisses suffit (NRC 2006, chap. 3). Plus la part de glucides est forte, plus elle prend la place des protéines et des graisses. Le chien digère l'amidon (Axelsson et al., Nature 495, 2013) : pas de note nulle. |
| Premier ingrédient | 15 | espèce nommée : 15 · origine animale non précisée (« viande », « volaille ») : 7 · sous-produits : 3 · végétal : 0 | Les ingrédients sont listés par ordre de poids décroissant (règlement 767/2009, art. 17). Le premier ingrédient est le plus lourd de la recette. Un ingrédient frais compte avec son eau (~70 %) : signalé dans l'explication, sans pénalité. |
| Part de viande ou poisson déclarée | 10 | somme des % d'ingrédients animaux (hors graisses, huiles, hydrolysats) ou part annoncée : < 4 : 1 · 4-25 : 2 · 25-40 : 5 · 40-60 : 8 · ≥ 60 : 10 · rien d'écrit : 0 | Un pourcentage n'est obligatoire que si l'ingrédient est mis en avant (règlement 767/2009, art. 17 ; FEDIAF Code of Good Labelling Practice : « au poulet » ≥ 4 %, « riche en poulet » ≥ 14 %). Ne rien déclarer empêche de connaître la part animale : critère de transparence. |
| Ingrédients animaux non nommés | 10 | « viandes et sous-produits animaux », « sous-produits », « dérivés d'origine animale » : 0 · un ingrédient animal sans espèce (« graisses animales », « protéines de volaille ») : 5, deux ou plus : 3 | Catégories de la directive 82/475/CEE : elles ne disent ni l'espèce ni la partie de l'animal, et le fabricant peut changer la matière première sans changer l'étiquette. Les « dérivés d'origine végétale » ne comptent pas ici (pas animal) mais n'apportent pas de points au premier ingrédient. |
| Céréales en tête | 5 | 1re position : 0 · 2e ou 3e : 3 · deux céréales ou plus parmi les 5 premiers ingrédients (fractionnement, ex. « farine de maïs, maïs, farine de blé ») : 1 · absentes du trio de tête : 5 | Poids volontairement faible (les céréales ne sont pas toxiques, Axelsson 2013). Une céréale en tête signifie que l'ingrédient principal n'est pas animal ; recoupe en partie le critère des glucides. |
| Sucres ajoutés | 5 | sucre, saccharose, glucose, fructose, dextrose, sirop, caramel, mélasse, miel : 0 | Aucun besoin nutritionnel (NRC 2006) ; sert l'appétence. |
| Conservateurs controversés | 5 | BHA (E320), BHT (E321), éthoxyquine (E324) : 0 · « conservateurs » ou « antioxygènes » cités sans nom : 3 | Éthoxyquine : autorisation suspendue en alimentation animale (règlement d'exécution (UE) 2017/962). BHA : « cancérogène possible » (CIRC, groupe 2B, monographie vol. 40, 1986). BHT : autorisé, mais des alternatives (tocophérols, extraits de romarin) existent. |
| Colorants | 5 | « colorants », E1xx, oxydes de fer, dioxyde de titane : 0 | Aucun intérêt nutritionnel : la couleur des croquettes sert l'acheteur, pas le chien. Le dioxyde de titane (E171) n'est plus autorisé en alimentation humaine depuis 2022 (règlement (UE) 2022/63). |
| Rapport Ca/P | 5 (facultatif) | entre 1 et 2 pour 1 : 5 · sinon 0 · absent : non compté | FEDIAF 2021 et AAFCO : 1:1 à 2:1 pour l'adulte. Évalué seulement si les deux valeurs sont écrites (non obligatoires). |

## Informations manquantes

- Un critère sans l'information nécessaire est « non évalué » : il sort du calcul, la note est ramenée sur 100 à partir des critères évalués, et le résultat liste ce qui manque.
- Moins de 60 points évaluables (hors Ca/P) : pas de note, message « trop d'informations manquent ».
- Aliment pour chat : pas de note (seuils différents : FEDIAF 25 g de protéines/100 g MS chez le chat adulte).

## Tranches d'affichage

≥ 75 : très bonne composition (vert) · 55-74 : correcte (bleu) · 35-54 : moyenne (ambre) · < 35 : faible (rose).

## Limites connues (à traiter dans une version suivante)

- Seuils de l'adulte : un aliment « croissance » ou « senior » est noté avec les mêmes repères (FEDIAF croissance : 25 g de protéines/100 g MS avant 14 semaines, 20 g après).
- Pas de critère de digestibilité, d'origine des matières premières ni de procédé (extrusion, cuisson douce).
- Reconnaissance des ingrédients par listes de mots en français (et quelques mots anglais) : une étiquette dans une autre langue est moins bien lue par le barème.
- Les « protéines de volaille déshydratées » comptent comme origine animale non nommée (catégorie, pas espèce).

## Sources

- FEDIAF, *Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs*, 2021.
- FEDIAF, *Code of Good Labelling Practice for Pet Food*, 2019.
- National Research Council, *Nutrient Requirements of Dogs and Cats*, National Academies Press, 2006.
- AAFCO, *Dog Food Nutrient Profiles* (Official Publication).
- Règlement (CE) n° 767/2009 concernant la mise sur le marché et l'utilisation des aliments pour animaux.
- Directive 82/475/CEE (catégories d'ingrédients des aliments pour animaux familiers).
- Règlement d'exécution (UE) 2017/962 (suspension de l'autorisation de l'éthoxyquine).
- CIRC (IARC), *Monographs on the Evaluation of Carcinogenic Risks to Humans*, vol. 40, 1986 (BHA).
- Règlement (UE) 2022/63 (retrait de l'E171 en alimentation humaine).
- Axelsson E. et al., « The genomic signature of dog domestication reveals adaptation to a starch-rich diet », *Nature* 495, 360-364, 2013.


## Version 1.1 (2026-11-02)

Après le premier test réel : les ingrédients animaux sans espèce comptent désormais (avant, seules les catégories « sous-produits » étaient pénalisées), plusieurs céréales en tête de liste sont additionnées (fractionnement), et des antioxygènes non nommés ne valent plus la note pleine, puisqu'on ne peut pas exclure BHA, BHT ou éthoxyquine. Les analyses en cache sont recalculées à la lecture.

## Provenance des données (scanner v2, 2026-11-02)

La note ne change pas selon la provenance : le même barème s'applique à une étiquette `ExtractedLabel`, d'où qu'elle vienne. La colonne `food_analysis.source` (migration `0002_scanner_source.sql`) garde l'origine.

1. **Cache** (`food_analysis`, par EAN) : résultat immédiat, sans IA, non décompté, accessible sans compte.
2. **Open Pet Food Facts** (`source = 'openpetfoodfacts'`, `model = 'openpetfoodfacts'`) : requête serveur à `https://world.openpetfoodfacts.org/api/v2/product/{ean}.json`. Seul le code-barres part, avec un User-Agent qui identifie le site et un délai de 4 s. Conversion dans `lib/scanner/opff.ts` :
   - ingrédients : `ingredients_text_fr`, sinon `ingredients_text`, découpés par `lib/scanner/ingredient-text.ts` (virgules hors parenthèses, virgule décimale gardée, premier pourcentage de l'ingrédient, bloc des additifs à partir de « Additifs », « Vitamine A », « Antioxygènes ») ; les codes E de `additives_tags` s'ajoutent aux additifs ;
   - constituants : `crude-protein`, `crude-fat`, `crude-fibre`, `crude-ash`, `moisture` (en %), à défaut les champs `proteins`, `fat`, `fiber` ; calcium et phosphore repris seulement si leur unité est le % (la base mélange g et %) ;
   - fiche exploitable : aliment pour chien d'après les catégories, 3 ingrédients au moins, protéines et matières grasses présentes et plausibles (croquettes : protéines de 12 à 70 %, matières grasses de 3 à 45 %, somme des constituants ≤ 100), note calculable. Sinon, passage aux photos avec marque et produit préremplis ;
   - couverture mesurée le 2026-11-02 (`npx tsx scripts/opff-coverage.ts 2`) : 13 croquettes chien notables sur 105 vendues en France présentes dans la base (12 %) ;
   - mention « Données : Open Pet Food Facts, licence ODbL » sur le résultat, la fiche, la fiche A4 et l'image de partage.
3. **Photos** (`source = 'photo'`, compte requis, quota mensuel) : lecture par l'IA (`lib/scanner/label-schema.ts`). La sortie donne aussi `typeImage` (aliment chien, aliment chat, friandise, autre), `lisibilite` (nette, floue) et `champsDouteux`. Tri dans `lib/scanner/outcome.ts` : pas une étiquette, texte flou, aliment pour chat ou friandise donnent un refus non décompté ; une partie manquante (composition ou constituants) garde la session ouverte (jeton signé valable 30 min, `lib/server/scan-session.ts`) et la photo manquante n'est pas décomptée une seconde fois ; rien de lisible (devant du sac seul) n'est pas décompté. Un champ douteux s'affiche « à vérifier » sous la note : la personne peut corriger le chiffre (recalcul dans le navigateur) et l'envoyer comme signalement.
