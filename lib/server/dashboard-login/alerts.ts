import { DASHBOARD_URL, sendNtfy } from '@/lib/server/alerts/notify'
import { failuresDeserveAlert } from '@/lib/dashboard/login/policy'
import { recentFailures } from './attempts'

// @cdc tableau de bord — alertes de connexion : jamais d'identifiant, d'adresse IP ni de code dans
// le message. Sans NTFY_TOPIC, ou ntfy en panne, la connexion continue : on note juste l'erreur.

const CLICK = `${DASHBOARD_URL}/securite`

function send(message: string): void {
  if (!process.env.NTFY_TOPIC) return
  sendNtfy({ title: 'Toutou Gourmet : sécurité', message, priority: 4, tags: ['lock'], click: CLICK }).catch((err: unknown) => {
    console.error('[dashboard-login] alerte non envoyée', err instanceof Error ? err.message : err)
  })
}

export function alertNewDevice(label: string): void {
  send(`Connexion au tableau de bord depuis un nouvel appareil (${label}).`)
}

export function alertFactorChange(change: string): void {
  send(`Tableau de bord : ${change}.`)
}

/** Une alerte au 5e échec en 30 minutes, puis tous les 20 échecs tant que ça dure. */
export async function alertIfFailureSeries(): Promise<void> {
  const failures = await recentFailures()
  if (failuresDeserveAlert(failures)) send(`${failures} essais de connexion refusés au tableau de bord en 30 minutes.`)
}
