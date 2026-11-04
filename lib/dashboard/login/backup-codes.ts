import { randomInt } from 'node:crypto'

// @cdc tableau de bord — codes de secours : 10 codes de 10 caractères tirés au hasard (près de
// 50 bits), dans un alphabet sans 0, O, 1, I ni L, pour se relire sur un papier.

const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'
const LENGTH = 10
export const BACKUP_CODE_COUNT = 10

export function newBackupCode(): string {
  let code = ''
  for (let i = 0; i < LENGTH; i++) code += ALPHABET[randomInt(ALPHABET.length)]
  return `${code.slice(0, 5)}-${code.slice(5)}`
}

export function newBackupCodes(): string[] {
  const codes = new Set<string>()
  while (codes.size < BACKUP_CODE_COUNT) codes.add(newBackupCode())
  return [...codes]
}

/** Saisie tolérante : minuscules, espaces et tirets acceptés. */
export function normalizeBackupCode(value: string): string | null {
  const clean = value.toUpperCase().replace(/[\s-]/g, '')
  if (clean.length !== LENGTH || [...clean].some((c) => !ALPHABET.includes(c))) return null
  return `${clean.slice(0, 5)}-${clean.slice(5)}`
}
