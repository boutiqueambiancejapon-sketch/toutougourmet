import type { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { POISON_CENTERS } from '@/data/poison-centers'
import { IconAlert } from '@/components/icons'
import { PoisonCentersList } from './PoisonCentersList'

// @cdc seo-geo §2.7 — centres antipoison sous les étapes « Que faire si… ».
// Chaque numéro est un lien tel: : un appui suffit sur mobile. Numéros selon le pays du visiteur.

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
          <PoisonCentersList callLabel={t.call} />
        </>
      )}
    </aside>
  )
}
