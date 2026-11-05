// @cdc seo — Fiche produit : ouverte à Google si elle est dans data/fiches-indexees.json, sinon noindex. Le contenu est dans components/scanner/fiche/FicheView.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FicheView } from '@/components/scanner/fiche/FicheView'
import { ficheDeLAdresse, ficheMetadata } from '@/lib/server/fiche-route'

export const revalidate = 300

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams(): { slug: string }[] {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  return ficheMetadata(await ficheDeLAdresse('croquettes', (await params).slug))
}

export default async function FichePage({ params }: Params) {
  const fiche = await ficheDeLAdresse('croquettes', (await params).slug)
  if (!fiche) notFound()
  return <FicheView row={fiche.row} indexee={fiche.indexee} path={fiche.path} />
}
