import { openPortalAction } from '@/app/(fr)/compte/premium-actions'
import { SubmitButton } from '../fields'

// @cdc premium — bouton vers le portail client Stripe (carte, factures, résiliation).
export function ManageForm({ label = 'Gérer mon abonnement' }: { label?: string }) {
  return (
    <form action={openPortalAction} className="flex flex-col sm:self-start">
      <SubmitButton pendingLabel="Ouverture…">{label}</SubmitButton>
    </form>
  )
}
