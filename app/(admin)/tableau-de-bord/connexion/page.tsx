import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { FaceIdFirst } from '@/components/dashboard/login/FaceIdFirst'
import { LoginFrame } from '@/components/dashboard/login/LoginFrame'
import { PasswordForm } from '@/components/dashboard/login/PasswordForm'
import { safeNext, SESSION_COOKIE, stageHref } from '@/lib/dashboard/login/policy'
import { listPasskeys } from '@/lib/server/dashboard-login/factors'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { readSession } from '@/lib/server/dashboard-login/sessions'

// @cdc tableau de bord — page de connexion. N'existe pas tant que l'authentification Basic reste active.

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ suivant?: string | string[] }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  if ((await dashboardAuthMode()) !== 'login') notFound()
  const next = safeNext((await searchParams).suivant)
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value)
  if (session) redirect(stageHref(session.stage, next))
  const hasPasskey = (await listPasskeys()).length > 0
  return (
    <LoginFrame title="Connexion" intro="Tableau de bord réservé au propriétaire.">
      {hasPasskey ? <FaceIdFirst next={next} /> : null}
      <PasswordForm next={next} />
    </LoginFrame>
  )
}
