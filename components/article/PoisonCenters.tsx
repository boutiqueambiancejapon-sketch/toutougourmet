import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { POISON_CENTERS } from '@/data/poison-centers'
import { IconAlert } from '@/components/icons'

// @cdc seo-geo §2.7 — centres antipoison sous les étapes « Que faire si… ».
// Chaque numéro est un lien tel: : un appui suffit sur mobile.

export function PoisonCenters({ locale = 'fr' }: { locale?: Locale }) {
  const t = getDictionary(locale).article.poisonCenters
  const centers = POISON_CENTERS[locale]

  return (
    <aside aria-label={t.title} className="v2 my-6 flex flex-col gap-3 rounded-card bg-rose-bg p-5">
      <p className="flex items-center gap-3 font-display text-lg font-black leading-tight text-rose-ink">
        <IconAlert className="size-8 text-ink" />
        {t.title}
      </p>
      {centers.length === 0 ? (
        <p className="text-ink-2">{t.empty}</p>
      ) : (
        <>
          <p className="text-sm text-ink-2">{t.intro}</p>
          <ul role="list" className="flex list-none flex-col gap-2 p-0">
            {centers.map((c) => (
              <li key={c.tel}>
                <a
                  href={`tel:${c.tel}`}
                  className="flex min-h-14 flex-col gap-2 rounded-box border border-line bg-paper px-4 py-3 md:flex-row md:items-center md:gap-3"
                >
                  <span className="flex min-w-0 grow flex-col">
                    <span className="font-semibold text-ink">
                      {c.name} · {c.city}
                      {c.hours ? ` · ${c.hours}` : ''}
                    </span>
                    <span className="text-xs text-ink-2">{c.fullName}</span>
                  </span>
                  <span className="flex shrink-0 items-baseline justify-between gap-3 md:block md:text-right">
                    <span className="block whitespace-nowrap font-display text-xl font-black tabular-nums text-ink">
                      {c.phone}
                    </span>
                    <span className="block text-sm font-semibold text-orange-ink">{t.call}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  )
}
