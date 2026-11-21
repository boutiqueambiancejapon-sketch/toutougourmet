import { classify, type Family } from '@/lib/seo-dash/source'
import type { Channel } from './traffic'

// @cdc tableau de bord — source précise d'une ligne du fil « En direct » (Google, ChatGPT, WhatsApp…). Le nom et la
// famille viennent du classement partagé de l'écran Sources (lib/seo-dash/source.ts) : une seule règle partout.

export type SourceChannel = Channel | 'internal'

export interface Source {
  label: string
  channel: SourceChannel
  /** Page précédente sur le site, pour la navigation interne. */
  from?: string
}

export interface SourceInput {
  host: string | null
  ai?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  from?: string | null
}

const CHANNEL: Record<Family, SourceChannel> = {
  search: 'search',
  ai: 'ai',
  social: 'social',
  email: 'email',
  referral: 'other',
  direct: 'direct',
  internal: 'internal',
}

export function sourceOf({ host, ai, utmSource, utmMedium, from }: SourceInput): Source {
  const c = classify({ host, ai, utmSource, utmMedium, from })
  const channel = c.family === 'search' && c.name === 'Google' ? 'google' : CHANNEL[c.family]
  return c.family === 'internal' ? { label: c.name, channel, from: from ?? undefined } : { label: c.name, channel }
}
