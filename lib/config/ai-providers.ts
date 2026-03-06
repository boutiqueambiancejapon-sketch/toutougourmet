export interface AIProvider {
  name: string
  urlTemplate: string
  icon: string
  enabled: boolean
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    name: 'ChatGPT',
    urlTemplate: 'https://chat.openai.com/?q={PROMPT}',
    icon: '/images/icons/chatgpt.svg',
    enabled: true,
  },
  {
    name: 'Claude',
    urlTemplate: 'https://claude.ai/new?q={PROMPT}',
    icon: '/images/icons/claude.svg',
    enabled: true,
  },
  {
    name: 'Mistral',
    urlTemplate: 'https://chat.mistral.ai/chat?q={PROMPT}',
    icon: '/images/icons/mistral.svg',
    enabled: true,
  },
  {
    name: 'Perplexity',
    urlTemplate: 'https://www.perplexity.ai/search?q={PROMPT}',
    icon: '/images/icons/perplexity.svg',
    enabled: true,
  },
  {
    name: 'Grok',
    urlTemplate: 'https://grok.com/?q={PROMPT}',
    icon: '/images/icons/grok.svg',
    enabled: true,
  },
]

export function buildAIUrl(provider: AIProvider, title: string, url: string): string {
  const prompt = `Résume cet article de manière concise, en listant les points clés à retenir. Ensuite, si pertinent, propose jusqu'à trois articles connexes publiés uniquement sur le site toutougourmet.fr (sans inclure d'autres sources). Titre : ${title} — URL : ${url}`
  const encodedPrompt = encodeURIComponent(prompt)
  return provider.urlTemplate.replace('{PROMPT}', encodedPrompt)
}
