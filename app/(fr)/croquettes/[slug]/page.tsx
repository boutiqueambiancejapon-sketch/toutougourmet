// @cdc lot 6 — fiche produit générée depuis le cache du scanner. noindex et hors sitemap tant
// que la rédaction ne l'a pas relue (reviewed = false) : une lecture IA brute n'est pas indexée.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { AiNotice } from '@/components/scanner/AiNotice'
import { LabelData } from '@/components/scanner/LabelData'
import { ScoreDetail } from '@/components/scanner/ScoreDetail'
import { toScanAnalysis } from '@/lib/scanner/result'
import { getBySlug } from '@/lib/server/scanner'
import { getDb } from '@/lib/server/drizzle'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams(): { slug: string }[] {
  return []
}

async function load(slug: string) {
  if (!getDb()) return null
  return getBySlug(slug)
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = await load((await params).slug)
  if (!row) return { title: 'Fiche introuvable', robots: { index: false, follow: false } }
  const name = [row.brand, row.product].filter(Boolean).join(' ') || 'Croquettes'
  return {
    title: `${name} : composition et note${row.score !== null ? ` ${row.score}/100` : ''}`,
    description: `Composition, constituants analytiques et note sur 100 de ${name}, calculée par le barème publié de Toutou Gourmet.`,
    alternates: { canonical: `https://www.toutou-gourmet.com/croquettes/${row.slug}` },
    robots: row.reviewed ? undefined : { index: false, follow: true },
  }
}

export default async function CroquettePage({ params }: Params) {
  const row = await load((await params).slug)
  if (!row) notFound()
  const a = toScanAnalysis(row)
  const name = [a.brand, a.product].filter(Boolean).join(' ') || 'Produit sans nom lisible'
  const date = row.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-8 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, { label: name }]} />
        <header className="flex flex-col gap-2">
          <h1 className="m-0 font-display text-[clamp(1.75rem,4.2vw,2.5rem)] font-black leading-[1.08] tracking-tight text-ink">{name}</h1>
          <p className="m-0 text-base text-ink-2">
            {`${row.reviewed ? 'Fiche relue' : 'Analyse automatique'} du ${date}`}
            {a.ean ? ` · code-barres ${a.ean}` : ''}
          </p>
        </header>
      </div>
      <section aria-labelledby="note" className="flex flex-col gap-3">
        <h2 id="note" className="m-0 font-display text-2xl font-black text-ink">
          Quelle note pour sa composition ?
        </h2>
        <ScoreDetail details={a.details} />
      </section>
      <AiNotice reviewed={row.reviewed} />
      <LabelData label={a.label} headingLevel="h2" />
      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Tu as ce paquet sous la main ?{' '}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Scanne son étiquette
        </Link>{' '}
        pour vérifier la lecture ou analyser une autre recette.
      </p>
    </div>
  )
}
