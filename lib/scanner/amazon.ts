// @cdc scanner — même produit chez Amazon : choix de la bonne fiche dans les résultats de recherche de l'API Creators.
// Fonctions pures. Le prix Amazon s'affiche à côté de Maxi Zoo, jamais dans la note.

export interface AmazonItem {
  asin: string
  titre: string
  prix: number | null
  dispo: boolean
}

export interface AmazonChoix extends AmazonItem {
  poidsKg: number | null
  prixKg: number | null
}

const norm = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' ').replace(/[^a-z0-9.,]+/g, ' ').replace(/\s+/g, ' ').trim()

/** Mots du nom à retrouver dans le titre Amazon (sans les mots vides ni les poids). */
const STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'au', 'aux', 'a', 'et', 'pour', 'chien', 'chiens', 'croquettes', 'patee', 'patees', 'en', 'avec', 'sans'])
export function motsCles(nom: string): string[] {
  return [...new Set(norm(nom).split(' ').filter((m) => m.length > 1 && !STOP.has(m) && !/^\d+([.,]\d+)?(kg|g)?$/.test(m)))]
}

/** Poids total d'un titre : « 12 kg », « 2 x 12 kg », « 6 x 400 g », « 1,5kg ». null si absent ou ambigu. */
export function poidsKg(titre: string): number | null {
  const t = norm(titre)
  const multi = /(\d+)\s*x\s*(\d+(?:[.,]\d+)?)\s*(kg|g)\b/.exec(t)
  if (multi) {
    const n = Number(multi[1]), v = Number(multi[2].replace(',', '.'))
    const kg = multi[3] === 'kg' ? v : v / 1000
    return n > 0 && n <= 48 ? Math.round(n * kg * 1000) / 1000 : null
  }
  // Lot sans multiplicateur lisible (« lot de », « pack », « 12 sachets »…) : poids total inconnu.
  if (/\b(lot|lots|pack|packs|paquets|boites|sachets|barquettes|bouchees|sticks|pieces)\b|\b\d+\s*(sachets|barquettes|boites|sticks|pieces|unites)\b/.test(t)) return null
  const all = [...t.matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b/g)].map((m) => (m[2] === 'kg' ? Number(m[1].replace(',', '.')) : Number(m[1].replace(',', '.')) / 1000))
  const uniq = [...new Set(all.filter((x) => x > 0))]
  return uniq.length === 1 ? Math.round(uniq[0] * 1000) / 1000 : null
}

/**
 * Fiche Amazon du produit : marque dans le titre, au moins 70 % des mots du nom, disponible, prix connu.
 * Parmi celles-ci : même poids que le sac Maxi Zoo (± 5 %) d'abord ; sinon celle qui couvre le plus de mots, puis la plus chère
 * (décision du propriétaire du 2026-11-28 : en cas de doute, la plus chère).
 */
export function choisir(items: AmazonItem[], marque: string, produit: string, poidsMaxiZoo: number | null): AmazonChoix | null {
  const m = norm(marque)
  const mots = motsCles(produit).filter((x) => !norm(marque).split(' ').includes(x))
  const ok = items
    .filter((i) => i.dispo && i.prix !== null && norm(i.titre).includes(m))
    .map((i) => {
      const t = ` ${norm(i.titre)} `
      const vus = mots.filter((x) => t.includes(` ${x} `)).length
      const kg = poidsKg(i.titre)
      const pk = kg ? Math.round(((i.prix as number) / kg) * 100) / 100 : null
      // Prix au kilo invraisemblable pour un aliment (lecture du poids douteuse) : on ne l'affiche pas.
      const sur = pk !== null && pk >= 0.5 && pk <= 80
      return { ...i, poidsKg: sur ? kg : null, prixKg: sur ? pk : null, part: mots.length ? vus / mots.length : 1 }
    })
    .filter((i) => i.part >= 0.7)
  if (!ok.length) return null
  const meme = poidsMaxiZoo ? ok.filter((i) => i.poidsKg !== null && Math.abs(i.poidsKg - poidsMaxiZoo) / poidsMaxiZoo <= 0.05) : []
  const pool = meme.length ? meme : ok
  pool.sort((a, b) => b.part - a.part || (b.prix as number) - (a.prix as number))
  const best: AmazonChoix & { part?: number } = { ...pool[0] }
  delete best.part
  return best
}

/** « Prix le plus bas » : seulement pour deux sacs de même poids (± 5 %) dont les prix au kilo sont connus et diffèrent d'au moins 1 %.
 *  Comparer un sac de 3 kg à un sac de 14 kg ne serait pas honnête : pas de badge dans ce cas. */
export function moinsCher(maxiZooKg: number | null, amazonKg: number | null, poidsMaxiZoo: number | null = null, poidsAmazon: number | null = null): 'maxizoo' | 'amazon' | null {
  if (!maxiZooKg || !amazonKg || !poidsMaxiZoo || !poidsAmazon) return null
  if (Math.abs(poidsMaxiZoo - poidsAmazon) / poidsMaxiZoo > 0.05) return null
  if (Math.abs(maxiZooKg - amazonKg) / Math.max(maxiZooKg, amazonKg) < 0.01) return null
  return amazonKg < maxiZooKg ? 'amazon' : 'maxizoo'
}

export const amazonUrl = (asin: string, tag: string): string => `https://www.amazon.fr/dp/${asin}?tag=${tag}`
