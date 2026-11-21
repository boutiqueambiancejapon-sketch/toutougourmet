import { channelOf, isOwnHost, type Channel } from './traffic'

// @cdc tableau de bord — source précise d'une ligne du fil « En direct » (Google, ChatGPT, WhatsApp…).
// Le canal (couleur) vient de channelOf, le classement des acquisitions : une seule règle pour les deux.

export type SourceChannel = Channel | 'internal'

export interface Source {
  label: string
  channel: SourceChannel
  /** Page précédente sur le site, pour la navigation interne. */
  from?: string
}

export interface SourceInput {
  host: string | null
  utmSource?: string | null
  utmMedium?: string | null
  from?: string | null
}

/** Noms lisibles, testés sur l'hôte du référent ou sur utm_source. L'ordre compte (Gemini avant Google). */
const NAMES: [RegExp, string][] = [
  [/(^|\.)(chatgpt\.com|openai\.com)$|^chatgpt$/, 'ChatGPT'],
  [/(^|\.)perplexity\.ai$|^perplexity$/, 'Perplexity'],
  [/(^|\.)claude\.ai$|^claude$/, 'Claude'],
  [/(^|\.)gemini\.google\.com$|^gemini$/, 'Gemini'],
  [/(^|\.)copilot\.(microsoft|bing)\.com$|^copilot$/, 'Copilot'],
  [/(^|\.)mistral\.ai$/, 'Le Chat (Mistral)'],
  [/(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$|^google$/, 'Google'],
  [/(^|\.)bing\.com$|^bing$/, 'Bing'],
  [/(^|\.)duckduckgo\.com$|^duckduckgo$/, 'DuckDuckGo'],
  [/(^|\.)ecosia\.org$/, 'Ecosia'],
  [/(^|\.)qwant\.com$/, 'Qwant'],
  [/(^|\.)yahoo\.[a-z.]+$/, 'Yahoo'],
  [/(^|\.)(brave\.com|search\.brave\.com)$/, 'Brave'],
  [/(^|\.)whatsapp\.(com|net)$|^wa\.me$|^whatsapp$/, 'WhatsApp'],
  [/(^|\.)messenger\.com$|^messenger$/, 'Messenger'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$|^(facebook|fb)$/, 'Facebook'],
  [/(^|\.)instagram\.com$|^(instagram|ig)$/, 'Instagram'],
  [/(^|\.)pinterest\.[a-z.]+$|^pin\.it$|^pinterest$/, 'Pinterest'],
  [/(^|\.)reddit\.com$|^reddit$/, 'Reddit'],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$|^(x|twitter)$/, 'X'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$|^linkedin$/, 'LinkedIn'],
  [/(^|\.)youtube\.com$|^youtu\.be$|^youtube$/, 'YouTube'],
  [/(^|\.)tiktok\.com$|^tiktok$/, 'TikTok'],
]

/** Liens suivis de Brevo (ex-Sendinblue) et applis de messagerie : la newsletter et nos e-mails. */
const EMAIL = /(^|\.)(sendibt\d*\.com|sendibm\d*\.com|sendinblue\.com|brevo\.com|brevosend\.com)$|^com\.google\.android\.gm$|^(newsletter|brevo|sendinblue|email|e-mail|mail)$/

const clean = (v: string | null | undefined) => (v ? v.trim().toLowerCase().replace(/^www\./, '') : '')

const nameOf = (v: string) => NAMES.find(([re]) => re.test(v))?.[1] ?? null

export function sourceOf({ host, utmSource, utmMedium, from }: SourceInput): Source {
  const utm = clean(utmSource)
  const medium = clean(utmMedium)
  if (medium === 'email' || medium === 'newsletter' || (utm && EMAIL.test(utm))) return { label: 'Newsletter / e-mail', channel: 'email' }
  const h = clean(host)
  if (h && EMAIL.test(h)) return { label: 'Newsletter / e-mail', channel: 'email' }
  if (utm && !isOwnHost(utm)) {
    const named = nameOf(utm)
    if (named) return { label: named, channel: utm.includes('.') ? channelOf(utm) : channelOfName(named) }
    if (!h || isOwnHost(h)) return { label: utm, channel: 'other' }
  }
  if (!h) return from ? { label: 'Navigation interne', channel: 'internal', from } : { label: 'Direct', channel: 'direct' }
  if (isOwnHost(h)) return { label: 'Navigation interne', channel: 'internal', from: from ?? undefined }
  const channel = channelOf(h)
  const named = nameOf(h)
  if (named) return { label: named, channel: channel === 'other' ? channelOfName(named) : channel }
  return { label: channel === 'email' ? 'E-mail' : h, channel }
}

/** Canal d'un nom venu d'utm_source sans hôte (« chatgpt », « facebook »). */
function channelOfName(name: string): SourceChannel {
  if (['ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Copilot', 'Le Chat (Mistral)'].includes(name)) return 'ai'
  if (name === 'Google') return 'google'
  if (['Bing', 'DuckDuckGo', 'Ecosia', 'Qwant', 'Yahoo', 'Brave'].includes(name)) return 'search'
  return 'social'
}
