import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { FactorChoice } from '@/components/dashboard/login/FactorChoice'
import { LoginFrame } from '@/components/dashboard/login/LoginFrame'
import { LOGIN_PATH, safeNext, SESSION_COOKIE, stageHref } from '@/lib/dashboard/login/policy'
import { factorsSummary } from '@/lib/server/dashboard-login/factors'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { readSession } from '@/lib/server/dashboard-login/sessions'

// @cdc tableau de bord — second facteur, seulement après un mot de passe juste.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ suivant?: string | string[] }>
}

export default async function VerificationPage({ searchParams }: PageProps) {
  if ((await dashboardAuthMode()) !== 'login') notFound()
  const next = safeNext((await searchParams).suivant)
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) redirect(LOGIN_PATH)
  if (session.stage !== 'second_factor') redirect(stageHref(session.stage, next))
  const factors = await factorsSummary()
  return (
    <LoginFrame title="Vérification" intro="Deuxième étape de la connexion.">
      <FactorChoice hasPasskey={factors.passkeys > 0} hasTotp={factors.totp} next={next} />
    </LoginFrame>
  )
}
