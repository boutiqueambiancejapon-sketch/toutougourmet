/**
 * Bilan « Est-ce que ton chien est bien nourri ? »
 *
 * 6 questions courtes — score normalisé sur 100 — verdict (4 bandes) +
 * recommandation routée selon le profil :
 *  - Signes santé/digestion → Elmut (qualité humaine, doux, cuisson basse temp)
 *  - Pas de signes mais alim industrielle/basique → Dog Chef (sur-mesure, ajustement auto)
 *  - Tout va bien → comparateur (pas de push commercial)
 *
 * Pour les articles "Urgences & Intoxications" et "Santé", le sticky CTA
 * pointe vers cet outil — c'est le pivot non-commercial qui capte le trafic
 * anxieux et le requalifie.
 */

import { CONFIRMED_DISCOUNTS } from '@/data/partner-discounts'

export type AnswerKey = string

export interface BilanOption {
  value: AnswerKey
  label: string
  /** Points contribués au score brut (peut être négatif). Cf. SCORE_RANGE pour la normalisation. */
  score: number
  /** Tag profil — sert pour la logique de recommandation. */
  tags?: ProfileTag[]
}

export type ProfileTag =
  | 'signes-sante'      // pelage, peau, démangeaisons, mauvaise haleine
  | 'digestif'          // gaz, selles molles, vomissements
  | 'sous-poids'
  | 'surpoids'
  | 'alim-basique'      // croquettes supermarché, restes
  | 'alim-premium'      // croquettes premium / véto
  | 'alim-frais'        // déjà repas frais ou BARF
  | 'sans-souci'        // tout va bien

export type QuestionType = 'single' | 'multi'

export interface BilanQuestion {
  id: string
  type: QuestionType
  prompt: string
  helpText?: string
  options: BilanOption[]
}

// ────────────────────────────────────────────────────────────
// 6 QUESTIONS
// ────────────────────────────────────────────────────────────

export const BILAN_QUESTIONS: BilanQuestion[] = [
  {
    id: 'alim_actuelle',
    type: 'single',
    prompt: "Quelle est l'alimentation principale de ton chien aujourd'hui\u00a0?",
    helpText: "Choisis ce qui représente au moins 80 % de sa ration habituelle.",
    options: [
      { value: 'supermarche',   label: 'Croquettes du supermarché ou bas de gamme',     score: -20, tags: ['alim-basique'] },
      { value: 'premium',       label: 'Croquettes premium (animalerie spécialisée, zooplus, abonnement)', score: 5,  tags: ['alim-premium'] },
      { value: 'veto',          label: 'Croquettes vétérinaires (Royal Canin, Hill\'s véto, Virbac…)', score: 10, tags: ['alim-premium'] },
      { value: 'frais',         label: 'Repas frais livrés (Dog Chef, Elmut, Pepette…)', score: 15, tags: ['alim-frais'] },
      { value: 'barf',          label: 'BARF ou ration ménagère maison équilibrée',     score: 15, tags: ['alim-frais'] },
      { value: 'restes',        label: 'Mix de restes de table / pas vraiment dosé',     score: -25, tags: ['alim-basique'] },
    ],
  },
  {
    id: 'etat_corporel',
    type: 'single',
    prompt: 'Quel est son état corporel actuel\u00a0?',
    helpText: 'Si tu n\'es pas sûr, regarde sur le côté : on doit deviner la taille marquée et palper les côtes sans appuyer.',
    options: [
      { value: 'maigre',     label: 'Maigre : on voit les côtes et la colonne',     score: -15, tags: ['sous-poids'] },
      { value: 'ideal',      label: 'Idéal : côtes palpables sans être visibles',    score: 15 },
      { value: 'surpoids',   label: 'Léger surpoids : côtes difficiles à sentir',    score: -10, tags: ['surpoids'] },
      { value: 'obese',      label: 'Obèse : pas de taille marquée, ventre bas',     score: -20, tags: ['surpoids'] },
      { value: 'inconnu',    label: 'Je ne sais pas vraiment',                       score: -3 },
    ],
  },
  {
    id: 'signes_physiques',
    type: 'multi',
    prompt: 'Quels signes physiques observes-tu sur ton chien en ce moment\u00a0?',
    helpText: 'Coche tout ce qui s\'applique, ou « Aucun » si tout va bien.',
    options: [
      { value: 'pelage_terne',   label: 'Pelage terne, perte de poils excessive', score: -5, tags: ['signes-sante'] },
      { value: 'demangeaisons',  label: 'Démangeaisons, il se gratte beaucoup',    score: -5, tags: ['signes-sante'] },
      { value: 'mauvaise_haleine', label: 'Mauvaise haleine persistante',          score: -3, tags: ['signes-sante'] },
      { value: 'yeux_oreilles',  label: 'Yeux qui coulent ou oreilles qui sentent', score: -3, tags: ['signes-sante'] },
      { value: 'aucun',          label: 'Aucun, il pète la forme',                  score: 12, tags: ['sans-souci'] },
    ],
  },
  {
    id: 'digestion',
    type: 'multi',
    prompt: 'Et côté digestion\u00a0?',
    options: [
      { value: 'selles_molles',  label: 'Selles molles ou diarrhée régulière',     score: -10, tags: ['digestif'] },
      { value: 'gaz',            label: 'Gaz, flatulences fréquentes',              score: -5,  tags: ['digestif'] },
      { value: 'vomissements',   label: "Vomissements fréquents (plus d'une fois par semaine)",    score: -10, tags: ['digestif'] },
      { value: 'transit_ok',     label: 'Transit normal, selles bien formées',     score: 10,  tags: ['sans-souci'] },
    ],
  },
  {
    id: 'ration',
    type: 'single',
    prompt: 'Comment tu calcules sa ration quotidienne\u00a0?',
    options: [
      { value: 'balance',     label: 'Je pèse à la balance selon le tableau du sac', score: 12 },
      { value: 'verre',       label: 'J\'estime au verre doseur / à l\'œil',          score: -5 },
      { value: 'volonte',     label: 'À volonté, la gamelle reste pleine',           score: -12 },
      { value: 'pas_sur',     label: 'Je ne sais pas trop, je donne à peu près',     score: -8 },
    ],
  },
  {
    id: 'frequence',
    type: 'single',
    prompt: 'Combien de repas par jour\u00a0?',
    options: [
      { value: 'un',     label: '1 repas par jour',         score: -5 },
      { value: 'deux',   label: '2 repas par jour',         score: 10 },
      { value: 'trois',  label: '3 repas ou plus',          score: 8 },
      { value: 'libre',  label: 'À volonté / libre service', score: -10 },
    ],
  },
]

// ────────────────────────────────────────────────────────────
// Scoring & verdict
// ────────────────────────────────────────────────────────────

/** Bornes théoriques du score brut (somme min/max sur toutes les questions). */
const SCORE_RANGE = { min: -90, max: 70 }

export interface BilanAnswers {
  [questionId: string]: AnswerKey | AnswerKey[]
}

export interface BilanScores {
  raw: number
  normalized: number // 0-100
  tags: Set<ProfileTag>
}

export function computeBilan(answers: BilanAnswers): BilanScores {
  let raw = 0
  const tags = new Set<ProfileTag>()

  for (const q of BILAN_QUESTIONS) {
    const a = answers[q.id]
    if (!a) continue

    const selected = Array.isArray(a) ? a : [a]
    for (const value of selected) {
      const opt = q.options.find((o) => o.value === value)
      if (!opt) continue
      raw += opt.score
      opt.tags?.forEach((t) => tags.add(t))
    }
  }

  const normalized = Math.max(
    0,
    Math.min(
      100,
      Math.round(((raw - SCORE_RANGE.min) / (SCORE_RANGE.max - SCORE_RANGE.min)) * 100),
    ),
  )

  return { raw, normalized, tags }
}

// ────────────────────────────────────────────────────────────
// Verdict
// ────────────────────────────────────────────────────────────

export interface Verdict {
  band: 'excellent' | 'bon' | 'a-ameliorer' | 'risque'
  label: string
  summary: string
}

export function getVerdict(normalized: number): Verdict {
  if (normalized >= 80) {
    return {
      band: 'excellent',
      label: 'Très bien nourri',
      summary: 'Son alimentation est de bonne qualité, dosée et donnée à heures fixes. Garde ce rythme et repèse-le de temps en temps.',
    }
  }
  if (normalized >= 60) {
    return {
      band: 'bon',
      label: 'Bien nourri, avec des points à régler',
      summary: 'La base est bonne. Les conseils ci-dessous portent sur les réponses qui ont fait baisser le score.',
    }
  }
  if (normalized >= 40) {
    return {
      band: 'a-ameliorer',
      label: 'À améliorer',
      summary: 'Plusieurs réponses signalent un dosage approximatif, une alimentation de base ou des signes physiques à surveiller.',
    }
  }
  return {
    band: 'risque',
    label: 'À revoir',
    summary: "Plusieurs facteurs de risque se cumulent. Change son alimentation progressivement, sur 7 à 10 jours, et parles-en à ton vétérinaire s'il a des signes digestifs ou de peau.",
  }
}

// ────────────────────────────────────────────────────────────
// Recommandation marque selon profil
// ────────────────────────────────────────────────────────────

export type BrandReco = 'elmut' | 'dogchef' | 'comparateur'

export interface RecommendationOutput {
  primary: BrandReco
  rationale: string
  url: string
  /** Offre en cours, affichée sous le lien partenaire */
  offer?: string
  buttonLabel: string
}

export function recommend(scores: BilanScores): RecommendationOutput {
  const { tags, normalized } = scores

  // 1. Signes de peau ou problèmes digestifs : Elmut (repas frais cuits à basse température)
  if (tags.has('signes-sante') || tags.has('digestif')) {
    return {
      primary: 'elmut',
      rationale:
        "Tu as coché des signes de peau ou de digestion. Elmut cuisine en France des repas frais à basse température, sans conservateurs : une piste à essayer après avoir écarté une cause médicale avec ton vétérinaire.",
      url: 'https://c3po.link/QWMW4k6mbU',
      offer: CONFIRMED_DISCOUNTS.elmut ?? undefined,
      buttonLabel: 'Essayer Elmut',
    }
  }

  // 2. Tout va bien : comparateur, pas de marque poussée
  if (normalized >= 80) {
    return {
      primary: 'comparateur',
      rationale: "Ton chien est déjà bien nourri : aucune raison de changer de marque. Le comparateur reste là si tu veux voir d'autres options.",
      url: '/comparateur',
      buttonLabel: 'Voir le comparateur',
    }
  }

  // 3. Sous-poids ou surpoids sans signes santé : Dog Chef (portions dosées selon l'objectif de poids)
  if (tags.has('sous-poids') || tags.has('surpoids')) {
    return {
      primary: 'dogchef',
      rationale: "Son poids est à corriger. Dog Chef calcule les portions selon le poids visé (perte, prise ou maintien) et livre les repas déjà dosés.",
      url: 'https://www.dogchef.com/fr/code/WZU7090',
      offer: CONFIRMED_DISCOUNTS['dog-chef'] ?? undefined,
      buttonLabel: 'Essayer Dog Chef',
    }
  }

  // 4. Alimentation de base : Dog Chef
  if (tags.has('alim-basique')) {
    return {
      primary: 'dogchef',
      rationale: "Son alimentation actuelle est la réponse qui pèse le plus sur le score. Dog Chef livre des repas frais dosés pour son profil, sans calcul à faire de ton côté.",
      url: 'https://www.dogchef.com/fr/code/WZU7090',
      offer: CONFIRMED_DISCOUNTS['dog-chef'] ?? undefined,
      buttonLabel: 'Essayer Dog Chef',
    }
  }

  // 5. Déjà premium ou frais : comparateur
  return {
    primary: 'comparateur',
    rationale: "Son alimentation est déjà solide. Le comparateur te montre d'autres marques si tu veux comparer.",
    url: '/comparateur',
    buttonLabel: 'Voir le comparateur',
  }
}

// ────────────────────────────────────────────────────────────
// Tips actionnables — déclenchés selon les réponses
// ────────────────────────────────────────────────────────────

export interface Tip {
  trigger: (answers: BilanAnswers, scores: BilanScores) => boolean
  title: string
  detail: string
}

export const TIPS: Tip[] = [
  {
    trigger: (a) => a.ration === 'verre' || a.ration === 'pas_sur',
    title: "Pèse la ration au lieu de l'estimer",
    detail: "Un verre doseur donne une quantité différente selon la taille des croquettes et la façon de le remplir. Une balance de cuisine règle le problème. Le calculateur de ration te donne le chiffre à peser.",
  },
  {
    trigger: (a) => a.ration === 'volonte' || a.frequence === 'libre',
    title: 'Arrête le libre-service',
    detail: 'Une gamelle toujours pleine pousse beaucoup de chiens à manger plus que leur besoin. Deux repas à heures fixes, gamelle retirée après 15 minutes.',
  },
  {
    trigger: (_a, s) => s.tags.has('digestif'),
    title: 'Regarde la source de protéines',
    detail: "Selles molles, gaz ou vomissements répétés : parles-en à ton vétérinaire. Une fois une cause médicale écartée, essayer un aliment à une seule protéine animale (poulet, canard ou agneau) aide à repérer une intolérance.",
  },
  {
    trigger: (_a, s) => s.tags.has('signes-sante'),
    title: 'Pense aux oméga-3',
    detail: "Un pelage terne ou des démangeaisons peuvent s'améliorer avec un apport en oméga-3 (huile de poisson riche en EPA et DHA). Demande la dose adaptée à son poids à ton vétérinaire.",
  },
  {
    trigger: (a) => a.alim_actuelle === 'supermarche' || a.alim_actuelle === 'restes',
    title: "Lis l'étiquette de ses croquettes",
    detail: 'Les ingrédients sont classés par ordre décroissant. Si des céréales ou des « sous-produits animaux » arrivent en tête, cherche une croquette avec une viande nommée en premier.',
  },
  {
    trigger: (a) => a.frequence === 'un',
    title: 'Passe à deux repas par jour',
    detail: "Un seul gros repas augmente le risque de torsion de l'estomac chez les grands chiens, et d'hypoglycémie chez les très petits. Divise la ration en deux.",
  },
]

export function getActiveTips(answers: BilanAnswers, scores: BilanScores): Tip[] {
  return TIPS.filter((t) => t.trigger(answers, scores)).slice(0, 4)
}
