import type { Metadata } from 'next'
import Link from 'next/link'
import { AccountCard, AccountPage } from '@/components/compte/AccountPage'
import { FormNotice } from '@/components/compte/fields'
import { ResetPasswordForm } from '@/components/compte/ResetPasswordForm'

export const metadata: Metadata = { title: 'Nouveau mot de passe' }

// Better Auth redirige ici depuis le lien de l'e-mail : ?token=… si le lien est bon, ?error=INVALID_TOKEN sinon.
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const token = typeof params.token === 'string' ? params.token : ''
  return (
    <AccountPage title="Nouveau mot de passe">
      {token && !params.error ? (
        <AccountCard label="Nouveau mot de passe">
          <ResetPasswordForm token={token} />
        </AccountCard>
      ) : (
        <FormNotice tone="error">
          Ce lien n&apos;est plus valable.{' '}
          <Link href="/compte/mot-de-passe-oublie" className="font-semibold text-orange-ink underline underline-offset-2">
            Demande un nouveau lien
          </Link>
          .
        </FormNotice>
      )}
    </AccountPage>
  )
}
