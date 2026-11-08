import { fold } from '@/lib/scanner/rankings'

// @cdc seo — page mère de chaque marque : elle vise « avis {marque} », les fiches visent le nom exact du produit.
// Liste du glossaire de /chien/marque. Une marque y entre quand sa page existe. `noms` : ses écritures en base.

export interface MarquePage {
  nom: string
  href: string
  noms?: string[]
}

const avis = (slug: string) => `/chien/avis-marques/${slug}`

export const MARQUE_PAGES: MarquePage[] = [
  { nom: 'Acana', href: avis('avis-acana') },
  { nom: 'Atavik', href: avis('avis-atavik') },
  { nom: 'Belcando', href: avis('avis-belcando') },
  { nom: 'Buddy Pet Foods', href: avis('avis-buddy-pet-foods') },
  { nom: 'Butternut Box', href: avis('avis-butternut-box') },
  { nom: 'Dog Chef', href: '/chien/marque/dog-chef' },
  { nom: 'Dogfy Diet', href: avis('avis-dogfy-diet-repas-frais-chien') },
  { nom: 'Edgard & Cooper', href: avis('avis-edgard-cooper') },
  { nom: 'Elmut', href: '/chien/marque/elmut' },
  { nom: 'Farmina N&D', href: avis('avis-farmina-nd'), noms: ['Farmina'] },
  { nom: 'Fidelis', href: '/chien/marque/fidelis' },
  { nom: 'Franklin', href: '/chien/marque/franklin', noms: ['Franklin Pet Food'] },
  { nom: 'Happy Dog', href: avis('avis-happy-dog') },
  { nom: "Hill's Science Diet", href: avis('avis-hills-science-diet'), noms: ['Hills', "Hill's"] },
  { nom: 'Japhy', href: avis('avis-japhy') },
  { nom: 'Just Russel', href: avis('avis-just-russel') },
  { nom: 'Orijen', href: avis('avis-orijen') },
  { nom: 'Orlando (Lidl)', href: avis('avis-croquettes-orlando-lidl'), noms: ['Orlando'] },
  { nom: 'Premiere', href: avis('avis-premiere') },
  { nom: 'Purina Pro Plan', href: avis('avis-purina-pro-plan'), noms: ['Pro Plan', 'Purina'] },
  { nom: 'Real Nature', href: avis('avis-real-nature') },
  { nom: 'Royal Canin', href: avis('avis-royal-canin') },
  { nom: 'Select Gold', href: avis('avis-select-gold') },
  { nom: 'Taste of the Wild', href: avis('avis-taste-of-the-wild') },
  { nom: 'Ultra Premium Direct', href: '/chien/marque/ultra-premium-direct' },
  { nom: 'Wolfsblut', href: avis('avis-wolfsblut') },
]

export function marquePage(brand: string | null): MarquePage | undefined {
  if (!brand) return undefined
  const b = fold(brand)
  return MARQUE_PAGES.find((m) => fold(m.nom) === b || m.noms?.some((n) => fold(n) === b))
}
