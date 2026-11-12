import { permanentRedirect } from 'next/navigation'

// @cdc affiliation — ancienne adresse de la page des promos (en ligne quelques heures le 2026-11-12), renommée
// « promo croquettes chien » à la demande du propriétaire.
export default function AnciennePromos() {
  permanentRedirect('/promo-croquettes-chien')
}
