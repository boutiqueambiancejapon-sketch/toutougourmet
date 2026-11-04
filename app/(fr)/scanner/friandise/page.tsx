import type { Metadata } from 'next'
import { CategoryView, type Category } from '@/components/scanner/lists/CategoryView'
import { LIST_ROBOTS } from '@/lib/scanner/fiche-lists'

// @cdc scanner — friandises : consultation hors Google, hors sitemap, sans bouton de scan.

const CATEGORY: Category = { kind: 'treat', path: '/scanner/friandise', title: 'Friandises', method: '/scanner#methode-friandises' }

export const metadata: Metadata = {
  title: { absolute: 'Friandises notées par le scanner' },
  description: 'Dernières fiches, top 10 et moins bien notées parmi les friandises pour chien analysées par le scanner.',
  robots: LIST_ROBOTS,
}

export default async function FriandiseListPage({ searchParams }: { searchParams: Promise<{ vue?: string | string[] }> }) {
  const { vue } = await searchParams
  return <CategoryView category={CATEGORY} vueParam={vue} />
}
