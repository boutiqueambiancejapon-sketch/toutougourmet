import { ANALYTICAL_KEYS, CONFIDENCE, CONFIDENCE_FIELDS, DOUBT_FIELDS, FOOD_TYPES, IMAGE_TYPES, LEGIBILITY, SPECIES } from './types'

// @cdc lot 6 — consigne et schéma JSON de sortie, partagés par tous les fournisseurs.
// Schéma JSON standard (type: [x, 'null'] pour les champs facultatifs) : chaque fournisseur le
// convertit au format de son API (Gemini : responseSchema ; Claude : input_schema d'un outil).

export type JsonSchema = {
  type: string | string[]
  description?: string
  enum?: readonly string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  items?: JsonSchema
}

const nullableNumber = (description: string): JsonSchema => ({ type: ['number', 'null'], description })
const confidence: JsonSchema = { type: 'string', enum: CONFIDENCE }

const ANALYTICAL_LABELS: Record<(typeof ANALYTICAL_KEYS)[number], string> = {
  proteines: 'Protéines (ou protéine brute), en %',
  matieresGrasses: 'Matières grasses (teneur en matières grasses, MG brutes), en %',
  cellulose: 'Cellulose brute ou fibres brutes, en %',
  cendres: 'Cendres brutes (matières minérales, matières inorganiques), en %',
  humidite: 'Humidité, en %',
  calcium: 'Calcium, en %',
  phosphore: 'Phosphore, en %',
}

export const LABEL_JSON_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    estUneEtiquette: { type: 'boolean', description: "true si les images montrent l'étiquette d'un aliment pour animal" },
    typeImage: {
      type: 'string',
      enum: IMAGE_TYPES,
      description: 'aliment-chien = aliment complet pour chien (croquettes, pâtée) ; aliment-chat ; friandise = friandise, biscuit, os à mâcher, aliment complémentaire ; autre = pas une étiquette d\'aliment pour animal',
    },
    lisibilite: { type: 'string', enum: LEGIBILITY, description: 'floue si le texte de l\'étiquette est flou, trop loin, coupé par un reflet ou trop petit pour être lu' },
    marque: { type: ['string', 'null'], description: 'Marque telle qu\'écrite' },
    produit: { type: ['string', 'null'], description: 'Nom de la recette ou du produit' },
    ean: { type: ['string', 'null'], description: 'Chiffres du code-barres EAN-8 ou EAN-13 s\'ils sont lisibles, sinon null' },
    espece: { type: 'string', enum: SPECIES, description: 'Animal visé' },
    typeAliment: { type: 'string', enum: FOOD_TYPES, description: 'sec = croquettes, humide = pâtée ou terrine' },
    ingredients: {
      type: 'array',
      description: 'Composition, dans l\'ordre exact de l\'étiquette, un élément par ingrédient',
      items: {
        type: 'object',
        properties: {
          nom: { type: 'string', description: 'Ingrédient recopié tel quel, sans son pourcentage' },
          pourcentage: nullableNumber('Pourcentage écrit pour cet ingrédient, sinon null'),
        },
        required: ['nom', 'pourcentage'],
      },
    },
    constituants: {
      type: 'object',
      description: 'Constituants analytiques recopiés tels quels, null si absents',
      properties: Object.fromEntries(ANALYTICAL_KEYS.map((k) => [k, nullableNumber(ANALYTICAL_LABELS[k])])),
      required: [...ANALYTICAL_KEYS],
    },
    additifs: {
      type: 'array',
      description: 'Additifs listés (technologiques, nutritionnels, sensoriels), un élément par additif avec son code E s\'il est écrit',
      items: { type: 'string' },
    },
    partAnimaleDeclaree: nullableNumber('Part totale d\'ingrédients d\'origine animale annoncée sur l\'emballage (ex. « 70 % de viande »), sinon null'),
    confiance: {
      type: 'object',
      description: 'Confiance de lecture par champ : absent si le champ n\'apparaît pas sur les images',
      properties: Object.fromEntries(CONFIDENCE_FIELDS.map((k) => [k, confidence])),
      required: [...CONFIDENCE_FIELDS],
    },
    illisibles: { type: 'array', description: 'Passages présents mais illisibles (flou, reflet, coupé)', items: { type: 'string' } },
    champsDouteux: {
      type: 'array',
      description: 'Valeurs recopiées dont tu n\'es pas sûr (chiffre en partie caché, 8 ou 3, virgule invisible). ingredients si la liste est en partie illisible',
      items: { type: 'string', enum: DOUBT_FIELDS },
    },
  },
  required: [
    'estUneEtiquette',
    'typeImage',
    'lisibilite',
    'marque',
    'produit',
    'ean',
    'espece',
    'typeAliment',
    'ingredients',
    'constituants',
    'additifs',
    'partAnimaleDeclaree',
    'confiance',
    'illisibles',
    'champsDouteux',
  ],
}

export const LABEL_INSTRUCTIONS = `Tu lis l'étiquette d'un aliment pour animal de compagnie (photos fournies) et tu recopies son contenu en JSON.
Règles :
- Recopie uniquement ce qui est écrit. N'invente rien, ne complète rien de mémoire, même si tu connais le produit.
- Garde la langue et l'orthographe de l'étiquette pour les ingrédients. Respecte leur ordre.
- Un ingrédient = un élément. Les sous-listes entre parenthèses restent dans le nom de l'ingrédient parent.
- Les pourcentages sont des nombres (ex. 26 pour « 26 % », 0.9 pour « 0,9 % »).
- Les constituants analytiques sont les valeurs « telles quelles » de l'étiquette, sans calcul.
- Un champ absent des images vaut null (ou liste vide) et sa confiance vaut « absent ».
- Un passage visible mais illisible va dans « illisibles » et la confiance du champ baisse.
- Si les images ne montrent pas une étiquette d'aliment pour animal, estUneEtiquette vaut false et typeImage vaut autre.
- Texte trop flou pour être lu : lisibilite vaut floue, listes vides, espece inconnu et typeImage aliment-chien si l'emballage ressemble à un aliment pour chien. Ne devine ni l'animal ni le contenu.
- Un chiffre dont tu n'es pas sûr va dans champsDouteux : ne le devine pas, recopie ce que tu vois.
- Les photos peuvent montrer des faces différentes du même sac (composition, constituants, devant du sac) : réunis-les.`
