import type { Metadata } from 'next'
import Link from 'next/link'
import { getDuelPairs } from '@/data/brands'
import { getComparatif } from '@/lib/mdx'
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav'
import { IconChevron } from '@/components/icons'

export const metadata: Metadata = {
  title: 'Comparatif croquettes pour chien',
  description:
    'Dog Chef vs Elmut, Franklin vs Ultra Premium Direct : tous nos comparatifs marque contre marque, avec prix, fabrication et verdict.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/chien/marque/comparatif' },
}

// @cdc 04-pages — index des duels V2 : lignes compactes, mention « article détaillé » en texte.

export default function ComparatifHubPage() {
  const comparisons = getDuelPairs().map(([a, b]) => {
    const slug = `${a.slug}-vs-${b.slug}`
    return { slug, label: `${a.name} vs ${b.name}`, editorial: Boolean(getComparatif(slug)) }
  })

  return (
    <div className="v2 mx-auto flex max-w-page flex-col gap-10 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <div className="flex flex-col gap-6">
        <BreadcrumbNav items={[{ label: 'Accueil', href: '/' }, { label: 'Guides', href: '/chien' }, { label: 'Marques', href: '/chien/marque' }, { label: 'Comparatifs' }]} />
        <header className="flex max-w-prose flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(1.9rem,3.6vw,2.6rem)] font-black leading-[1.08] tracking-tight text-ink">
            Comparatifs de marques, deux par deux
          </h1>
          <p className="m-0 text-lg leading-relaxed text-ink-2">
            Chaque comparatif met deux marques face à face sur les mêmes points&nbsp;: prix, type d&apos;aliment, fabrication, livraison et le chien auquel elles conviennent.
          </p>
        </header>
      </div>

      <ul role="list" className="m-0 grid list-none grid-cols-1 gap-x-8 border-t border-line p-0 md:grid-cols-2">
        {comparisons.map(({ slug, label, editorial }) => (
          <li key={slug} className="border-b border-line">
            <Link href={`/chien/marque/${slug}`} className="group flex min-h-16 items-center gap-3 py-3 text-ink no-underline">
              <span className="flex grow flex-col">
                <span className="font-semibold group-hover:underline">{label}</span>
                <span className="text-sm text-ink-2">{editorial ? 'Article détaillé' : 'Tableau des faits et choix selon ton chien'}</span>
              </span>
              <IconChevron className="size-4 text-ink-2" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="m-0 text-ink-2">
        Tu préfères partir de ton chien&nbsp;?{' '}
        <Link href="/chien/marque" className="font-semibold text-orange-ink underline underline-offset-4">Choisis la marque selon son profil</Link>.
      </p>
    </div>
  )
}
