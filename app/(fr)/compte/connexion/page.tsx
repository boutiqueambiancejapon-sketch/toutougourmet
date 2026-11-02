import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AccountCard, AccountPage, safeReturnPath } from '@/components/compte/AccountPage'
import { FormNotice } from '@/components/compte/fields'
import { SignInForm } from '@/components/compte/SignInForm'
import { getSessionUser } from '@/lib/server/auth'

export const metadata: Metadata = { title: 'Se connecter' }

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const returnTo = safeReturnPath(params.retour)
  if (await getSessionUser()) redirect(returnTo)
  const tokenError = params.error === 'INVALID_TOKEN' || params.error === 'TOKEN_EXPIRED'
  return (
    <AccountPage title="Se connecter">
      {params.deconnecte ? <FormNotice tone="info">Tu es déconnecté. À bientôt.</FormNotice> : null}
      {tokenError ? (
        <FormNotice tone="error">Ce lien de confirmation n&apos;est plus valable. Connecte-toi : un nouveau lien partira par e-mail.</FormNotice>
      ) : null}
      <AccountCard label="Connexion">
        <SignInForm returnTo={returnTo} />
      </AccountCard>
    </AccountPage>
  )
}
