import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountCard, AccountPage, safeReturnPath } from '@/components/compte/AccountPage'
import { SignUpBenefits, signUpTitle } from '@/components/compte/SignUpBenefits'
import { SignUpForm } from '@/components/compte/SignUpForm'
import { accountRemindersEnabled } from '@/lib/emails/account-reminders'
import { getSessionUser } from '@/lib/server/auth'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Un compte gratuit garde le profil de ton chien, sa ration, ses pesées et tes scans de croquettes.',
}

export default async function SignUpPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const returnTo = safeReturnPath((await searchParams).retour)
  if (await getSessionUser()) redirect(returnTo)
  return (
    <AccountPage title={signUpTitle(returnTo)} lead={<p>Trois champs, et ton compte est ouvert.</p>} aside={<SignUpBenefits />}>
      <AccountCard label="Inscription">
        <SignUpForm returnTo={returnTo} />
      </AccountCard>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        {accountRemindersEnabled()
          ? 'Ton e-mail sert à te connecter, à retrouver ton mot de passe et à deux rappels au plus si ton compte reste sans chien. On ne le transmet à personne.'
          : 'Ton e-mail sert à te connecter et à retrouver ton mot de passe. On ne le transmet à personne.'}
      </p>
    </AccountPage>
  )
}
