import { AI_PROVIDERS, buildAIUrl } from '@/lib/config/ai-providers'

interface SummarizeWithAIProps {
  title: string
  url: string
  domain?: string
}

export function SummarizeWithAI({ title, url }: SummarizeWithAIProps) {
  const enabledProviders = AI_PROVIDERS.filter((p) => p.enabled)

  return (
    <div className="v2 my-6 rounded-card border border-line bg-paper p-4">
      <p className="m-0 mb-3 text-sm font-semibold text-ink">Résumer cet article avec une IA</p>
      <div className="flex flex-wrap gap-2">
        {enabledProviders.map((provider) => (
          <a
            key={provider.name}
            href={buildAIUrl(provider, title, url)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-pill border border-line bg-cream px-3.5 py-2 text-sm font-semibold text-ink no-underline hover:border-ink"
            aria-label={`Résumer avec ${provider.name}`}
          >
            {provider.name}
          </a>
        ))}
      </div>
    </div>
  )
}

