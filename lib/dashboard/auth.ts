// @cdc tableau de bord — accès réservé au propriétaire (authentification HTTP Basic).
// Identifiants dans DASHBOARD_USER / DASHBOARD_PASSWORD (/srv/toutou/shared/.env), jamais dans le code.
// Sans ces deux variables, la route n'existe pas (404).

export interface DashboardCredentials {
  user: string
  password: string
}

export function dashboardCredentials(): DashboardCredentials | null {
  const user = process.env.DASHBOARD_USER
  const password = process.env.DASHBOARD_PASSWORD
  return user && password ? { user, password } : null
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
}

/** Comparaison en temps constant : on compare les empreintes SHA-256, de longueur fixe, octet par octet. */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([digest(a), digest(b)])
  let diff = 0
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i]
  return diff === 0
}

/** Vérifie l'en-tête Authorization: Basic … contre les identifiants attendus. */
export async function isAuthorized(header: string | null, expected: DashboardCredentials): Promise<boolean> {
  const match = /^Basic\s+([A-Za-z0-9+/=]+)$/i.exec(header ?? '')
  let decoded = ''
  if (match) {
    try {
      decoded = new TextDecoder().decode(Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0)))
    } catch {
      decoded = ''
    }
  }
  const sep = decoded.indexOf(':')
  const user = sep >= 0 ? decoded.slice(0, sep) : ''
  const password = sep >= 0 ? decoded.slice(sep + 1) : ''
  // Les deux comparaisons tournent toujours, pour ne pas révéler laquelle a échoué.
  const [okUser, okPassword] = await Promise.all([safeEqual(user, expected.user), safeEqual(password, expected.password)])
  return match !== null && okUser && okPassword
}
