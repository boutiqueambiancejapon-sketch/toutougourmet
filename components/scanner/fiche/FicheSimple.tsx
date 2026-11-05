import Link from 'next/link'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import type { ScanAnalysis } from '@/lib/scanner/result'
import { AllergyAlert } from '../AllergyAlert'
import { DownloadLink } from '../DownloadLink'
import { ProductPhoto } from '../ProductPhoto'
import { ScoreDetail } from '../ScoreDetail'
import { ShareButton } from '../ShareButton'

// @cdc scanner — fiche sans critère ni tranche (compléments, huiles, note de 0, pas de note) : la note
// ou son absence, le message et les alertes de sécurité, rien d'autre. Ni achat ni alternative.

export function FicheSimple({ a, name }: { a: ScanAnalysis; name: string }) {
  return (
    <div className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-4 pb-16 md:px-8 md:pt-8">
      <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Scanner', href: '/scanner' }, { label: name }]} />
      <h1 className="m-0 font-display text-[clamp(1.75rem,4.2vw,2.5rem)] font-black leading-[1.08] tracking-tight text-ink">{name}</h1>
      <ProductPhoto src={a.imageUrl} size="lg" />
      <AllergyAlert ingredients={a.label.ingredients.map((i) => i.nom)} />
      <ScoreDetail details={a.details} headingLevel="h2" />
      {a.score !== null ? (
        <div className="flex gap-2 sm:max-w-md">
          <DownloadLink slug={a.slug} className="flex-1" />
          <ShareButton slug={a.slug} name={name} score={a.score} className="flex-1" />
        </div>
      ) : null}
      <Link href="/scanner" className="text-[15px] font-semibold text-orange-ink underline underline-offset-2">
        Scanner un autre produit
      </Link>
    </div>
  )
}
