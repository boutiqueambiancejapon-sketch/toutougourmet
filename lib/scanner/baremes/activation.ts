import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { ExtractedLabel } from '../types'

// @cdc scanner — corrections écrites en base le jour de l'activation (scripts/activer-baremes.ts). Fonctions
// pures, testées par scripts/test-baremes.ts. Une valeur déjà remplie n'est jamais écrasée par un complément.

export interface Complement {
  slug: string
  champ: keyof ExtractedLabel['constituants']
  valeur: number
  source: string
  date: string
  note?: string
}

/** Ces 3 fiches portent la cellulose à la place des cendres. La correction n'a lieu que si la valeur fausse est encore là. */
export const CENDRES_FAUSSES: { slug: string; faux: number; vrai: number; source: string }[] = [
  { slug: 'royal-canin-cocker-chiot-croquettes-chien-3-kg', faux: 1.8, vrai: 7.2, source: 'https://www.lacompagniedesanimaux.com/royal-canin-cocker-puppy-3-kg.html' },
  { slug: 'royal-canin-berger-allemand-chiot-croquettes-chien-3-kg', faux: 2.7, vrai: 6.6, source: 'https://www.lacompagniedesanimaux.com/royal-canin-berger-allemand-junior-12-kg.html' },
  { slug: 'royal-canin-berger-allemand-chiot-croquettes-chien-12-kg', faux: 2.7, vrai: 6.6, source: 'https://www.lacompagniedesanimaux.com/royal-canin-berger-allemand-junior-12-kg.html' },
]

/** Enregistrée comme aliment complet, c'est une friandise. */
export const TYPE_FAUX = [{ slug: 'flamingo-chicken-fillets-long', typeImage: 'friandise', typeProduit: 'friandise' }] as const

export type ExtractedBrut = Record<string, unknown> & { constituants: Record<string, number | null> }

export interface Corrections {
  complements?: Complement[]
  cendres?: { faux: number; vrai: number }
  type?: { typeImage: string; typeProduit: string }
  rapportCaP?: { min: number; max: number }
}

/** Fiche corrigée, et ce qui a vraiment changé. Le reste de la lecture reste tel quel. */
export function corrigerFiche(extracted: ExtractedBrut, c: Corrections): { extracted: ExtractedBrut; ajoutes: string[]; ignores: string[]; cendres: boolean; type: boolean; rapport: boolean } {
  const constituants = { ...extracted.constituants }
  const ajoutes: string[] = []
  const ignores: string[] = []
  for (const x of c.complements ?? []) {
    if (constituants[x.champ] === null || constituants[x.champ] === undefined) {
      constituants[x.champ] = x.valeur
      ajoutes.push(x.champ)
    } else ignores.push(x.champ)
  }
  const cendres = Boolean(c.cendres && constituants.cendres === c.cendres.faux)
  if (cendres && c.cendres) constituants.cendres = c.cendres.vrai
  const type = Boolean(c.type && extracted.typeProduit !== c.type.typeProduit)
  const rapport = Boolean(c.rapportCaP && !extracted.rapportCaP)
  return {
    extracted: { ...extracted, constituants, ...(type && c.type ? c.type : {}), ...(rapport ? { rapportCaP: c.rapportCaP } : {}) },
    ajoutes,
    ignores,
    cendres,
    type,
    rapport,
  }
}

export const SAUVEGARDE_MAX_HEURES = 36

/** Message de refus si aucune sauvegarde `.dump` non vide de moins de 36 heures n'est lisible dans ce dossier, sinon null. */
export function refusSauvegarde(dossier: string, maintenant = Date.now()): string | null {
  let fichiers: string[]
  try {
    fichiers = readdirSync(dossier).filter((f) => f.endsWith('.dump'))
  } catch {
    return `Dossier de sauvegardes illisible : ${dossier}`
  }
  const recentes = fichiers.map((f) => statSync(join(dossier, f))).filter((s) => s.size > 0 && maintenant - s.mtimeMs < SAUVEGARDE_MAX_HEURES * 3_600_000)
  return recentes.length ? null : `Aucune sauvegarde de moins de ${SAUVEGARDE_MAX_HEURES} heures dans ${dossier}`
}
