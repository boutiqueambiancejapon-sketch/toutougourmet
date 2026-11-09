import { readFileSync, readdirSync } from 'node:fs'
import { extractSizeBands } from '../lib/size-bands'

// @cdc articles — contrôle des tableaux par gabarit (demande du propriétaire, 2026-11-09) : la portion monte avec le
// poids, et le haut de chaque fourchette reste sous 10 % des calories d'un chien stérilisé du bas du gabarit.
// Lancer : npx tsx scripts/check-portions.ts (sortie non nulle s'il y a un problème)

let erreurs = 0
for (const f of readdirSync('content/blog').filter((x) => x.endsWith('.mdx'))) {
  const s = readFileSync(`content/blog/${f}`, 'utf8')
  const kcal = Number(/^kcal100:\s*([\d.]+)/m.exec(s)?.[1])
  const tables = s.split('<SizeTable').slice(1).map((t) => extractSizeBands(t.split('</SizeTable>')[0]))
  for (const bands of tables) {
    bands.forEach((b, i) => {
      const prev = bands[i - 1]
      if (prev && (b.gMin < prev.gMin || b.gMax < prev.gMax)) { erreurs++; console.log(`${f} : ${b.min} kg reçoit moins que ${prev.min} kg (${b.gMin}-${b.gMax} g contre ${prev.gMin}-${prev.gMax} g)`) }
      if (kcal && b.min > 0) {
        const plafond = (70 * b.min ** 0.75 * 1.4 * 0.1 / kcal) * 100
        if (b.gMax > plafond) { erreurs++; console.log(`${f} : ${b.min} kg, ${b.gMax} g dépasse 10 % des calories (${Math.round(plafond)} g)`) }
      }
    })
  }
}
console.log(erreurs ? `${erreurs} problème(s)` : 'Tableaux par gabarit : tout est cohérent')
process.exit(erreurs ? 1 : 0)
