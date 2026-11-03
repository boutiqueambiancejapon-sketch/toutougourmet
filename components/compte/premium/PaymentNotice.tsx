import { FormNotice } from '../fields'

// @cdc premium — message après un retour des actions de paiement (?paiement=… sur /compte/reglages).

const MESSAGES: Record<string, string> = {
  renonciation: "Coche la case d'accès immédiat pour continuer : sans elle, l'abonnement ne peut pas démarrer.",
  indisponible: 'Le paiement en ligne n’est pas encore ouvert. Réessaie dans quelques jours.',
  adresse: 'Confirme d’abord ton adresse e-mail avec le lien reçu à l’inscription.',
  deja: 'Ton abonnement Premium est déjà actif : tu le gères depuis cette page.',
  'sans-abonnement': 'Aucun abonnement Stripe n’est rattaché à ton compte.',
  erreur: 'Stripe n’a pas répondu. Rien n’a été prélevé : réessaie dans un instant.',
}

export function PaymentNotice({ code }: { code?: string }) {
  const text = code ? MESSAGES[code] : undefined
  if (!text) return null
  return <FormNotice tone={code === 'deja' ? 'info' : 'error'}>{text}</FormNotice>
}
