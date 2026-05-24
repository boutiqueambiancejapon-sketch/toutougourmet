/**
 * Bilan "Est-ce que ton chien est bien nourri ?"
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
    prompt: "Quelle est l'alimentation principale de ton chien aujourd'hui ?",
    helpText: "Choisis ce qui représente au moins 80 % de sa ration habituelle.",
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
    prompt: 'Quel est son état corporel actuel ?',
    helpText: 'Si tu n\'es pas sûr, regarde sur le côté : on doit deviner la taille marquée et palper les côtes sans appuyer.',
    options: [
      { value: 'maigre',     label: 'Maigre — on voit les côtes et la colonne',     score: -15, tags: ['sous-poids'] },
      { value: 'ideal',      label: 'Idéal — côtes palpables sans être visibles',    score: 15 },
      { value: 'surpoids',   label: 'Léger surpoids — côtes difficiles à sentir',    score: -10, tags: ['surpoids'] },
      { value: 'obese',      label: 'Obèse — pas de taille marquée, ventre bas',     score: -20, tags: ['surpoids'] },
      { value: 'inconnu',    label: 'Je ne sais pas vraiment',                       score: -3 },
    ],
  },
  {
    id: 'signes_physiques',
    type: 'multi',
    prompt: 'Quels signes physiques observes-tu sur ton chien en ce moment ?',
    helpText: 'Sélectionne tout ce qui s\'applique (ou "Aucun" si tout va bien).',
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
    prompt: 'Et côté digestion ?',
    options: [
      { value: 'selles_molles',  label: 'Selles molles ou diarrhée régulière',     score: -10, tags: ['digestif'] },
      { value: 'gaz',            label: 'Gaz, flatulences fréquentes',              score: -5,  tags: ['digestif'] },
      { value: 'vomissements',   label: 'Vomissements fréquents (>1×/semaine)',    score: -10, tags: ['digestif'] },
      { value: 'transit_ok',     label: 'Transit normal, selles bien formées',     score: 10,  tags: ['sans-souci'] },
    ],
  },
  {
    id: 'ration',
    type: 'single',
    prompt: 'Comment tu calcules sa ration quotidienne ?',
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
    prompt: 'Combien de repas par jour ?',
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
  emoji: string
  /** Couleur sémantique pour le bandeau de résultat (var CSS) */
  colorVar: string
  summary: string
}

export function getVerdict(normalized: number): Verdict {
  if (normalized >= 80) {
    return {
      band: 'excellent',
      label: 'Excellent — ton chien est très bien nourri',
      emoji: '🌟',
      colorVar: 'var(--pill-green)',
      summary:
        "Bravo, ton chien bénéficie d'une alimentation de qualité, bien dosée et adaptée. Continue comme ça — tu peux quand même explorer si tu veux affiner.",
    }
  }
  if (normalized >= 60) {
    return {
      band: 'bon',
      label: 'Bon — quelques ajustements possibles',
      emoji: '👍',
      colorVar: 'var(--pill-blue)',
      summary:
        "Ton chien est globalement bien nourri, mais quelques ajustements peuvent faire passer sa nutrition à un niveau supérieur (digestion, vitalité, longévité).",
    }
  }
  if (normalized >= 40) {
    return {
      band: 'a-ameliorer',
      label: 'À améliorer — des signaux à corriger',
      emoji: '⚠️',
      colorVar: 'var(--pill-amber)',
      summary:
        "Plusieurs points méritent ton attention. Une alimentation mieux adaptée peut transformer le quotidien de ton chien en quelques semaines.",
    }
  }
  return {
    band: 'risque',
    label: 'À revoir d\'urgence — risque pour la santé',
    emoji: '🚨',
    colorVar: 'var(--pill-rose)',
    summary:
      "L'alimentation actuelle présente plusieurs facteurs de risque. Un changement progressif vers une alimentation de qualité est fortement recommandé.",
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
  badge?: string
  buttonLabel: string
}

export function recommend(scores: BilanScores): RecommendationOutput {
  const { tags, normalized } = scores

  // 1. Si signes santé OU problèmes digestifs → Elmut (frais qualité humaine, cuisson douce)
  if (tags.has('signes-sante') || tags.has('digestif')) {
    return {
      primary: 'elmut',
      rationale:
        "On te recommande Elmut : leurs repas frais cuisinés en France (qualité humaine, sans conservateurs) ont prouvé leur efficacité sur les chiens à pelage terne, démangeaisons et digestion fragile. Cuisson douce qui préserve les nutriments.",
      url: 'https://c3po.link/QWMW4k6mbU',
      badge: '-40%',
      buttonLabel: 'Découvrir Elmut →',
    }
  }

  // 2. Si tout va bien (score excellent) → comparateur, pas de push marque
  if (normalized >= 80) {
    return {
      primary: 'comparateur',
      rationale:
        "Ton chien est déjà bien nourri — on n'a pas envie de te pousser une marque pour rien. Si tu veux explorer ou comparer d'autres options, le comparateur te donne une vue d'ensemble objective.",
      url: '/comparateur',
      buttonLabel: 'Voir le comparateur →',
    }
  }

  // 3. Sous-poids ou surpoids sans signes santé → Dog Chef (personnalisation + ajustement auto)
  if (tags.has('sous-poids') || tags.has('surpoids')) {
    return {
      primary: 'dogchef',
      rationale:
        "On te recommande Dog Chef : leur sur-mesure calcule la ration exacte selon le poids et l'objectif (perte, prise, maintien), et ajuste automatiquement chaque mois. Idéal pour corriger un déséquilibre durable.",
      url: 'https://www.dogchef.com/fr/code/WZU7090',
      badge: '-35%',
      buttonLabel: 'Calculer le menu →',
    }
  }

  // 4. Alim basique → Dog Chef (upgrade clé en main)
  if (tags.has('alim-basique')) {
    return {
      primary: 'dogchef',
      rationale:
        "L'alimentation actuelle de ton chien peut être largement améliorée. Dog Chef propose un menu sur-mesure (validé par 1 000+ vétérinaires) livré chez toi, sans complication. C'est l'upgrade le plus simple à faire.",
      url: 'https://www.dogchef.com/fr/code/WZU7090',
      badge: '-35%',
      buttonLabel: 'Calculer le menu →',
    }
  }

  // 5. Default — déjà bien (premium / frais) → comparateur pour explorer
  return {
    primary: 'comparateur',
    rationale:
      "Ton alimentation est déjà solide. Si tu veux explorer d'autres options ou comparer les marques, le comparateur te donne une vue d'ensemble.",
    url: '/comparateur',
    buttonLabel: 'Voir le comparateur →',
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
    title: 'Pèse la ration au lieu d\'estimer',
    detail:
      "Un verre doseur peut varier de ±30 % selon les croquettes. Une balance de cuisine à 10 € évite le surpoids silencieux. Utilise notre calculateur de ration.",
  },
  {
    trigger: (a) => a.ration === 'volonte' || a.frequence === 'libre',
    title: 'Stoppe le libre-service',
    detail:
      "Laisser la gamelle pleine est la 1ère cause de surpoids chez le chien adulte. 2 repas/jour fixes + retrait après 15 min = transit, satiété et poids stables.",
  },
  {
    trigger: (_a, s) => s.tags.has('digestif'),
    title: 'Vérifie la qualité des protéines',
    detail:
      "Selles molles, gaz, vomissements répétés signent souvent une intolérance à une protéine bas de gamme. Un mono-protéine (poulet, canard, agneau) ou un repas frais résout le problème dans 60 % des cas.",
  },
  {
    trigger: (_a, s) => s.tags.has('signes-sante'),
    title: 'Augmente les oméga-3',
    detail:
      "Pelage terne, démangeaisons et yeux qui coulent répondent souvent à un apport en oméga-3 (huile de saumon, sardines). 1 cuillère à café par 10 kg de poids/jour pendant 6 semaines.",
  },
  {
    trigger: (a) => a.alim_actuelle === 'supermarche' || a.alim_actuelle === 'restes',
    title: 'Lis l\'étiquette de ses croquettes',
    detail:
      "Les ingrédients sont listés par ordre décroissant. Si « céréales » ou « sous-produits animaux » sont en tête, la qualité est faible. Cherche une viande nommée en 1er ingrédient.",
  },
  {
    trigger: (a) => a.frequence === 'un',
    title: 'Passe à 2 repas/jour',
    detail:
      "Un seul repas augmente le risque de torsion d'estomac (surtout grands chiens) et favorise les hypoglycémies chez les petits gabarits. Fractionne en 2.",
  },
]

export function getActiveTips(answers: BilanAnswers, scores: BilanScores): Tip[] {
  return TIPS.filter((t) => t.trigger(answers, scores)).slice(0, 4)
}
