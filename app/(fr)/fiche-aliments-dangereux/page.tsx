import type { Metadata } from 'next'
import Link from 'next/link'
import { getFoodVerdicts, type FoodVerdict } from '@/lib/food-verdicts'
import { POISON_COUNTRIES } from '@/data/poison-centers'
import { VerdictIcon } from '@/components/icons'
import { PrintButton } from '@/components/fiche/PrintButton'

// @cdc 04-pages — fiche à imprimer offerte en bonus des articles (audit design-cro §3).
// Construite à partir des verdicts des guides, hors index et hors sitemap.

export const metadata: Metadata = {
  title: 'Aliments dangereux pour le chien, fiche à imprimer',
  description: 'Les aliments dangereux et ceux à donner avec modération, avec les numéros des centres antipoison.',
  robots: { index: false, follow: true },
}

function FoodList({ title, hint, verdict, foods }: { title: string; hint: string; verdict: FoodVerdict['verdict']; foods: FoodVerdict[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="m-0 flex items-center gap-2 font-display text-xl font-black text-ink print:text-lg">
        <VerdictIcon verdict={verdict} className="size-7 print:size-6" />
        {title}
        <span className="text-base font-normal text-ink-2">{foods.length}</span>
      </h2>
      <p className="m-0 text-sm text-ink-2">{hint}</p>
      <ul role="list" className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-1 p-0 sm:grid-cols-3 print:grid-cols-4 print:gap-y-0.5">
        {foods.map((f) => (
          <li key={f.href} className="text-[15px] leading-snug text-ink print:text-[12px]">
            {f.label}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function FicheAlimentsDangereuxPage() {
  // Fiche « aliments » : on retire ce qui n'est pas un aliment et le doublon « Ail ou oignon »
  const NOT_FOOD = new Set(['Crapaud', 'Limace', 'Mort-aux-rats', 'Eau de mer', 'Ail ou oignon'])
  const foods = getFoodVerdicts().filter((f) => !NOT_FOOD.has(f.label))
  const danger = foods.filter((f) => f.verdict === 'danger')
  const moderation = foods.filter((f) => f.verdict === 'moderation')
  const version = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())

  return (
    <div className="v2 bg-cream print:bg-paper">
      <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 md:py-12 print:max-w-none print:gap-4 print:p-0">
        <header className="flex flex-col gap-2 border-b border-line pb-4 print:pb-2">
          <p className="m-0 text-sm font-semibold text-ink-2">Toutou Gourmet · toutou-gourmet.com</p>
          <h1 className="m-0 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-black leading-tight text-ink print:text-[26px]">
            Aliments dangereux pour le chien
          </h1>
          <p className="m-0 text-[15px] text-ink-2 print:text-[12px]">
            Fiche à coller sur le frigo, tirée des guides du site. Version de {version}.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 print:hidden">
            <PrintButton />
            <Link href="/chien/urgences" className="text-[15px] font-semibold text-ink underline underline-offset-2">
              Voir les guides urgences
            </Link>
          </div>
        </header>

        <FoodList title="À ne jamais donner" hint="Même en petite quantité." verdict="danger" foods={danger} />
        <FoodList
          title="Avec modération"
          hint="En petite quantité, pas tous les jours, et sous la forme indiquée dans le guide."
          verdict="moderation"
          foods={moderation}
        />

        <section className="flex flex-col gap-2 rounded-card bg-rose-bg p-4 print:break-inside-avoid print:p-3">
          <h2 className="m-0 font-display text-xl font-black text-ink print:text-lg">Il en a mangé</h2>
          <p className="m-0 text-sm text-ink-2">Appelle ton vétérinaire ou un centre antipoison vétérinaire, sans attendre les symptômes.</p>
          <ul role="list" className="m-0 flex list-none flex-col gap-1 p-0">
            {POISON_COUNTRIES.flatMap((country) =>
              country.centers.map((c) => (
                <li key={c.tel} className="flex flex-wrap items-baseline gap-x-3 text-ink">
                  <span className="w-16 shrink-0 text-xs font-semibold text-ink-2">{country.label}</span>
                  <a href={`tel:${c.tel}`} className="font-display text-xl font-black tabular-nums text-ink no-underline print:text-lg">
                    {c.phone}
                  </a>
                  <span className="text-sm">
                    {c.name}, {c.city}
                    {c.hours ? `, ${c.hours}` : ''}
                    {c.note ? ` (${c.note.replace(/\.$/, '').toLowerCase()})` : ''}
                  </span>
                </li>
              )),
            )}
          </ul>
        </section>

        <p className="m-0 text-xs text-ink-2">
          Cette fiche ne remplace pas l&apos;avis d&apos;un vétérinaire. Le détail de chaque aliment est sur toutou-gourmet.com.
        </p>
      </article>
    </div>
  )
}
