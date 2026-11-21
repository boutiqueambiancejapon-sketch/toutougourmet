import type { Pool } from 'pg'
import type { ChartNote, NoteKind } from '../chart-types'
import { publications } from './content'
import type { Range } from './range'

// @cdc tableau de bord SEO — notes posées sur toutes les courbes : à la main (Contenu & notes), par les tâches
// (seo_notes, source « auto ») et tirées des articles (3 publications ou plus le même jour, 5 mises à jour ou plus).
// Source « journal » : visible dans le journal seulement, trop fréquente pour une pastille.

export interface JournalItem extends ChartNote {
  source: 'manuel' | 'auto' | 'journal' | 'articles'
  id?: number
}

const PUB_MIN = 3
const UPD_MIN = 40

function fromArticles(r: Range): JournalItem[] {
  const pub = new Map<string, number>()
  const upd = new Map<string, number>()
  for (const p of publications()) {
    if (p.date >= r.start && p.date <= r.end) pub.set(p.date, (pub.get(p.date) ?? 0) + 1)
    if (p.updatedAt && p.updatedAt !== p.date && p.updatedAt >= r.start && p.updatedAt <= r.end) upd.set(p.updatedAt, (upd.get(p.updatedAt) ?? 0) + 1)
  }
  const out: JournalItem[] = []
  for (const [day, n] of pub) if (n >= PUB_MIN) out.push({ day, kind: 'pub', text: `${n} articles publiés`, source: 'articles' })
  for (const [day, n] of upd) if (n >= UPD_MIN) out.push({ day, kind: 'maj', text: `${n} articles mis à jour`, source: 'articles' })
  return out
}

export async function journal(pool: Pool, r: Range): Promise<JournalItem[]> {
  const { rows } = await pool.query<{ id: number; day: string; kind: NoteKind; text: string; source: JournalItem['source'] }>(
    `SELECT id::int, day::text, kind, text, source FROM analytics.seo_notes WHERE day BETWEEN $1 AND $2`,
    [r.start, r.end],
  )
  return [...rows, ...fromArticles(r)].sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0))
}

/** Pastilles d'une courbe : tout sauf les lignes « journal ». Ordre : notes manuelles d'abord pour un même jour. */
export async function chartNotes(pool: Pool, r: Range): Promise<ChartNote[]> {
  const all = await journal(pool, r)
  const rank = (s: JournalItem['source']) => (s === 'manuel' ? 0 : s === 'auto' ? 1 : 2)
  return all
    .filter((n) => n.source !== 'journal')
    .sort((a, b) => rank(a.source) - rank(b.source))
    .map(({ day, kind, text }) => ({ day, kind, text }))
}

export async function addNote(pool: Pool, day: string, kind: NoteKind, text: string): Promise<void> {
  await pool.query(`INSERT INTO analytics.seo_notes (day, kind, text, source) VALUES ($1, $2, $3, 'manuel')`, [day, kind, text.slice(0, 200)])
}

export async function deleteNote(pool: Pool, id: number): Promise<void> {
  await pool.query(`DELETE FROM analytics.seo_notes WHERE id = $1 AND source = 'manuel'`, [id])
}
