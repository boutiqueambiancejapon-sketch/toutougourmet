import { BAND_LABELS, type Band, type Criterion, type CriterionId, type ScoreResult } from './score'

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
  'friandise-premier-ingredient': () => 'Viande nommée en premier',
  'friandise-part-animale': () => 'Riche en viande',
  'friandise-sucres': () => 'Sans sucre ajouté',
  'friandise-additifs': () => 'Sans colorant ni arôme artificiel',
  'friandise-sel': () => 'Sans sel ajouté',
  'friandise-liste': () => 'Recette courte',
  'friandise-glycerine': () => 'Sans glycérine',
  'friandise-cereales': () => 'Pas de farine en tête',
  'friandise-transparence': () => 'Étiquette complète',
  cendres: () => 'Cendres modérées',
  transparence: () => 'Étiquette complète',
  'friandise-ration': () => 'Léger dans la ration',
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
  'friandise-premier-ingredient': (c) => (c.points ? 'Espèce non précisée en tête' : 'Pas de viande en premier'),
  'friandise-part-animale': (c) => (c.points ? 'Peu de viande déclarée' : 'Part de viande non déclarée'),
  'friandise-sucres': () => 'Sucre ajouté',
  'friandise-additifs': () => 'Colorant ou additif sans nom',
  'friandise-sel': () => 'Sel ajouté',
  'friandise-liste': () => 'Liste d\'ingrédients longue',
  'friandise-glycerine': () => 'Glycérine ou animal non nommé',
  'friandise-cereales': () => 'Farine ou céréale en tête',
  'friandise-transparence': () => 'Étiquette incomplète',
  cendres: () => 'Beaucoup de cendres',
  transparence: () => 'Étiquette incomplète',
  'friandise-ration': () => 'Lourd dans la ration',
}

const ratio = (c: Criterion) => (c.points ?? 0) / c.max

export function highlights(d: ScoreResult, count = 2): { strengths: string[]; weaknesses: string[] } {
  const evaluated = d.criteria.filter((c) => c.points !== null)
  const strengths = evaluated
    .filter((c) => ratio(c) >= 0.75)
    .sort((a, b) => b.max - a.max)
    .slice(0, count)
    .map((c) => STRONG[c.id](c, d))
  // Friandise : un ingrédient dangereux passe avant tout point faible.
  const alerts = (d.treat?.alerts ?? []).map((a) => `${a.label} dans la recette`)
  const weaknesses = [
    ...alerts,
    ...evaluated
      .filter((c) => ratio(c) < 0.5 && !c.undeclared)
      .sort((a, b) => b.max - (b.points ?? 0) - (a.max - (a.points ?? 0)))
      .map((c) => WEAK[c.id](c, d)),
  ].slice(0, count)
  return { strengths, weaknesses }
}

const lowerList = (items: string[]) => items.map((s) => s.charAt(0).toLowerCase() + s.slice(1)).join(', ')

/** Verdict en une phrase : tranche de la note, puis points forts et faibles (fiche web et PDF). */
export function verdictText(d: ScoreResult): string {
  const { strengths, weaknesses } = highlights(d)
  const parts: string[] = []
  if (d.score !== null && d.band)
    parts.push(d.kind === 'treat' ? `${d.score}/100 : ${BAND_LABELS[d.band].toLowerCase()} pour une friandise.` : `${d.score}/100 : ${BAND_LABELS[d.band].toLowerCase()} pour un chien adulte.`)
  else if (d.notice) parts.push(d.notice)
  if (strengths.length) parts.push(`Points forts : ${lowerList(strengths)}.`)
  if (weaknesses.length) parts.push(`Points faibles : ${lowerList(weaknesses)}.`)
  return parts.join(' ')
}
