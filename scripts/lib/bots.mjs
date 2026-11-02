// @cdc mesure — reconnaissance des robots par leur User-Agent, et des visiteurs envoyés par une IA.
// kind : ai_training (collecte pour entraîner un modèle), ai_search (index d'un moteur IA),
// ai_user (page ouverte en direct pour répondre à quelqu'un), search, seo, bot.
// L'ordre compte : la première règle qui correspond l'emporte.

export const BOT_RULES = [
  // Lecture en direct pour une réponse
  ['ChatGPT-User', 'ChatGPT-User', 'OpenAI', 'ai_user'],
  ['Perplexity-User', 'Perplexity-User', 'Perplexity', 'ai_user'],
  ['Claude-User', 'Claude-User', 'Anthropic', 'ai_user'],
  ['MistralAI-User', 'MistralAI-User', 'Mistral', 'ai_user'],
  ['Meta-ExternalFetcher', 'Meta-ExternalFetcher', 'Meta', 'ai_user'],
  ['Google-Agent', 'Google-Agent', 'Google', 'ai_user'],
  // Index des moteurs IA
  ['OAI-SearchBot', 'OAI-SearchBot', 'OpenAI', 'ai_search'],
  ['PerplexityBot', 'PerplexityBot', 'Perplexity', 'ai_search'],
  ['Claude-SearchBot', 'Claude-SearchBot', 'Anthropic', 'ai_search'],
  ['DuckAssistBot', 'DuckAssistBot', 'DuckDuckGo', 'ai_search'],
  ['YouBot', 'YouBot', 'You.com', 'ai_search'],
  // Collecte pour l'entraînement
  ['GPTBot', 'GPTBot', 'OpenAI', 'ai_training'],
  ['ClaudeBot', 'ClaudeBot', 'Anthropic', 'ai_training'],
  ['anthropic-ai', 'anthropic-ai', 'Anthropic', 'ai_training'],
  ['Meta-ExternalAgent', 'Meta-ExternalAgent', 'Meta', 'ai_training'],
  ['Applebot-Extended', 'Applebot-Extended', 'Apple', 'ai_training'],
  ['Amazonbot', 'Amazonbot', 'Amazon', 'ai_training'],
  ['Bytespider', 'Bytespider', 'ByteDance', 'ai_training'],
  ['CCBot', 'CCBot', 'Common Crawl', 'ai_training'],
  ['cohere-ai', 'cohere-ai', 'Cohere', 'ai_training'],
  ['Diffbot', 'Diffbot', 'Diffbot', 'ai_training'],
  ['Timpibot', 'Timpibot', 'Timpi', 'ai_training'],
  ['ImagesiftBot', 'ImagesiftBot', 'Imagesift', 'ai_training'],
  ['DeepSeekBot', 'DeepSeekBot', 'DeepSeek', 'ai_training'],
  // Moteurs de recherche
  ['Googlebot', 'Googlebot', 'Google', 'search'],
  ['Google-InspectionTool', 'Google-InspectionTool', 'Google', 'search'],
  ['GoogleOther', 'GoogleOther', 'Google', 'search'],
  ['bingbot', 'Bingbot', 'Microsoft', 'search'],
  ['Applebot', 'Applebot', 'Apple', 'search'],
  ['DuckDuckBot', 'DuckDuckBot', 'DuckDuckGo', 'search'],
  ['Qwantbot', 'Qwantbot', 'Qwant', 'search'],
  ['YandexBot', 'YandexBot', 'Yandex', 'search'],
  ['Baiduspider', 'Baiduspider', 'Baidu', 'search'],
  ['PetalBot', 'PetalBot', 'Huawei', 'search'],
  // Outils SEO
  ['AhrefsBot', 'AhrefsBot', 'Ahrefs', 'seo'],
  ['SemrushBot', 'SemrushBot', 'Semrush', 'seo'],
  ['MJ12bot', 'MJ12bot', 'Majestic', 'seo'],
  ['DotBot', 'DotBot', 'Moz', 'seo'],
  ['Screaming Frog', 'Screaming Frog', 'Screaming Frog', 'seo'],
].map(([needle, bot, operator, kind]) => ({ needle: needle.toLowerCase(), bot, operator, kind }))

const GENERIC_BOT = /bot|crawl|spider|slurp|headless|python|curl|wget|go-http|httpclient|scrapy|java\/|okhttp|axios|node-fetch|uptime|monitor/i

export function classifyUa(ua) {
  const low = (ua || '').toLowerCase()
  if (!low) return { kind: 'bot', bot: '(vide)', operator: null }
  for (const r of BOT_RULES) if (low.includes(r.needle)) return { kind: r.kind, bot: r.bot, operator: r.operator }
  if (GENERIC_BOT.test(low)) return { kind: 'bot', bot: low.slice(0, 40), operator: null }
  return { kind: 'human', bot: null, operator: null }
}

const AI_REFERRERS = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, 'ChatGPT'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity'],
  [/^gemini\.google\.com$|^bard\.google\.com$/, 'Gemini'],
  [/^copilot\.microsoft\.com$|(^|\.)bing\.com$/, 'Copilot'],
  [/(^|\.)claude\.ai$/, 'Claude'],
  [/^chat\.mistral\.ai$/, 'Mistral'],
  [/(^|\.)deepseek\.com$/, 'DeepSeek'],
  [/(^|\.)meta\.ai$/, 'Meta AI'],
  [/(^|\.)you\.com$/, 'You.com'],
  [/(^|\.)poe\.com$/, 'Poe'],
]

/** IA d'origine d'une visite : par le référent, ou par ?utm_source=chatgpt.com que ChatGPT ajoute. */
export function aiReferrer(refHost, uri) {
  const utm = /[?&]utm_source=([^&]+)/.exec(uri || '')?.[1]
  const candidates = [refHost, utm ? decodeURIComponent(utm).toLowerCase() : null].filter(Boolean)
  for (const h of candidates) {
    for (const [re, name] of AI_REFERRERS) {
      if (name === 'Copilot' && h.endsWith('bing.com') && h !== 'copilot.bing.com') continue
      if (re.test(h)) return name
    }
  }
  return null
}

export function deviceOf(ua) {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|iphone|android/i.test(ua)) return 'mobile'
  return 'desktop'
}
