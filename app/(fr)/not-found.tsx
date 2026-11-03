import type { Metadata } from 'next'
import { NotFoundFr } from '@/components/layout/NotFoundFr'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: "Cette adresse ne mène à aucune page de Toutou Gourmet. L'accueil et le test mènent aux guides, aux outils et aux marques.",
  robots: { index: false },
}

// 404 des pages françaises qui appellent notFound() : rendue dans le layout (fr).
export default function NotFound() {
  return <NotFoundFr />
}
