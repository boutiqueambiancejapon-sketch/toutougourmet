import type { Band, Criterion, CriterionId, ScoreResult } from './score'

// @cdc lot 6 — deux points forts et deux points faibles tirés des critères de la note, en
// libellés courts (fiche de partage 1080×1920, aperçu de la fiche). Fonction pure.

export const BAND_SHORT: Record<Band, string> = {
  'tres-bon': 'Très bon',
  correct: 'Correct',
  moyen: 'Moyen',
  faible: 'Faible',
}

const pct = (n: number | null | undefined) => (n == null ? '' : `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} %`)

type Phrase = (c: Criterion, d: ScoreResult) => string

const STRONG: Record<CriterionId, Phrase> = {
  proteines: (_, d) => `${pct(d.dryMatter?.proteines)} de protéines sur sec`,
  'matieres-grasses': (_, d) => `${pct(d.dryMatter?.matieresGrasses)} de matières grasses`,
  glucides: (_, d) => `Glucides limités (${pct(d.dryMatter?.glucides)})`,
  'premier-ingredient': () => 'Viande nommée en premier',
  'part-animale': () => 'Part de viande déclarée',
  'sous-produits': () => 'Espèces animales nommées',
  cereales: () => 'Pas de céréale en tête',
  sucres: () => 'Sans sucre ajouté',
  conservateurs: () => 'Ni BHA, ni BHT',
  colorants: () => 'Sans colorant',
  'calcium-phosphore': () => 'Calcium et phosphore équilibrés',
}

const WEAK: Record<CriterionId, Phrase> = {
  proteines: (_, d) => `Peu de protéines (${pct(d.dryMatter?.proteines)})`,
  'matieres-grasses': (_, d) => `Matières grasses à surveiller (${pct(d.dryMatter?.matieresGrasses)})`,
  glucides: (_, d) => `Beaucoup de glucides (${pct(d.dryMatter?.glucides)})`,
  'premier-ingredient': (c) => (c.points ? 'Espèce non précisée en tête' : 'Pas de viande en premier'),
  'part-animale': (c) => (c.points ? 'Peu de viande déclarée' : 'Part de viande non déclarée'),
  'sous-produits': () => 'Ingrédients animaux non nommés',
  cereales: () => 'Céréales en tête de liste',
  sucres: () => 'Sucre ajouté',
  conservateurs: (c) => (c.points ? 'Antioxygènes non nommés' : 'Conservateur controversé'),
  colorants: () => 'Colorant ajouté',
  'calcium-phosphore': () => 'Rapport Ca/P hors repères',
}

const ratio = (c: Criterion) => (c.points ?? 0) / c.max

export function highlights(d: ScoreResult, count = 2): { strengths: string[]; weaknesses: string[] } {
  const evaluated = d.criteria.filter((c) => c.points !== null)
  const strengths = evaluated
    .filter((c) => ratio(c) >= 0.75)
    .sort((a, b) => b.max - a.max)
    .slice(0, count)
    .map((c) => STRONG[c.id](c, d))
  const weaknesses = evaluated
    .filter((c) => ratio(c) < 0.5)
    .sort((a, b) => b.max - (b.points ?? 0) - (a.max - (a.points ?? 0)))
    .slice(0, count)
    .map((c) => WEAK[c.id](c, d))
  return { strengths, weaknesses }
}
