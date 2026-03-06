export interface QuizOption {
  value: string
  label: string
}

export interface QuizStep {
  id: string
  question: string
  type: 'single' | 'multi'
  options: QuizOption[]
}

export const quizSteps: QuizStep[] = [
  {
    id: 'animal',
    question: 'Tu as un chien ou un chat ?',
    type: 'single',
    options: [
      { value: 'chien', label: 'Un chien 🐶' },
      { value: 'chat', label: 'Un chat 🐱' },
    ],
  },
  {
    id: 'age',
    question: 'Quel âge a ton animal ?',
    type: 'single',
    options: [
      { value: 'chiot', label: 'Chiot / Chaton (- de 1 an)' },
      { value: 'adulte', label: 'Adulte (1–7 ans)' },
      { value: 'senior', label: 'Senior (+ de 7 ans)' },
    ],
  },
  {
    id: 'probleme',
    question: 'Tu as des préoccupations particulières ?',
    type: 'multi',
    options: [
      { value: 'digestion', label: 'Problèmes digestifs' },
      { value: 'allergie', label: 'Allergies / peau sensible' },
      { value: 'poids', label: 'Surpoids ou sous-poids' },
      { value: 'poil', label: 'Poil terne ou chute excessive' },
      { value: 'aucun', label: 'Rien de particulier' },
    ],
  },
  {
    id: 'budget',
    question: 'Quel est ton budget mensuel pour son alimentation ?',
    type: 'single',
    options: [
      { value: 'petit', label: '< 30€/mois' },
      { value: 'moyen', label: '30–60€/mois' },
      { value: 'grand', label: '60–100€/mois' },
      { value: 'premium', label: '+ de 100€/mois' },
    ],
  },
  {
    id: 'format',
    question: "Tu préfères quel type d'alimentation ?",
    type: 'single',
    options: [
      { value: 'croquettes', label: 'Croquettes (pratique)' },
      { value: 'frais', label: 'Repas frais (optimal)' },
      { value: 'mixte', label: 'Les deux (équilibre)' },
      { value: 'aucune', label: 'Je ne sais pas encore' },
    ],
  },
]
