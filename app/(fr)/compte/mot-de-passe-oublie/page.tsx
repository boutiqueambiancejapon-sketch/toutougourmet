import type { Metadata } from 'next'
import { AccountCard, AccountPage } from '@/components/compte/AccountPage'
import { ForgotPasswordForm } from '@/components/compte/ForgotPasswordForm'

export const metadata: Metadata = { title: 'Mot de passe oublié' }

export default function ForgotPasswordPage() {
  return (
    <AccountPage
      title="Mot de passe oublié"
      back={{ href: '/compte/connexion', label: 'Connexion' }}
      lead={<p>Indique l&apos;e-mail de ton compte : on t&apos;envoie un lien pour choisir un nouveau mot de passe.</p>}
    >
      <AccountCard label="Demande de nouveau mot de passe">
        <ForgotPasswordForm />
      </AccountCard>
    </AccountPage>
  )
}
