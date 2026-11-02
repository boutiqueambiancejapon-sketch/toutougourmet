import type { Metadata } from 'next'
import Link from 'next/link'
import { brands } from '@/data/brands'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { BrandTable } from '@/components/marques/BrandTable'
import { BrandOfferList } from '@/components/marques/BrandOfferList'
import { ComparateurFaq } from '@/components/comparateur/ComparateurFaq'

export const metadata: Metadata = {
  title: 'Comparatif nourriture pour chien',
  description:
    "Franklin, Elmut, Ultra Premium Direct, Dog Chef, Dogfy Diet et Fidelis comparés : prix, type d'aliment, fabrication, livraison et offres de bienvenue.",
  alternates: { canonical: 'https://www.toutou-gourmet.com/comparateur' },
}

// @cdc 04-pages — comparateur V2 (audit design-cro §3) : tableau complet en premier, sans note sur 5,
// puis les offres (un lien par marque), l'origine des données et la FAQ. Rendu serveur.

const H2 = 'm-0 font-display text-2xl font-black leading-tight text-ink md:text-3xl'

export default function ComparateurPage() {
  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-14 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <div className="flex flex-col gap-6">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Marques', href: '/chien/marque' }, { label: 'Comparateur' }]} />
        <header className="flex max-w-prose flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
            Comparatif nourriture pour chien, {brands.length} marques
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            Croquettes, repas frais et menus en bocaux, comparés sur les mêmes points. Mis à jour en novembre 2026.
          </p>
        </header>
      </div>

      <section aria-labelledby="tableau" className="flex flex-col gap-4">
        <h2 id="tableau" className={H2}>Quelle marque coûte combien, et pour quel chien&nbsp;?</h2>
        <BrandTable detailed caption={`Comparatif complet des ${brands.length} marques`} />
        <p className="m-0 text-sm text-ink-2">
          Pas sûr de ton choix&nbsp;?{' '}
          <Link href="/chien/marque" className="font-semibold text-orange-ink underline underline-offset-4">Pars du profil de ton chien</Link>.
        </p>
      </section>

      <section aria-labelledby="offres" className="flex flex-col gap-4">
        <h2 id="offres" className={H2}>Quelles offres de bienvenue en ce moment&nbsp;?</h2>
        <BrandOfferList place="comparateur" />
      </section>

      <section aria-labelledby="sources" className="flex max-w-prose flex-col gap-3">
        <h2 id="sources" className={H2}>D&apos;où viennent ces informations&nbsp;?</h2>
        <p className="m-0 leading-relaxed text-ink-2">
          Prix, compositions et lieux de fabrication viennent des sites des marques, relevés pour nos fiches et nos tests publiés dans la rubrique{' '}
          <Link href="/chien/avis-marques" className="font-semibold text-orange-ink underline underline-offset-4">Avis marques</Link>.
          Les avis clients cités (Trustpilot) sont repris avec leur nombre. On n&apos;attribue pas de note sur 5&nbsp;: une note sans protocole de test ne t&apos;apprendrait rien. Les prix varient selon le gabarit du chien, la recette et les promotions.
        </p>
      </section>

      <ComparateurFaq />
    </div>
  )
}
