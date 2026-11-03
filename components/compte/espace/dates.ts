// @cdc compte — dates courtes de l'espace compte (« 3 nov. »), à partir d'une date ISO AAAA-MM-JJ.
export function shortDateFr(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })
}
