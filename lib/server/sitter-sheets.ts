import { randomBytes } from 'node:crypto'
import { and, desc, eq, gt } from 'drizzle-orm'
import { sitterSheet, type SitterSheet } from '@/db/schema'
import { expiryOf, type SheetData } from '@/lib/garde/sheet'
import { getDb } from './drizzle'

// @cdc fiche de garde — accès aux fiches. Côté compte, chaque requête filtre sur user_id. Côté
// gardien, seul le jeton compte, et seulement avant expires_at : une fiche expirée ou supprimée
// renvoie null (404).

/** 18 octets aléatoires = 144 bits, 24 caractères base64url. */
export function newToken(): string {
  return randomBytes(18).toString('base64url')
}

const TOKEN = /^[A-Za-z0-9_-]{22,64}$/

function db() {
  const d = getDb()
  if (!d) throw new Error('DATABASE_URL manquant')
  return d
}

export async function createSheet(userId: string, dogId: string, data: SheetData): Promise<SitterSheet> {
  const [row] = await db()
    .insert(sitterSheet)
    .values({ userId, dogId, token: newToken(), startsOn: data.startsOn, endsOn: data.endsOn, data, expiresAt: expiryOf(data.endsOn) })
    .returning()
  return row
}

export async function listSheets(userId: string, dogId: string): Promise<SitterSheet[]> {
  return db()
    .select()
    .from(sitterSheet)
    .where(and(eq(sitterSheet.userId, userId), eq(sitterSheet.dogId, dogId)))
    .orderBy(desc(sitterSheet.createdAt))
}

export async function getOwnSheet(userId: string, sheetId: string): Promise<SitterSheet | null> {
  if (!/^[0-9a-f-]{36}$/i.test(sheetId)) return null
  const rows = await db()
    .select()
    .from(sitterSheet)
    .where(and(eq(sitterSheet.id, sheetId), eq(sitterSheet.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

/** Dernière fiche du chien : reprend croquettes, allergies, vétérinaire et téléphone. */
export async function latestSheet(userId: string, dogId: string): Promise<SitterSheet | null> {
  const [row] = await listSheets(userId, dogId)
  return row ?? null
}

export async function deleteSheet(userId: string, sheetId: string): Promise<void> {
  if (!/^[0-9a-f-]{36}$/i.test(sheetId)) return
  await db()
    .delete(sitterSheet)
    .where(and(eq(sitterSheet.id, sheetId), eq(sitterSheet.userId, userId)))
}

/** Page du gardien : fiche encore valable pour ce jeton, sinon null. */
export async function sheetByToken(token: string): Promise<SitterSheet | null> {
  const d = getDb()
  if (!d || !TOKEN.test(token)) return null
  const rows = await d
    .select()
    .from(sitterSheet)
    .where(and(eq(sitterSheet.token, token), gt(sitterSheet.expiresAt, new Date())))
    .limit(1)
  return rows[0] ?? null
}
