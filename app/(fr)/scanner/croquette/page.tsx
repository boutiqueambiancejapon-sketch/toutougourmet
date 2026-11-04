import type { Metadata } from 'next'
import { CategoryView, type Category } from '@/components/scanner/lists/CategoryView'
import { LIST_ROBOTS } from '@/lib/scanner/fiche-lists'

// @cdc scanner — croquettes et pâtées : consultation hors Google, hors sitemap, sans bouton de scan.

const CATEGORY: Category = { kind: 'complete', path: '/scanner/croquette', title: 'Croquettes et pâtées', method: '/scanner#methode' }

export const metadata: Metadata = {
  title: { absolute: 'Croquettes et pâtées notées par le scanner' },
  description: 'Dernières fiches, top 10 et moins bien notées parmi les croquettes et pâtées analysées par le scanner.',
  robots: LIST_ROBOTS,
}

export default async function CroquetteListPage({ searchParams }: { searchParams: Promise<{ vue?: string | string[]; categorie?: string | string[] }> }) {
  const { vue, categorie } = await searchParams
  return <CategoryView category={CATEGORY} vueParam={vue} categoryParam={categorie} />
}
