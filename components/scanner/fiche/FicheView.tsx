import Link from 'next/link'
import { BreadcrumbNav, type BreadcrumbItem } from '@/components/ui/BreadcrumbNav'
import { AllergyAlert } from '../AllergyAlert'
import { DownloadLink } from '../DownloadLink'
import { ShareButton } from '../ShareButton'
import { SourceNotice } from '../SourceNotice'
import { LabelData } from '../LabelData'
import { ScoreBadge } from '../ScoreBadge'
import { FicheAlternatives } from './FicheAlternatives'
import { FicheBuy } from './FicheBuy'
import { buyLink } from '@/lib/scanner/buy-link'
import { FicheJsonLd } from './FicheJsonLd'
import { FicheNutrition } from './FicheNutrition'
import { FicheVerdict } from './FicheVerdict'
import { ProductPhoto } from '../ProductPhoto'
import { KindTag } from '../treat/KindTag'
import { TreatAlerts } from '../treat/TreatAlerts'
import { TreatHomemade } from '../treat/TreatHomemade'
import { CATEGORY_PHRASE, foodNoun, NOUNS } from '@/lib/scanner/food-noun'
import { kindOf } from '@/lib/scanner/score'
import { toScanAnalysis } from '@/lib/scanner/result'
import { ALTERNATIVE_BELOW, alternativesFor, brandSlug } from '@/lib/scanner/seo'
import { betterAtMaxiZoo } from '@/lib/server/scanner-catalog'
import { reviewedItemsSafe } from '@/lib/server/scanner-catalog'
import { titleTypo } from '@/lib/title-typo'

import { marquePage } from '@/data/marque-pages'
import type { FoodAnalysis } from '@/db/schema'
import { displayBrand, displayName, recipeName } from '@/lib/scanner/rankings'
import type { FicheIndexee } from '@/lib/scanner/fiches-indexees'
import { FicheChien, FicheComparer, FichePlaceBlock, FicheQuestions } from './FicheRepere'

// @cdc lot 6 — contenu d'une fiche produit. Friandise : barème à part, nombre par jour à la place de la matière
// sèche. Sous 55/100 : marques partenaires en remplacement. Le texte calculé vient de FicheRepere.

const SITE = 'https://www.toutou-gourmet.com'

/** Nom court d'un produit : celui de la fiche indexée, sinon la marque et la recette sans le format. */
export const ficheNom = (brand: string | null, product: string | null, indexee?: FicheIndexee): string | null =>
  indexee?.nom ?? (brand && product ? `${displayBrand(brand)} ${displayName(recipeName(product))}` : null)

export async function FicheView({ row, indexee, path }: { row: FoodAnalysis; indexee?: FicheIndexee; path: string }) {
  const a = toScanAnalysis(row)
  const treat = kindOf(a.details) === 'treat'
  const noun = foodNoun(a.label, a.details)
  const words = NOUNS[noun]
  const better = a.score !== null && a.score < ALTERNATIVE_BELOW ? await betterAtMaxiZoo(noun, a.brand, a.score) : null
  const name = [a.brand, a.product].filter(Boolean).join(' ') || 'Produit sans nom lisible'
  const nom = ficheNom(a.brand, a.product, indexee) ?? name
  const buy = buyLink({ ...a, buyUrl: row.buyUrl })
  const h1 = indexee ? indexee.nom : a.product ? `${a.product}${a.brand ? ` (${a.brand})` : ''} : notre analyse` : `${a.brand ?? words.unnamed} : notre analyse`
  const date = row.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' })
  const bSlug = brandSlug(a.brand)
  const brandListed = bSlug !== null && (await reviewedItemsSafe('complete')).some((it) => it.brandSlug === bSlug)
  const crumbs: BreadcrumbItem[] = [{ label: 'Accueil', href: '/' }, treat ? { label: 'Classement des friandises', href: '/meilleures-friandises' } : { label: 'Classement des croquettes', href: '/meilleures-croquettes' }]
  const mere = marquePage(a.brand)
  if (a.brand) crumbs.push(mere ? { label: displayBrand(a.brand), href: mere.href } : brandListed ? { label: a.brand, href: `/croquettes/marque/${bSlug}` } : { label: a.brand })
  crumbs.push({ label: a.product ?? name })
  const first = a.label.ingredients[0]
  const n = a.label.ingredients.length
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-10 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <FicheJsonLd row={row} name={indexee?.nom ?? name} url={`${SITE}${path}`} indexee={Boolean(indexee)} />
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

      <FichePlaceBlock row={row} noun={noun} nom={nom} />

      {treat ? null : <FicheNutrition label={a.label} />}

      {treat ? null : <FicheChien label={a.label} nom={nom} />}

      <FicheVerdict brand={a.brand} details={a.details} words={words} noun={noun}>
        <div className="flex gap-2 sm:max-w-md">
          <DownloadLink slug={a.slug} className="flex-1" />
          <ShareButton slug={a.slug} name={name} score={a.score} className="flex-1" />
        </div>
      </FicheVerdict>

      <FicheBuy link={buy} />
      <FicheComparer row={row} noun={noun} nom={nom} />
      <FicheAlternatives better={better} category={CATEGORY_PHRASE[noun]} alternatives={alternativesFor(a.brand, a.score, kindOf(a.details))} />
      {treat ? <TreatHomemade score={a.score} /> : null}
      <FicheQuestions label={a.label} nom={nom} note={a.score} magasin={buy?.store ?? null} />
      {mere ? (
        <p className="m-0 text-[15px] leading-relaxed text-ink-2">
          Toute la gamme :{' '}
          <Link href={mere.href} className="font-semibold text-orange-ink underline underline-offset-2">{`avis ${mere.nom}`}</Link>
          .
        </p>
      ) : null}

      <p className="m-0 text-[15px] leading-relaxed text-ink-2">
        Tu as ce paquet sous la main ?{' '}
        <Link href="/scanner" className="font-semibold text-orange-ink underline underline-offset-2">
          Scanne son étiquette
        </Link>{' '}
        pour vérifier la lecture, ou compare avec les{' '}
        <Link href={treat ? '/meilleures-friandises' : '/meilleures-croquettes'} className="font-semibold text-orange-ink underline underline-offset-2">
          {treat ? 'meilleures friandises pour chien' : 'meilleures croquettes pour chien'}
        </Link>
        .
      </p>
    </div>
  )
}
