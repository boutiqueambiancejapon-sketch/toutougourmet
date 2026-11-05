// @cdc scanner — extracteur unique des teneurs en EPA et DHA, partagé par compléments et huiles.

export interface TeneurEpaDha {
  /** EPA + DHA en % du produit */
  epaDhaPct: number | null
  /** Vrai si EPA et DHA sont donnés chacun */
  separe: boolean
  /** Un seul des deux est chiffré */
  partiel: boolean
  /** mg d'EPA + DHA par comprimé, capsule ou pièce : traité à part, jamais converti en % */
  mgParPiece: number | null
  /** Oméga-3 total sans dire EPA ni DHA */
  omega3Pct: number | null
}

const DENSITE_HUILE = 0.92
const nombre = (s: string) => Number(s.replace(/\s/g, '').replace(',', '.'))
const UNITES = '%|g/100 ?g|g/kg|mg/100 ?ml|mg/100 ?g|mg/g|mg/ml'
/** Valeur en % du produit. */
function enPct(v: number, unite: string): number {
  const u = unite.replace(/ /g, '')
  if (u === '%' || u === 'g/100g') return v
  if (u === 'g/kg' || u === 'mg/g') return v / 10
  if (u === 'mg/100g') return v / 1000
  if (u === 'mg/100ml') return v / (1000 * DENSITE_HUILE)
  return v / (10 * DENSITE_HUILE)
}

export function extraireEpaDha(texte: string): TeneurEpaDha {
  // Pas de normalize ici : il faut garder chiffres, virgules, % et « / ». Espaces de milliers : « 1 200 » devient « 1200 ».
  const t = texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‐-―]/g, '-').replace(/[’']/g, ' ').replace(/[  ]/g, ' ').replace(/\s*\/\s*/g, '/').replace(/(\d) (\d{3})(?!\d)/g, '$1$2')
  const res: TeneurEpaDha = { epaDhaPct: null, separe: false, partiel: false, mgParPiece: null, omega3Pct: null }
  const NB = '(\\d+(?:[.,]\\d+)?)'
  const U = `(${UNITES})`
  // Entre le sigle et le chiffre : une précision entre parenthèses, un deux-points. Jamais une virgule : « EPA et DHA, 100 % naturel » ne dit rien.
  const GAP = '(?: ?\\([^)]{0,20}\\))?(?: total| totaux)?[ :=]{0,4}'
  const DEUX = '\\bepa(?: ?\\([^)]{0,20}\\))? ?(?:\\+|et|/|&|,) ?(?:de |du )?dha\\b'
  const AVANT = ' ?(?:d |de |du )?(?:acides gras )?(?:omega.?3 )?\\(?'
  const FORME = '(?:comprime|capsule|gelule|piece|dose)'
  const valide = (v: number) => (v >= 0 && v <= 100 ? v : null)

  const piece = new RegExp(`${NB} ?mg[^.;]{0,30}\\b(?:epa|dha)\\b[^.;]{0,30}(?:par |/) ?${FORME}`).exec(t) ?? new RegExp(`\\b(?:epa|dha)\\b[^.;0-9]{0,30}${NB} ?mg ?(?:par |/) ?${FORME}`).exec(t)
  if (piece) res.mgParPiece = nombre(piece[1])

  const somme = new RegExp(`${DEUX}${GAP}${NB} ?${U}`).exec(t) ?? new RegExp(`${NB} ?${U}${AVANT}${DEUX}`).exec(t)
  if (somme) {
    res.epaDhaPct = valide(enPct(nombre(somme[1]), somme[2]))
  } else {
    const seul = (mot: string) => new RegExp(`\\b(?:${mot})\\b${GAP}${NB} ?${U}`).exec(t) ?? new RegExp(`${NB} ?${U}${AVANT}(?:${mot})\\b`).exec(t)
    const e = seul('epa|acide eicosapentaenoique')
    const d = seul('dha|acide docosahexaenoique')
    if (e && d) {
      res.epaDhaPct = valide(enPct(nombre(e[1]), e[2]) + enPct(nombre(d[1]), d[2]))
      res.separe = res.epaDhaPct !== null
    } else if (e || d) {
      const x = (e ?? d) as RegExpExecArray
      res.epaDhaPct = valide(enPct(nombre(x[1]), x[2]))
      res.partiel = res.epaDhaPct !== null
    }
  }
  const o3 = new RegExp(`${NB} ?% ?(?:d |de )?(?:acides gras )?omega.?3`).exec(t) ?? new RegExp(`omega.?3${GAP}${NB} ?%`).exec(t)
  if (o3 && res.epaDhaPct === null) res.omega3Pct = valide(nombre(o3[1]))
  return res
}
