// @cdc tableau de bord — nom français d'un pays à partir de son code ISO (« FR · France »).
// Pas de drapeau (pas d'emoji). Code vide ou absent : « Inconnu ».

const names = new Intl.DisplayNames(['fr'], { type: 'region' })

export function countryName(code: string | null | undefined): string {
  const c = code?.trim().toUpperCase()
  if (!c || !/^[A-Z]{2}$/.test(c)) return 'Inconnu'
  let name: string | undefined
  try {
    name = names.of(c)
  } catch {
    name = undefined
  }
  return name && name !== c ? `${c} · ${name}` : c
}
