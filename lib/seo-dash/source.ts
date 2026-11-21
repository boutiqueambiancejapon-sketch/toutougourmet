import { SITE } from './config'

// @cdc tableau de bord SEO — classement des sources, le même fichier sur Toutou Gourmet, 10minlanguages et Quel Robot
// Tondeuse : une visite se range dans une famille (Recherche, Assistants IA, Réseaux sociaux, E-mail, Sites référents,
// Direct) puis sous un nom (Google, Bing, ChatGPT, WhatsApp, un domaine…). Entrées : hôte du référent (sans www), IA
// repérée par l'ingestion, utm_source et utm_medium, page précédente sur le site (navigation interne).

export type Family = 'search' | 'ai' | 'social' | 'email' | 'referral' | 'direct' | 'internal'

/** Familles affichées (la navigation interne n'est pas une entrée), dans l'ordre fixe des couleurs. */
export const FAMILIES: { key: Exclude<Family, 'internal'>; label: string; short: string; color: string }[] = [
  { key: 'search', label: 'Recherche', short: 'Recherche', color: 'var(--sd-f1)' },
  { key: 'ai', label: 'Assistants IA', short: 'IA', color: 'var(--sd-f2)' },
  { key: 'social', label: 'Réseaux sociaux', short: 'Réseaux', color: 'var(--sd-f3)' },
  { key: 'email', label: 'E-mail et lettre', short: 'E-mail', color: 'var(--sd-f4)' },
  { key: 'referral', label: 'Sites référents', short: 'Sites', color: 'var(--sd-f5)' },
  { key: 'direct', label: 'Direct', short: 'Direct', color: 'var(--sd-f6)' },
]

export const FAMILY_LABEL: Record<Family, string> = {
  search: 'Recherche',
  ai: 'Assistants IA',
  social: 'Réseaux sociaux',
  email: 'E-mail et lettre',
  referral: 'Sites référents',
  direct: 'Direct',
  internal: 'Navigation interne',
}

export interface Classified {
  family: Family
  name: string
}

export interface SourceSignals {
  host: string | null
  /** IA repérée par l'ingestion des journaux (10minlanguages, QRT). */
  ai?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  /** Page précédente sur le site. */
  from?: string | null
}

interface Known {
  name: string
  family: Exclude<Family, 'direct' | 'internal'>
  /** Hôte du référent (sans www). */
  host: RegExp
  /** utm_source sans point (« chatgpt », « bing »). */
  utm?: string[]
}

const d = (...hosts: string[]) => new RegExp(`(^|\\.)(${hosts.map((h) => h.replace(/\./g, '\\.')).join('|')})$`)

/** L'ordre compte : messageries web avant Yahoo, Gemini et Copilot avant Google et Bing. */
const KNOWN: Known[] = [
  // E-mail : lettre (Brevo), applis et messageries web.
  { name: 'Lettre (Brevo)', family: 'email', host: /(^|\.)(sendibt\d*\.com|sendibm\d*\.com|sendinblue\.com|brevo\.com|brevosend\.com)$/, utm: ['newsletter', 'brevo', 'sendinblue', 'lettre'] },
  { name: 'Gmail', family: 'email', host: /^(com\.google\.android\.gm|mail\.google\.com)$/, utm: ['gmail'] },
  { name: 'Outlook', family: 'email', host: /^(com\.microsoft\.office\.outlook|outlook\.(live|office|office365)\.com)$/, utm: ['outlook'] },
  { name: 'Messagerie web', family: 'email', host: /(^|\.)(webmail|mail\d*|messagerie|courrier)\.|^mail\.yahoo\.com$/, utm: ['email', 'e-mail', 'mail'] },
  // Assistants IA.
  { name: 'ChatGPT', family: 'ai', host: d('chatgpt.com', 'openai.com'), utm: ['chatgpt', 'openai'] },
  { name: 'Perplexity', family: 'ai', host: d('perplexity.ai'), utm: ['perplexity'] },
  { name: 'Claude', family: 'ai', host: d('claude.ai'), utm: ['claude'] },
  { name: 'Gemini', family: 'ai', host: d('gemini.google.com', 'bard.google.com', 'vertexaisearch.cloud.google.com'), utm: ['gemini', 'bard'] },
  { name: 'Copilot', family: 'ai', host: d('copilot.microsoft.com', 'copilot.bing.com', 'copilot.cloud.microsoft'), utm: ['copilot'] },
  { name: 'Le Chat (Mistral)', family: 'ai', host: d('mistral.ai'), utm: ['mistral', 'lechat'] },
  { name: 'Grok', family: 'ai', host: d('grok.com', 'x.ai'), utm: ['grok'] },
  { name: 'DeepSeek', family: 'ai', host: d('deepseek.com'), utm: ['deepseek'] },
  { name: 'Meta AI', family: 'ai', host: d('meta.ai'), utm: ['metaai', 'meta.ai'] },
  { name: 'Duck.ai', family: 'ai', host: d('duck.ai'), utm: ['duckai'] },
  { name: 'Poe', family: 'ai', host: d('poe.com'), utm: ['poe'] },
  { name: 'You.com', family: 'ai', host: d('you.com'), utm: ['you'] },
  { name: 'Phind', family: 'ai', host: d('phind.com'), utm: ['phind'] },
  { name: 'Kimi', family: 'ai', host: d('kimi.ai', 'kimi.com', 'moonshot.cn'), utm: ['kimi'] },
  { name: 'Qwen', family: 'ai', host: d('qwen.ai', 'tongyi.aliyun.com'), utm: ['qwen'] },
  // Moteurs de recherche.
  { name: 'Google', family: 'search', host: /(^|\.)google\.[a-z.]+$|^com\.google\.android\.googlequicksearchbox$/, utm: ['google'] },
  { name: 'Bing', family: 'search', host: /(^|\.)bing\.(com|net)$/, utm: ['bing'] },
  { name: 'DuckDuckGo', family: 'search', host: d('duckduckgo.com', 'ddg.gg'), utm: ['duckduckgo', 'ddg'] },
  { name: 'Yahoo', family: 'search', host: /(^|\.)yahoo\.[a-z.]+$|(^|\.)yahoo\.co\.[a-z]+$/, utm: ['yahoo'] },
  { name: 'Ecosia', family: 'search', host: d('ecosia.org'), utm: ['ecosia'] },
  { name: 'Qwant', family: 'search', host: d('qwant.com', 'qwantjunior.com'), utm: ['qwant'] },
  { name: 'Yandex', family: 'search', host: /(^|\.)(yandex\.[a-z.]+|ya\.ru)$/, utm: ['yandex'] },
  { name: 'Brave', family: 'search', host: d('search.brave.com', 'brave.com'), utm: ['brave'] },
  { name: 'Startpage', family: 'search', host: /(^|\.)startpage\.(com|nl)$/, utm: ['startpage'] },
  { name: 'Baidu', family: 'search', host: d('baidu.com'), utm: ['baidu'] },
  { name: 'Lilo', family: 'search', host: d('lilo.org'), utm: ['lilo'] },
  { name: 'Naver', family: 'search', host: d('naver.com'), utm: ['naver'] },
  { name: 'Seznam', family: 'search', host: d('seznam.cz'), utm: ['seznam'] },
  { name: 'Mojeek', family: 'search', host: d('mojeek.com'), utm: ['mojeek'] },
  { name: 'Swisscows', family: 'search', host: d('swisscows.com'), utm: ['swisscows'] },
  { name: 'Kagi', family: 'search', host: d('kagi.com'), utm: ['kagi'] },
  { name: 'AOL', family: 'search', host: d('aol.com', 'aol.fr'), utm: ['aol'] },
  { name: 'Ask', family: 'search', host: d('ask.com'), utm: ['ask'] },
  { name: 'Petal', family: 'search', host: d('petalsearch.com'), utm: ['petal'] },
  { name: 'MetaGer', family: 'search', host: d('metager.org', 'metager.de'), utm: ['metager'] },
  { name: 'Presearch', family: 'search', host: d('presearch.com', 'presearch.org'), utm: ['presearch'] },
  { name: 'Sogou', family: 'search', host: d('sogou.com'), utm: ['sogou'] },
  { name: 'Yep', family: 'search', host: d('yep.com'), utm: ['yep'] },
  // Réseaux sociaux et messageries.
  { name: 'WhatsApp', family: 'social', host: /(^|\.)whatsapp\.(com|net)$|^wa\.me$/, utm: ['whatsapp', 'wa'] },
  { name: 'Messenger', family: 'social', host: d('messenger.com'), utm: ['messenger'] },
  { name: 'Facebook', family: 'social', host: d('facebook.com', 'fb.com', 'fb.me'), utm: ['facebook', 'fb'] },
  { name: 'Instagram', family: 'social', host: d('instagram.com'), utm: ['instagram', 'ig'] },
  { name: 'Pinterest', family: 'social', host: /(^|\.)pinterest\.[a-z.]+$|^pin\.it$/, utm: ['pinterest'] },
  { name: 'Reddit', family: 'social', host: d('reddit.com', 'redd.it'), utm: ['reddit'] },
  { name: 'X', family: 'social', host: d('x.com', 'twitter.com', 't.co'), utm: ['x', 'twitter'] },
  { name: 'LinkedIn', family: 'social', host: d('linkedin.com', 'lnkd.in'), utm: ['linkedin'] },
  { name: 'YouTube', family: 'social', host: d('youtube.com', 'youtu.be'), utm: ['youtube'] },
  { name: 'TikTok', family: 'social', host: d('tiktok.com'), utm: ['tiktok'] },
  { name: 'Snapchat', family: 'social', host: d('snapchat.com'), utm: ['snapchat'] },
  { name: 'Threads', family: 'social', host: d('threads.net', 'threads.com'), utm: ['threads'] },
  { name: 'Bluesky', family: 'social', host: d('bsky.app'), utm: ['bluesky', 'bsky'] },
  { name: 'Telegram', family: 'social', host: /^(t\.me|web\.telegram\.org|telegram\.org)$/, utm: ['telegram'] },
  { name: 'Discord', family: 'social', host: d('discord.com', 'discordapp.com'), utm: ['discord'] },
  { name: 'Quora', family: 'social', host: d('quora.com'), utm: ['quora'] },
]

const EMAIL_MEDIUM = new Set(['email', 'e-mail', 'mail', 'newsletter', 'lettre'])
const SOCIAL_MEDIUM = new Set(['social', 'social-network', 'social_media', 'reseaux'])
/** Moteur inconnu : « search.machin.org », « machin.org/search ». */
const SEARCH_LIKE = /(^|\.)(search|recherche|suche)\./

const clean = (v: string | null | undefined): string => (v ? v.trim().toLowerCase().replace(/^www\./, '') : '')

const OWN = SITE.hosts.map((h) => h.replace(/^www\./, '').toLowerCase())

export function isOwn(host: string): boolean {
  return OWN.some((o) => host === o || host.endsWith(`.${o}`))
}

function byHost(h: string): Known | null {
  return KNOWN.find((k) => k.host.test(h)) ?? null
}

function byUtm(u: string): Known | null {
  if (u.includes('.')) return byHost(u)
  return KNOWN.find((k) => k.utm?.includes(u)) ?? null
}

/** Nom propre d'une IA écrite par l'ingestion (« chatgpt.com », « ChatGPT ») : celui de la liste, sinon tel quel. */
function aiName(v: string): string {
  const c = clean(v)
  return byUtm(c.replace(/\s+/g, ''))?.name ?? byHost(c)?.name ?? v
}

export function classify({ host, ai, utmSource, utmMedium, from }: SourceSignals): Classified {
  const utm = clean(utmSource)
  const medium = clean(utmMedium)
  const h = clean(host)
  const hk = h ? byHost(h) : null
  const uk = utm && !isOwn(utm) ? byUtm(utm) : null
  if (hk?.family === 'email') return { family: 'email', name: hk.name }
  if (uk?.family === 'email') return { family: 'email', name: uk.name }
  if (EMAIL_MEDIUM.has(medium)) return { family: 'email', name: utm && !isOwn(utm) ? (uk?.name ?? utm) : 'E-mail' }
  if (ai) return { family: 'ai', name: aiName(ai) }
  if (uk) return { family: uk.family, name: uk.name }
  if (utm && !isOwn(utm) && (!h || isOwn(h))) return { family: SOCIAL_MEDIUM.has(medium) ? 'social' : 'referral', name: utm }
  if (!h) return from ? { family: 'internal', name: FAMILY_LABEL.internal } : { family: 'direct', name: 'Direct' }
  if (isOwn(h)) return { family: 'internal', name: FAMILY_LABEL.internal }
  if (hk) return { family: hk.family, name: hk.name }
  if (SEARCH_LIKE.test(h)) return { family: 'search', name: h }
  return { family: 'referral', name: h }
}

/** Clé d'une source dans l'adresse : « search:Bing », ou la famille seule (« ai »). */
export const sourceKey = (c: Classified): string => `${c.family}:${c.name}`

export function parseSourceKey(key: string): { family: Family; name: string | null } | null {
  const i = key.indexOf(':')
  const fam = (i < 0 ? key : key.slice(0, i)) as Family
  if (!(fam in FAMILY_LABEL)) return null
  return { family: fam, name: i < 0 ? null : key.slice(i + 1) || null }
}
