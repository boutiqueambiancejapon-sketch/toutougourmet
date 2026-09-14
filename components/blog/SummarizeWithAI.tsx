import { AI_PROVIDERS, buildAIUrl } from '@/lib/config/ai-providers'
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'

interface SummarizeWithAIProps {
  title: string
  url: string
  domain?: string
  locale?: Locale
}

export function SummarizeWithAI({ title, url, locale = DEFAULT_LOCALE }: SummarizeWithAIProps) {
  const enabledProviders = AI_PROVIDERS.filter((p) => p.enabled)
  const t = getDictionary(locale)

  return (
    <div className="bg-[var(--bg-surface-2)] border border-[var(--border)] rounded-[var(--radius-xl)] p-4 my-6">
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
        {t.summarizeWith}
      </p>
      <div className="flex flex-wrap gap-2">
        {enabledProviders.map((provider) => (
          <a
            key={provider.name}
            href={buildAIUrl(provider, title, url)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent-1)] hover:text-[var(--accent-1)] hover:shadow-[var(--shadow-sm)]"
            aria-label={`${t.summarizeWith} ${provider.name}`}
          >
            <AIProviderIcon name={provider.name} />
            <span>{provider.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

function AIProviderIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    ChatGPT: '💬',
    Claude: '✦',
    Mistral: '🌊',
    Perplexity: '🔍',
    Grok: '✕',
  }
  return <span className="text-base" aria-hidden="true">{icons[name] ?? '🤖'}</span>
}
