// @cdc scanner — une marque, une seule écriture : les sources (Maxi Zoo, Open Pet Food Facts, photos lues par l'IA)
// écrivent « Edgard cooper » ou « EUKANUBA ». Comparaison sur les seules lettres et chiffres. Fonctions pures.

export const cleMarque = (marque: string): string =>
  marque
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const ECRITURES: Record<string, string> = {
  edgardcooper: 'Edgard & Cooper',
  eukanuba: 'Eukanuba',
  hills: 'Hills',
  lesfilous: 'Les Filous',
  pedigree: 'Pedigree',
  realnature: 'Real Nature',
  royalcanin: 'Royal Canin',
  trixie: 'Trixie',
  vitacraft: 'Vitakraft',
  vitakraft: 'Vitakraft',
  vitapet: 'Vitapet',
}

export function marqueCanonique<T extends string | null | undefined>(marque: T): T | string {
  return marque ? (ECRITURES[cleMarque(marque)] ?? marque.trim()) : marque
}
