// @cdc outils — questions du test « Quelle marque pour ton chien ? ». Le site ne couvre que
// le chien : la question chien / chat a été retirée. Le poids ne change pas la marque
// conseillée : il sert à pré-remplir le calcul de ration proposé après le résultat.

export interface QuizOption {
  value: string
  label: string
  /** Précision courte sous le libellé */
  hint?: string
}

export interface QuizChoiceStep {
  id: 'age' | 'probleme' | 'budget' | 'format'
  question: string
  help?: string
  type: 'single' | 'multi'
  options: QuizOption[]
}

export interface QuizWeightStep {
  id: 'poids'
  question: string
  help: string
  type: 'weight'
}

export type QuizStep = QuizChoiceStep | QuizWeightStep

/** Réponse « rien de particulier » : décoche les autres, et inversement. */
export const QUIZ_NONE = 'aucun'

export const quizSteps: QuizStep[] = [
  {
    id: 'age',
    question: 'Quel âge a ton chien ?',
    type: 'single',
    options: [
      { value: 'chiot', label: 'Chiot', hint: "Moins d'un an, jusqu'à 18 mois pour un grand chien" },
      { value: 'adulte', label: 'Adulte', hint: 'De 1 à 7 ans environ' },
      { value: 'senior', label: 'Senior', hint: 'Plus de 7 ans, plus tôt pour un grand chien' },
    ],
  },
  {
    id: 'poids',
    question: 'Combien pèse-t-il ?',
    help: "Pour pré-remplir sa ration à la fin du test. Ça ne change pas la marque conseillée.",
    type: 'weight',
  },
  {
    id: 'probleme',
    question: "Quelque chose t'inquiète ?",
    help: 'Tu peux cocher plusieurs réponses.',
    type: 'multi',
    options: [
      { value: 'digestion', label: 'Digestion fragile', hint: 'Selles molles, gaz, vomissements' },
      { value: 'allergie', label: 'Allergie ou peau sensible', hint: 'Démangeaisons, rougeurs' },
      { value: 'poids', label: 'Poids à corriger', hint: 'Trop gros ou trop maigre' },
      { value: 'poil', label: 'Poil terne ou qui tombe beaucoup' },
      { value: QUIZ_NONE, label: 'Rien de particulier' },
    ],
  },
  {
    id: 'budget',
    question: 'Quel budget par mois pour sa gamelle ?',
    type: 'single',
    options: [
      { value: 'petit', label: 'Moins de 30 €' },
      { value: 'moyen', label: 'De 30 à 60 €' },
      { value: 'grand', label: 'De 60 à 100 €' },
      { value: 'premium', label: 'Plus de 100 €' },
    ],
  },
  {
    id: 'format',
    question: "Quel type d'alimentation te tente ?",
    type: 'single',
    options: [
      { value: 'croquettes', label: 'Des croquettes', hint: 'Se gardent au placard' },
      { value: 'frais', label: 'Des repas frais', hint: 'Livrés, à garder au frigo' },
      { value: 'mixte', label: 'Un mélange des deux' },
      { value: 'aucune', label: 'Je ne sais pas encore' },
    ],
  },
]
