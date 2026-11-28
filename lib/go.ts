// @cdc affiliation — liens partenaires protégés (propriétaire, 28/11/2026) : aucun lien affilié en clair dans les pages.
// Chaque bouton partenaire pointe vers /go/<jeton> sur notre domaine ; la route app/go/[t] filtre les robots et les rafales
// de clics avant de renvoyer chez le marchand (les attaques de clics de concurrents font chuter l'EPC et peuvent faire sauter
// un partenariat). Seuls les domaines partenaires passent : pas de redirection ouverte. Fonctions pures, sans secret.
const PARTNERS = /^(www\.)?(awin1\.com|amazon\.fr|amzn\.to|dogchef\.com|c3po\.link|tidd\.ly|ultrapremiumdirect\.com|maxizoo\.fr|elmut\.fr|[a-z0-9-]*franklin[a-z0-9-]*\.[a-z.]+|[a-z0-9-]*dogfy[a-z0-9-]*\.[a-z.]+|[a-z0-9-]*linkavista[a-z0-9-]*\.[a-z.]+)$/i

export function isPartner(url: string): boolean {
  try {
    const u = new URL(url)
    return (u.protocol === 'https:' || u.protocol === 'http:') && PARTNERS.test(u.hostname)
  } catch {
    return false
  }
}

/** base64url sans Buffer : utilisable aussi dans les composants client (btoa existe dans Node et le navigateur). */
function b64url(s: string): string {
  let bin = ''
  for (const b of new TextEncoder().encode(s)) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Lien affiché dans la page : /go/<jeton> pour un partenaire, l'adresse telle quelle sinon. */
export function toGo(url: string | null | undefined): string {
  if (!url) return ''
  return isPartner(url) ? `/go/${b64url(url)}` : url
}

/** Adresse du marchand derrière un jeton, ou null si le jeton est invalide ou hors des partenaires. */
export function fromGo(token: string): string | null {
  if (!/^[A-Za-z0-9_-]{8,2000}$/.test(token)) return null
  const url = Buffer.from(token, 'base64url').toString('utf8')
  return isPartner(url) ? url : null
}
