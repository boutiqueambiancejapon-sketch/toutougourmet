import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountCard, AccountPage, safeReturnPath } from '@/components/compte/AccountPage'
import { SignUpForm } from '@/components/compte/SignUpForm'
import { getSessionUser } from '@/lib/server/auth'

export const metadata: Metadata = { title: 'Créer un compte' }

export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const returnTo = safeReturnPath((await searchParams).retour)
  if (await getSessionUser()) redirect(returnTo)
  return (
    <AccountPage
      title="Créer ton compte"
      lead={<p>Enregistre le profil de ton chien une fois : poids, âge, activité. Les outils se remplissent tout seuls et tu suis ses pesées.</p>}
    >
      <AccountCard label="Inscription">
        <SignUpForm returnTo={returnTo} />
      </AccountCard>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        Gratuit. Ton e-mail sert à te connecter et à retrouver ton mot de passe, on ne le transmet à personne.
      </p>
    </AccountPage>
  )
}
