import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { EnrollFlow } from '@/components/dashboard/login/EnrollFlow'
import { LoginFrame } from '@/components/dashboard/login/LoginFrame'
import { LOGIN_PATH, SESSION_COOKIE, stageHref } from '@/lib/dashboard/login/policy'
import { hasFactor } from '@/lib/server/dashboard-login/factors'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { readSession } from '@/lib/server/dashboard-login/sessions'

// @cdc tableau de bord — enrôlement. Un mot de passe juste sans aucun facteur enregistré n'ouvre que cet écran.

export const dynamic = 'force-dynamic'

export default async function EnrollPage() {
  if ((await dashboardAuthMode()) !== 'login') notFound()
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) redirect(LOGIN_PATH)
  if (session.stage !== 'enroll') redirect(stageHref(session.stage))
  // Un facteur est apparu depuis le mot de passe : retour à la connexion, qui demandera ce facteur.
  if (await hasFactor()) redirect(LOGIN_PATH)
  return (
    <LoginFrame title="Protège ton tableau de bord" intro="Le mot de passe ne suffit plus : choisis un second facteur. Il sera demandé à chaque connexion." wide>
      <EnrollFlow />
    </LoginFrame>
  )
}
