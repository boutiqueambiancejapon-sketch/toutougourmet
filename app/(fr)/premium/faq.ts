import { formatEuros, PRICE_CENTS, yearlySaving } from '@/lib/premium/pricing'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'
import type { PremiumMode } from '@/lib/server/membership'

// @cdc premium — questions fréquentes de /premium (affichées et reprises en FAQPage), selon l'offre
// en cours. Les réponses sur le prix, la résiliation et la rétractation suivent les CGV.

export interface FaqEntry {
  question: string
  answer: string
}

const MONTH = formatEuros(PRICE_CENTS.month)
const YEAR = formatEuros(PRICE_CENTS.year)
const saving = yearlySaving()

const COMMON: FaqEntry[] = [
  {
    question: 'Le scan par code-barres compte-t-il dans le quota ?',
    answer: `Non. Un produit déjà connu, retrouvé par son code-barres, s'affiche sans compte et ne compte jamais. Seule l'analyse d'une étiquette par photo entre dans le quota : ${FREE_MONTHLY_SCANS} par mois avec le compte gratuit, ${PREMIUM_MONTHLY_SCANS} avec Premium.`,
  },
  {
    question: 'Les offres du compte sont-elles des liens partenaires ?',
    answer: "Oui. On touche une commission si tu commandes, sans surcoût pour toi. Les marques sont choisies selon le profil de ton chien et nos fiches d'avis, et les remises affichées sont celles en cours chez nos partenaires.",
  },
]

const LAUNCH: FaqEntry[] = [
  {
    question: 'Premium est-il vraiment gratuit ?',
    answer: "Oui, pendant le lancement. Aucune carte bancaire n'est demandée à l'activation, donc rien ne peut être prélevé.",
  },
  {
    question: 'Que se passe-t-il à la fin du lancement ?',
    answer: `Premium passera à ${MONTH} par mois ou ${YEAR} par an. On te prévient par e-mail avant : rien n'est prélevé sans ton accord, et si tu ne t'abonnes pas, ton compte repasse en gratuit avec tes chiens, tes pesées et tes analyses.`,
  },
  {
    question: 'Pourquoi faut-il enregistrer un chien pour activer Premium ?',
    answer: "Les alertes de poids et les offres partent de son profil : âge, poids, activité et stérilisation. Sans chien, Premium n'aurait rien à suivre.",
  },
]

const PAID: FaqEntry[] = [
  {
    question: 'Combien coûte Premium ?',
    answer: `${MONTH} par mois sans engagement, ou ${YEAR} par an, TVA comprise. L'annuel revient à ${formatEuros(saving.perMonthCents)} par mois, soit ${formatEuros(saving.savingCents)} de moins sur un an.`,
  },
  {
    question: 'Comment résilier ?',
    answer: "Depuis les réglages de ton compte, bouton « Gérer mon abonnement ». Premium reste actif jusqu'à la fin de la période déjà payée, puis s'arrête sans autre prélèvement. Tes chiens, tes pesées et tes analyses restent dans ton compte gratuit.",
  },
  {
    question: 'Puis-je changer d’avis après le paiement ?',
    answer: "Premium s'active dès le paiement. Avant de payer, tu demandes cet accès immédiat et tu renonces à ton droit de rétractation de 14 jours, en cochant une case. Les détails et les cas de remboursement sont dans les conditions générales de vente.",
  },
  {
    question: 'Qui encaisse le paiement ?',
    answer: "Stripe, sur sa page sécurisée. Nous ne voyons jamais ton numéro de carte. Les factures arrivent par e-mail et restent consultables depuis ton compte.",
  },
]

const SOON: FaqEntry[] = [
  {
    question: 'Quand pourrai-je passer à Premium ?',
    answer: `Dès l'ouverture du paiement en ligne, depuis ton compte : ${MONTH} par mois sans engagement ou ${YEAR} par an, TVA comprise.`,
  },
]

const DATA: FaqEntry = {
  question: 'Comment récupérer ou supprimer mes données ?',
  answer: 'Depuis les réglages du compte : un bouton télécharge tout en JSON, un autre supprime le compte sur-le-champ. Un abonnement en cours est alors résilié, sans autre prélèvement.',
}

export function premiumFaq(mode: PremiumMode): FaqEntry[] {
  const byMode = mode === 'launch' ? LAUNCH : mode === 'paid' ? PAID : SOON
  return [...byMode, ...COMMON, DATA]
}
