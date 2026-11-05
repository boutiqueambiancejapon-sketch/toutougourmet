import { ImageResponse } from 'next/og'
import { getSlotPath, resolveSlot } from '@/data/image-utils'
import { sansDetail } from '@/lib/scanner/baremes/fiche'
import { BAND_SHORT, highlights } from '@/lib/scanner/highlights'
import type { AnalysisSource } from '@/db/schema'
import { openDataCredit } from '@/components/scanner/SourceNotice'
import { NOUNS, type FoodNoun } from '@/lib/scanner/food-noun'
import { kindOf, type ScoreResult } from '@/lib/scanner/score'
import { loadOgFonts, loadOgPhoto } from './assets'
import { qrDataUri } from './qr'
import { ScanOgCard, ScanStoryCard, STORY_SIZE, type ScanCardData } from './ScanCard'

// @cdc lot 6 — rendu PNG des fiches de partage du scanner (story 1080×1920, Open Graph 1200×630).
// Le chien vient du manifest d'images (slot breed-generic), jamais d'un chemin en dur.
// Friandise : pastille « Friandise notée sur 100 », alerte de sécurité en premier point faible.

export const SCANNER_URL = 'https://www.toutou-gourmet.com/scanner'
const DOG_SLOT = 'breed-generic'

export interface ScanImageInput {
  brand: string | null
  product: string | null
  details: ScoreResult
  source: AnalysisSource
  /** Mot du produit (pâtée, croquettes…) : lib/scanner/food-noun.ts. Défaut : d'après la note. */
  noun?: FoodNoun
}

async function cardData(input: ScanImageInput): Promise<ScanCardData> {
  const slot = resolveSlot(DOG_SLOT)
  const dog = slot?.imageReady ? await loadOgPhoto(getSlotPath(slot), 160, 160) : null
  const { strengths, weaknesses } = highlights(input.details)
  const words = NOUNS[input.noun ?? (kindOf(input.details) === 'treat' ? 'friandise' : 'croquettes')]
  const simple = sansDetail(input.details)
  return {
    score: input.details.score,
    band: input.details.band ? BAND_SHORT[input.details.band] : input.details.score === null ? 'Pas de note' : '',
    ...(simple ? { notes: [input.details.notice, ...(input.details.alertes ?? [])].filter((n): n is string => Boolean(n)).slice(0, 3) } : {}),
    product: input.product ?? input.brand ?? words.forDog,
    brand: input.product ? input.brand : null,
    strengths,
    weaknesses,
    credit: openDataCredit(input.source) ?? 'Lecture automatique, vérifie sur ton sac',
    dog,
    qr: qrDataUri(SCANNER_URL),
    tag: simple ? 'Note sur 100' : words.tag,
    cta: simple ? 'Scanne ton produit' : words.cta,
  }
}

const HEADERS = { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' }

export async function scanStoryResponse(input: ScanImageInput): Promise<Response> {
  const [fonts, data] = await Promise.all([loadOgFonts(), cardData(input)])
  return new ImageResponse(<ScanStoryCard {...data} />, { ...STORY_SIZE, fonts, headers: HEADERS })
}

export async function scanOgResponse(input: ScanImageInput): Promise<Response> {
  const [fonts, data] = await Promise.all([loadOgFonts(), cardData(input)])
  return new ImageResponse(<ScanOgCard {...data} />, { width: 1200, height: 630, fonts, headers: HEADERS })
}
