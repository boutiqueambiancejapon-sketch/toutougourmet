// @cdc lot 6 — « il y a 12 min », « il y a 3 h », « hier » pour les derniers scans.

export function timeAgo(date: Date, now = new Date()): string {
  const min = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60_000))
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const days = Math.floor(h / 24)
  if (days < 2) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  return `le ${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })}`
}
