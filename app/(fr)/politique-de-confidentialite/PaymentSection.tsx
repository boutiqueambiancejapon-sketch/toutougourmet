// @cdc premium — section « Paiement de Premium » de la politique de confidentialité : Stripe,
// sous-traitant de paiement, et ce que notre base garde de l'abonnement (db/schema/membership.ts).

export function PaymentSection() {
  return (
    <section id="paiement">
      <h2 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">Paiement de Premium</h2>
      <p className="mb-2">
        Si tu t&apos;abonnes à Premium, le paiement passe par Stripe (Stripe Payments Europe, Ltd., Irlande), notre
        sous-traitant de paiement. Tu saisis ta carte sur la page sécurisée de Stripe : nous ne voyons jamais son
        numéro. Stripe reçoit ton adresse email, ton prénom, ton adresse de facturation (pour la TVA) et les données
        de paiement, et les garde selon ses propres obligations légales, notamment comptables et de lutte contre la
        fraude. Certaines données peuvent être traitées hors de l&apos;Union européenne, dans le cadre du Data Privacy
        Framework UE–États-Unis et des clauses contractuelles types.
      </p>
      <p>
        Dans notre base, nous gardons seulement les identifiants Stripe de ton abonnement, sa formule (mois ou année),
        son état, sa date d&apos;échéance et la date où tu as demandé l&apos;accès immédiat. Les factures restent chez
        Stripe, comme la loi l&apos;impose, même après la suppression de ton compte.
      </p>
    </section>
  )
}
