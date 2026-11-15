import type { Metadata } from 'next'
import { BfPillar } from '@/components/black-friday/BfPillar'

// @cdc affiliation — pilier Black Friday nourriture pour chien (data/black-friday.ts), pages filles par marque.

export const metadata: Metadata = {
  title: { absolute: 'Black Friday croquettes chien 2026 : offres et pièges' },
  description: 'Black Friday 2026 croquettes et nourriture pour chien : les remises de Dog Chef, Dogfy Diet, Elmut, Franklin, Ultra Premium Direct et Maxi Zoo, et comment juger une promo.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/black-friday-croquettes-chien' },
}

export default function BlackFridayPage() {
  return <BfPillar />
}
