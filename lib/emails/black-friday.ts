import { BREVO_UNSUBSCRIBE_TAG } from './monthly'
import { getBrandBySlug } from '@/data/brands'
import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/lib/account-offers'
import { button, heading, label, paragraph, renderEmail, smallPrint, type EmailBlock, type RenderedEmail } from './layout'

// @cdc e-mails — Black Friday 2026 (texte validé par le propriétaire le 2026-11-16). Remises tirées de
// data/partner-discounts.ts via offerCard. Aucune offre spéciale annoncée : Dog Chef et Franklin n'avaient
// rien publié pour le Black Friday au 16/11 ; mettre la carte à jour si une vraie offre sort avant l'envoi.
// Cet e-mail tient lieu de lettre de décembre (« une lettre par mois, pas plus »).

export const BLACK_FRIDAY_SUBJECT = 'Black Friday : essaie les repas frais ou les croquettes sans céréales à −30 %'
export const BLACK_FRIDAY_PREVIEW = 'Deux offres d’essai sans engagement, pour voir ce que ton chien en pense.'

/** Remise (data/partner-discounts.ts) et bouton partenaire, sans les arguments de la fiche marque. */
function offre(slug: OfferSlug): EmailBlock[] {
  const brand = getBrandBySlug(slug)
  const discount = CONFIRMED_DISCOUNTS[slug]
  if (!brand) return []
  return [...(discount ? [label(discount)] : []), button(`Essayer ${brand.name}`, brand.affiliateUrl, 'sponsored nofollow')]
}

export function buildBlackFridayEmail(unsubscribeUrl = BREVO_UNSUBSCRIBE_TAG): RenderedEmail {
  const cards = (['dog-chef', 'franklin'] as const).map(offre)
  return renderEmail({
    subject: BLACK_FRIDAY_SUBJECT,
    preheader: BLACK_FRIDAY_PREVIEW,
    kicker: 'Black Friday',
    blocks: [
      heading('Deux façons d’essayer une autre gamelle', 1),
      paragraph(
        'Pendant le Black Friday, beaucoup de maîtres refont le stock de croquettes. Si tu te demandes depuis un moment ce que donnerait une autre gamelle, tu peux essayer sans tout changer d’un coup.',
      ),
      heading('Les repas frais Dog Chef'),
      paragraph(
        'Des plats cuisinés et livrés frais, avec une portion calculée d’après le poids de ton chien et son poids cible. La box d’essai couvre 14 jours.',
      ),
      ...cards[0],
      heading('Les croquettes Franklin'),
      paragraph('Des croquettes sans céréales, pensées pour les chiens au ventre ou à la peau sensibles. L’abonnement est sans engagement.'),
      ...cards[1],
      heading('Avant de changer de gamelle'),
      paragraph(
        'Fais la transition sur une semaine : un quart de nouvel aliment les deux premiers jours, la moitié les deux suivants, trois quarts ensuite, puis le nouvel aliment seul. L’estomac de ton chien s’habitue sans dérapage.',
      ),
      paragraph('À bientôt,\nL’équipe Toutou Gourmet'),
      smallPrint(
        'Ces liens sont des liens partenaires : si tu commandes, Toutou Gourmet touche une commission, sans changer ton prix. Nos notes ne bougent pas pour autant.',
      ),
    ],
    unsubscribeUrl,
    reason:
      "Tu reçois cette lettre parce que tu t'es inscrit sur toutou-gourmet.com. Elle remplace la lettre de décembre : toujours un e-mail par mois, pas plus.",
  })
}
