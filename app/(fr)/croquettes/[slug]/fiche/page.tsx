// @cdc lot 6 — fiche A4 imprimable d'un produit scanné, pour l'impression depuis un ordinateur.
// Bouton principal : le PDF d'une page (route fiche.pdf). L'impression tient aussi sur une page
// A4 (tailles print: réduites). noindex, hors sitemap. Friandise : alertes sous l'en-tête.
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DownloadLink, PrintFicheButton } from '@/components/scanner/DownloadLink'
import { FicheCriteria } from '@/components/scanner/fiche/FicheCriteria'
import { FicheIngredients } from '@/components/scanner/fiche/FicheIngredients'
import { FicheStamp } from '@/components/scanner/fiche/FicheStamp'
import { FichePrintBottom } from '@/components/scanner/fiche/FichePrintBottom'
import { OPFF_CREDIT } from '@/components/scanner/SourceNotice'
import { TreatAlerts } from '@/components/scanner/treat/TreatAlerts'
import { getDb } from '@/lib/server/drizzle'
import { getBySlug } from '@/lib/server/scanner'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

async function load(slug: string) {
  return getDb() ? getBySlug(slug) : null
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const row = await load((await params).slug)
  const name = row ? [row.brand, row.product].filter(Boolean).join(' ') || 'Croquettes' : 'Fiche introuvable'
  return { title: `${name}, fiche à imprimer`, robots: { index: false, follow: false } }
}

export default async function FichePage({ params }: Params) {
  const row = await load((await params).slug)
  if (!row) notFound()
  const name = row.product ?? row.brand ?? 'Produit sans nom lisible'
  const date = row.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  return (
    <div className="v2 bg-cream print:bg-paper print:[print-color-adjust:exact]">
      <style>{'@page { size: A4; margin: 8mm; }'}</style>
      <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:py-10 print:max-w-none print:gap-2.5 print:p-0 print:[zoom:0.9]">
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <DownloadLink slug={row.slug} primary />
          <PrintFicheButton />
          <Link href={`/croquettes/${row.slug}`} className="text-[15px] font-semibold text-ink underline underline-offset-2">
            Revenir à la fiche
          </Link>
        </div>

        <header className="relative flex items-center justify-between gap-4 rounded-card bg-ink p-5 pr-4 text-cream print:rounded-box print:p-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="m-0 font-display text-lg font-black leading-none">
              Toutou <span className="text-orange">Gourmet</span>
            </p>
            <h1 className="m-0 font-display text-[clamp(1.5rem,4vw,2.2rem)] font-black leading-tight text-cream print:text-[22px]">{name}</h1>
            <p className="m-0 text-sm text-cream/80 print:text-[11px]">
              {[row.product ? row.brand : null, row.ean ? `code-barres ${row.ean}` : null, `fiche du ${date}`].filter(Boolean).join(' · ')}
            </p>
          </div>
          <FicheStamp score={row.score} band={row.details.band} />
        </header>

        {row.details.missing.length > 0 ? (
          <p className="m-0 rounded-box bg-amber-bg p-3 text-sm text-amber-ink print:p-2 print:text-[10px]">{`Absent de l'étiquette : ${row.details.missing.join(', ')}. La note porte sur les critères évalués.`}</p>
        ) : null}

        {row.details.treat ? <TreatAlerts alerts={row.details.treat.alerts} /> : null}
        <FicheCriteria details={row.details} />
        <FicheIngredients label={row.extracted} />

        <FichePrintBottom details={row.details} />

        <footer className="flex flex-col gap-1 border-t border-line pt-3 text-xs text-ink-2 print:pt-2 print:text-[9px]">
          <p className="m-0 font-semibold text-ink">
            {row.source === 'openpetfoodfacts'
              ? `${OPFF_CREDIT}. Note calculée par le barème publié de Toutou Gourmet : vérifie sur ton sac.`
              : 'Lecture automatique de l\'étiquette par une IA, vérifie sur ton sac. Note calculée par le barème publié de Toutou Gourmet.'}
          </p>
          <p className="m-0">Méthode et sources : toutou-gourmet.com/scanner. Cette fiche juge la composition, elle ne remplace pas l&apos;avis d&apos;un vétérinaire.</p>
        </footer>
      </article>
    </div>
  )
}
