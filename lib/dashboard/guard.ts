import { headers } from 'next/headers'
import { dashboardCredentials, isAuthorized } from './auth'

// @cdc tableau de bord — défense en profondeur. proxy.ts demande l'authentification, mais Next
// 16.1.6 a des contournements connus du proxy (GHSA-492v-c6pp-mqqv, GHSA-267c-6grr-h53f) : chaque
// page, route et action du tableau de bord revérifie donc l'en-tête Authorization elle-même.

/** Vrai si la requête en cours porte les identifiants du tableau de bord. */
export async function dashboardAllowed(): Promise<boolean> {
  const expected = dashboardCredentials()
  if (!expected) return false
  return isAuthorized((await headers()).get('authorization'), expected)
}

/**
 * Pour les actions serveur : identifiants exigés ET origine identique à l'hôte. Le navigateur
 * renvoie l'authentification HTTP Basic même depuis un autre site, et Next 16.1.6 laisse passer
 * une origine « null » (GHSA-mq59-m269-xvcx) : on refuse toute action sans Origin du même hôte.
 */
export async function assertDashboardAction(): Promise<void> {
  const h = await headers()
  const origin = h.get('origin')
  const host = h.get('x-forwarded-host') ?? h.get('host')
  let sameHost = false
  try {
    sameHost = Boolean(origin && host && new URL(origin).host === host)
  } catch {
    sameHost = false
  }
  if (!sameHost || !(await dashboardAllowed())) throw new Error('Non autorisé')
}
