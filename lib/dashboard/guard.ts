import { cookies, headers } from 'next/headers'
import { SESSION_COOKIE } from '@/lib/dashboard/login/policy'
import { dashboardAuthMode } from '@/lib/server/dashboard-login/mode'
import { readSession, type DashboardSession } from '@/lib/server/dashboard-login/sessions'
import { dashboardCredentials, isAuthorized, requestFromSameHost } from './auth'

// @cdc tableau de bord — défense en profondeur. proxy.ts filtre l'accès, mais Next 16.1.6 a eu des
// contournements connus du proxy (GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f) : chaque page, route et
// action du tableau de bord revérifie donc elle-même, selon le mode en place (mode.ts).

/** Session complète de la requête en cours, ou null. */
export async function dashboardSession(): Promise<DashboardSession | null> {
  if ((await dashboardAuthMode()) !== 'login') return null
  const session = await readSession((await cookies()).get(SESSION_COOKIE)?.value)
  return session?.stage === 'full' ? session : null
}

/** Vrai si la requête en cours porte une session complète, ou les identifiants Basic avant la bascule. */
export async function dashboardAllowed(): Promise<boolean> {
  const expected = dashboardCredentials()
  if (!expected) return false
  const mode = await dashboardAuthMode()
  if (mode === 'basic') return isAuthorized((await headers()).get('authorization'), expected)
  try {
    return mode === 'login' && (await dashboardSession()) !== null
  } catch (err) {
    console.error('[dashboard-login] session illisible', err instanceof Error ? err.message : err)
    return false
  }
}

/**
 * Pour les actions serveur : accès exigé ET origine identique à l'hôte. Next 16.1.6 a laissé passer
 * une origine « null » (GHSA-mq59-m269-xvcx) : on refuse toute action sans Origin du même hôte.
 */
export async function assertDashboardAction(): Promise<void> {
  if (!requestFromSameHost(await headers()) || !(await dashboardAllowed())) throw new Error('Non autorisé')
}
