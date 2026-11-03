import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatEuros, PRICE_CENTS } from '@/lib/premium/pricing'

// @cdc premium — CGV, première partie : vendeur, service, prix, commande, durée, résiliation.
// Les champs « [À compléter] » attendent les informations de l'entreprise belge (propriétaire).

export interface CgvSection {
  id: string
  title: string
  body: ReactNode
}

const MONTH = formatEuros(PRICE_CENTS.month)
const YEAR = formatEuros(PRICE_CENTS.year)
const link = 'font-semibold text-[var(--accent-1)] underline'

export const SALE_SECTIONS: CgvSection[] = [
  {
    id: 'vendeur',
    title: '1. Qui vend Premium',
    body: (
      <>
        <p className="mb-2">Premium est vendu par :</p>
        <p>
          <strong className="text-[var(--text-primary)]">[À compléter : dénomination de l&apos;entreprise et forme juridique]</strong>
          <br />
          Siège : [À compléter : adresse en Belgique]
          <br />
          Numéro d&apos;entreprise (BCE) : [À compléter]
          <br />
          Numéro de TVA : [À compléter : BE…]
          <br />
          Contact : par le{' '}
          <Link href="/contact" className={link}>
            formulaire de contact
          </Link>{' '}
          ou à contact@toutou-gourmet.com
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: '2. Le service',
    body: (
      <p>
        Premium est un abonnement au compte Toutou Gourmet. Il ajoute au compte gratuit les fonctions décrites sur la{' '}
        <Link href="/premium" className={link}>
          page Premium
        </Link>{' '}
        au jour de la commande : davantage d&apos;analyses d&apos;étiquette par photo chaque mois, l&apos;alerte de variation de
        poids et l&apos;historique complet des analyses. Le service est fourni en ligne, dès le paiement accepté. Les
        informations du site ne remplacent pas l&apos;avis d&apos;un vétérinaire.
      </p>
    ),
  },
  {
    id: 'prix',
    title: '3. Prix',
    body: (
      <>
        <p className="mb-2">
          Deux formules : {MONTH} par mois, ou {YEAR} par an. Les prix sont en euros, toutes taxes comprises (TVA
          incluse). La TVA est calculée selon ton pays de résidence et figure sur la facture.
        </p>
        <p>
          Si un prix change, tu es prévenu par e-mail au moins 30 jours avant. Le nouveau prix s&apos;applique à
          l&apos;échéance suivante ; d&apos;ici là, tu peux résilier sans frais.
        </p>
      </>
    ),
  },
  {
    id: 'commande',
    title: '4. Commande et paiement',
    body: (
      <>
        <p className="mb-2">
          La commande se fait depuis un compte Toutou Gourmet dont l&apos;adresse e-mail est confirmée. Tu choisis la
          formule, tu coches la case d&apos;accès immédiat (article 7), puis tu paies sur la page sécurisée de Stripe,
          notre prestataire de paiement. Nous ne voyons jamais ton numéro de carte.
        </p>
        <p>
          Le premier paiement a lieu à la commande, les suivants à chaque échéance, sur le même moyen de paiement.
          La facture arrive par e-mail ; toutes les factures restent consultables depuis les réglages du compte.
        </p>
      </>
    ),
  },
  {
    id: 'duree',
    title: '5. Durée et reconduction',
    body: (
      <p>
        La formule mensuelle dure un mois, la formule annuelle un an. Chacune se renouvelle automatiquement pour la même
        durée tant que tu ne la résilies pas. Pour la formule annuelle, un e-mail te rappelle la date de renouvellement
        et ton droit de résilier avant chaque échéance.
      </p>
    ),
  },
  {
    id: 'resiliation',
    title: '6. Résiliation',
    body: (
      <p>
        Tu résilies à tout moment depuis les réglages du compte, bouton « Gérer mon abonnement ». Premium reste actif
        jusqu&apos;à la fin de la période déjà payée, puis s&apos;arrête sans autre prélèvement. La période entamée
        n&apos;est pas remboursée, sauf dans les cas de l&apos;article 8. Supprimer ton compte résilie
        l&apos;abonnement immédiatement. Nous pouvons résilier un abonnement en cas de fraude ou d&apos;usage contraire
        à la loi, après t&apos;avoir prévenu par e-mail.
      </p>
    ),
  },
]
