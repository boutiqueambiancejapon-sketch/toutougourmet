// @cdc lot 6 — fiche produit générée depuis le cache du scanner. noindex et hors sitemap tant
// que la rédaction ne l'a pas relue (reviewed = false) : une lecture IA brute n'est pas indexée.
// Exception réglable : fiche Open Pet Food Facts complète si OPFF_INDEX_POLICY=complete
// (lib/server/scanner-published.ts), désactivée par défaut.
// JSON-LD Product + Review seulement si relue. Sous 55/100 : marques partenaires en remplacement.
// Friandise (barème à part) : pastille « Friandise », alertes de sécurité en tête, nombre par
// jour à la place de la matière sèche, recettes maison sous 55/100 (pas de partenaire friandise).
// Image de partage : /croquettes/[slug]/og.png (Open Graph) et story.png (bouton « Partager »).
// « Télécharger le PDF » : /croquettes/[slug]/fiche.pdf, une page A4.
// Allergies des chiens du compte : encadré rendu dans le navigateur (components/scanner/AllergyAlert).
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BreadcrumbNav, type BreadcrumbItem } from '@/components/ui/BreadcrumbNav'
import { AllergyAlert } from '@/components/scanner/AllergyAlert'
import { DownloadLink } from '@/components/scanner/DownloadLink'
import { ShareButton } from '@/components/scanner/ShareButton'
import { SourceNotice } from '@/components/scanner/SourceNotice'
import { LabelData } from '@/components/scanner/LabelData'
import { ScoreBadge } from '@/components/scanner/ScoreBadge'
import { FicheAlternatives } from '@/components/scanner/fiche/FicheAlternatives'
import { FicheBuy } from '@/components/scanner/fiche/FicheBuy'
import { buyLink } from '@/lib/scanner/buy-link'
import { FicheJsonLd } from '@/components/scanner/fiche/FicheJsonLd'
import { FicheNutrition } from '@/components/scanner/fiche/FicheNutrition'
import { FicheVerdict } from '@/components/scanner/fiche/FicheVerdict'
import { ProductPhoto } from '@/components/scanner/ProductPhoto'
import { KindTag } from '@/components/scanner/treat/KindTag'
import { TreatAlerts } from '@/components/scanner/treat/TreatAlerts'
import { TreatHomemade } from '@/components/scanner/treat/TreatHomemade'
import { CATEGORY_PHRASE, foodNoun, NOUNS } from '@/lib/scanner/food-noun'
import { kindOf } from '@/lib/scanner/score'
import { toScanAnalysis } from '@/lib/scanner/result'
import { ALTERNATIVE_BELOW, alternativesFor, brandSlug, ficheTitle } from '@/lib/scanner/seo'
import { betterAtMaxiZoo } from '@/lib/server/scanner-catalog'
import { getBySlug } from '@/lib/server/scanner'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { getDb } from '@/lib/server/drizzle'
import { isPublished } from '@/lib/server/scanner-published'
import { titleTypo } from '@/lib/title-typo'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

const SITE = 'https://www.toutou-gourmet.com'

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
  const treat = kindOf(row.details) === 'treat'
  const noun = foodNoun(row.extracted, row.details)
  const name = [row.brand, row.product].filter(Boolean).join(' ') || NOUNS[noun].these
  const url = `${SITE}/croquettes/${row.slug}`
  const what = treat ? 'premier ingrédient, part de viande, sucre, sel et additifs' : 'protéines et glucides sur matière sèche, premier ingrédient, additifs'
  return {
    title: { absolute: ficheTitle(row.brand, row.product, row.score, noun) },
    description: `Avis et composition de ${name} : ${what}${row.score !== null ? `, note de ${row.score}/100` : ''} selon notre barème publié.`.slice(0, 160),
    alternates: { canonical: url },
    openGraph: {
      title: `${name}${row.score !== null ? ` : ${row.score}/100` : ''}`,
      url,
      type: 'website',
      images: [{ url: `${url}/og.png`, width: 1200, height: 630, alt: `Note de ${name}` }],
    },
    robots: (await isPublished(row)) ? undefined : { index: false, follow: true },
  }
}

export default async function CroquettePage({ params }: Params) {
  const row = await load((await params).slug)
  if (!row) notFound()
  const a = toScanAnalysis(row)
  const treat = kindOf(a.details) === 'treat'
  const noun = foodNoun(a.label, a.details)
  const words = NOUNS[noun]
  const better = a.score !== null && a.score < ALTERNATIVE_BELOW ? await betterAtMaxiZoo(noun, a.brand, a.score) : null
  const name = [a.brand, a.product].filter(Boolean).join(' ') || 'Produit sans nom lisible'
  const h1 = a.product ? `${a.product}${a.brand ? ` (${a.brand})` : ''} : notre analyse` : `${a.brand ?? words.unnamed} : notre analyse`
  const date = row.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  const bSlug = brandSlug(a.brand)
  const brandListed = bSlug !== null && (await reviewedItemsSafe('complete')).some((it) => it.brandSlug === bSlug)
  const crumbs: BreadcrumbItem[] = [{ label: 'Accueil', href: '/' }, treat ? { label: 'Classement des friandises', href: '/croquettes/friandises' } : { label: 'Classement des croquettes', href: '/croquettes' }]
  if (a.brand) crumbs.push(brandListed ? { label: a.brand, href: `/croquettes/marque/${bSlug}` } : { label: a.brand })
  crumbs.push({ label: a.product ?? name })
  const first = a.label.ingredients[0]
  const n = a.label.ingredients.length
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-10 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <FicheJsonLd row={row} name={name} url={`${SITE}/croquettes/${row.slug}`} />
      <div className="flex flex-col gap-4">
        <BreadcrumbNav items={crumbs} />
        <header className="flex flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(1.75rem,4.2vw,2.5rem)] font-black leading-[1.08] tracking-tight text-ink">{titleTypo(h1)}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <ProductPhoto src={row.imageUrl} size="lg" />
            <ScoreBadge score={a.score} />
            <KindTag details={a.details} />
            <p className="m-0 text-base text-ink-2">
              {`${row.reviewed ? 'Fiche relue' : a.source === 'openpetfoodfacts' ? 'Données Open Pet Food Facts' : a.source === 'openfoodfacts' ? 'Données Open Food Facts' : a.source === 'maxizoo' ? 'Données Maxi Zoo' : 'Analyse automatique'} du `}
              <time dateTime={row.createdAt.toISOString()}>{date}</time>
              {a.ean ? ` · code-barres ${a.ean}` : ''}
            </p>
          </div>
        </header>
        <SourceNotice source={a.source} reviewed={row.reviewed} />
        {a.details.treat ? <TreatAlerts alerts={a.details.treat.alerts} /> : null}
        <AllergyAlert ingredients={a.label.ingredients.map((i) => i.nom)} />
      </div>

      <section aria-labelledby="contenu" className="flex flex-col gap-4">
        <h2 id="contenu" className="m-0 font-display text-2xl font-black text-ink">
          {words.contains}
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          {first
            ? `La composition liste ${n} ingrédient${n > 1 ? 's' : ''}. Le premier, le plus lourd de la recette (règlement CE 767/2009), est « ${first.nom} »${first.pourcentage !== null ? `, à ${first.pourcentage.toLocaleString('fr-FR')} %` : ''}.`
            : 'La composition n\'a pas pu être lue sur cette étiquette.'}
          {a.label.additifs.length > 0 ? ` L'étiquette cite ${a.label.additifs.length} additif${a.label.additifs.length > 1 ? 's' : ''}.` : ''}
        </p>
        <LabelData label={a.label} source={a.source} headingLevel="h3" />
      </section>

      {treat ? null : <FicheNutrition label={a.label} />}

      <FicheVerdict brand={a.brand} details={a.details} words={words} noun={noun}>
        <div className="flex gap-2 sm:max-w-md">
          <DownloadLink slug={a.slug} className="flex-1" />
          <ShareButton slug={a.slug} name={name} score={a.score} className="flex-1" />
        </div>
      </FicheVerdict>

      <FicheBuy link={buyLink({ ...a, buyUrl: row.buyUrl })} />
      <FicheAlternatives better={better} category={CATEGORY_PHRASE[noun]} alternatives={alternativesFor(a.brand, a.score, kindOf(a.details))} />
      {treat ? <TreatHomemade score={a.score} /> : null}

      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Tu as ce paquet sous la main ?{' '}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Scanne son étiquette
        </Link>{' '}
        pour vérifier la lecture, ou compare avec les{' '}
        <Link href={treat ? '/croquettes/friandises' : '/croquettes'} className="font-semibold text-orange-ink underline underline-offset-2">
          {treat ? 'meilleures friandises pour chien' : 'meilleures croquettes pour chien'}
        </Link>
        .
      </p>
    </div>
  )
}
