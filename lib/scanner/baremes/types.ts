// @cdc scanner — types et aides communs aux quatre barèmes (aliment, friandise, complément, huile).
// Fonctions pures, aucun appel réseau. Chaque critère porte sa source, ou « choix éditorial ».
// Désactivés par défaut : voir ./config.ts.

export type TypeProduit = 'aliment' | 'friandise' | 'complement' | 'huile' | 'autre' | 'indetermine'
export type Stade = 'chiot' | 'adulte' | 'senior' | 'tous'
export type Fiabilite = 'haute' | 'moyenne' | 'faible'

export interface Entree {
  marque: string | null
  produit: string | null
  categorie?: string | null
  typeAliment?: 'sec' | 'humide' | 'autre' | 'inconnu' | null
  ingredients: { nom: string; pourcentage: number | null }[]
  additifs: string[]
  constituants: { proteines: number | null; matieresGrasses: number | null; cendres: number | null; cellulose: number | null; humidite: number | null; calcium: number | null; phosphore: number | null }
  partAnimaleDeclaree?: number | null
  energie?: { kcalKg?: number | null; kcal100g?: number | null; kcalPiece?: number | null; poidsPieceG?: number | null } | null
  /** Promesse, origine, conservation, recopiées par l'IA : 500 caractères au plus, jamais de menu de site */
  mentions?: string | null
  /** Tableau d'analyse recopié tel quel par l'IA. Le calcul se fait côté code */
  tableauBrut?: string | null
  /** Une ration écrite sur l'étiquette */
  rationLue?: boolean
  /** Quantité conseillée pour un chien de 10 kg, en grammes par jour, si l'IA peut la lire */
  ration10kgG?: number | null
  emballage?: 'opaque' | 'transparent' | null
  /** Champ IA : aliment vétérinaire ou présenté pour une maladie */
  alimentVeterinaire?: boolean
  /** Rapport calcium/phosphore déclaré par la marque, sans les deux valeurs. Jamais utilisé pour les alertes chiot */
  rapportCaP?: { min: number; max: number } | null
  /** Champ IA : stade annoncé, sinon déduit du nom */
  stade?: Stade | null
  /** Champ IA : gabarit annoncé, sinon déduit du nom */
  gabarit?: 'petit' | 'moyen' | 'grand' | null
}

export interface Critere { id: string; libelle: string; max: number; points: number | null; explication: string; source: string }

export interface Resultat {
  type: TypeProduit
  note: number | null
  fiabilite: Fiabilite
  criteres: Critere[]
  plafond: { valeur: number; raison: string } | null
  alertes: string[]
  message: string | null
  /** Ne pas mettre dans un classement */
  horsClassement: boolean
}

export const S = {
  FEDIAF: 'FEDIAF, Nutritional Guidelines, oct. 2021, tableau III-3a',
  FEDIAF_MER: 'FEDIAF 2021 : besoin de 95 kcal/kg^0,75 pour un chien sédentaire ou de plus de 7 ans',
  NRC: 'NRC 2006 : pas de besoin minimal en glucides chez l\'adulte (via docs/v2/scanner-score.md)',
  REG: 'Règlement (CE) 767/2009',
  BAUER: 'Bauer 2011, JAVMA 239(11), tableau 1 (valeurs NRC)',
  VCA: 'VCA / LifeLearn : 10 % des calories au plus',
  EDITO: 'choix éditorial, aucun texte ne fixe ce seuil',
}

/** Décision du propriétaire (2026-11-05) : compléments et huiles, une note et ce message, rien d'autre. */
export const MSG_CONSEIL = "Attention, ce n'est pas un conseil de vétérinaire"
/** Devant du paquet seul : pas de note, on demande le dos. */
export const MSG_DOS = 'Prends une photo du dos du paquet, là où est écrite la composition.'
export const MSG_VETERINAIRE = 'Aliment vétérinaire ou lié à une maladie : pas de note, à juger avec ton vétérinaire.'

export const round1 = (n: number) => Math.round(n * 10) / 10
export const fmt = (n: number) => String(round1(n)).replace('.', ',')

export function pasCompte(id: string, libelle: string, max: number, explication: string, source: string): Critere {
  return { id, libelle, max, points: null, explication, source }
}

export function vide(type: TypeProduit, message: string, alertes: string[] = []): Resultat {
  return { type, note: null, fiabilite: 'faible', criteres: [], plafond: null, alertes, message, horsClassement: true }
}

export function total(type: TypeProduit, criteres: Critere[], extra: Partial<Resultat> & { fiabilite: Fiabilite }, minEvalue = 60): Resultat {
  const evalues = criteres.filter((c) => c.points !== null)
  const base = evalues.reduce((s, c) => s + c.max, 0)
  const res: Resultat = { type, note: null, criteres, plafond: null, alertes: [], message: null, horsClassement: false, ...extra }
  if (base < minEvalue) return { ...res, note: null, horsClassement: true, message: res.message ?? 'Trop d\'informations manquent pour donner une note fiable.' }
  let note = Math.round((evalues.reduce((s, c) => s + (c.points ?? 0), 0) / base) * 100)
  if (res.plafond && note > res.plafond.valeur) note = res.plafond.valeur
  return { ...res, note }
}

export class Plafond {
  v: Resultat['plafond'] = null
  baisser(valeur: number, raison: string) {
    if (!this.v || valeur < this.v.valeur) this.v = { valeur, raison }
  }
}
