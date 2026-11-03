import type { Metadata } from 'next'
import { PROMO_HUB_PATH } from '@/data/promo-codes'
import { PromoHub } from '@/components/promo/PromoHub'
import { frTypo } from '@/lib/utils'

// @cdc affiliation — hub /codes-promo : les offres confirmées des partenaires (data/promo-codes.ts).

const TITLE = 'Codes promo croquettes et repas frais pour chien'
const DESCRIPTION =
  "Codes promo pour chien vérifiés : Dog Chef WZU7090 −30 %, Dogfy Diet −50 %, Elmut −40 %, Franklin −30 %, Ultra Premium Direct −20 %. Mode d'emploi."

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: frTypo(DESCRIPTION),
  alternates: { canonical: `https://www.toutou-gourmet.com${PROMO_HUB_PATH}` },
}

export default function CodesPromoHubPage() {
  return <PromoHub />
}
