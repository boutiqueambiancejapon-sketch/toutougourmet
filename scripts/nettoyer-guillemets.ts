// Retire les « &quot » laissés dans les ingrédients de quelques fiches Maxi Zoo (Acana, 2026-11-12), puis laisse
// scripts/rescore-fiches.ts recalculer la note.   tsx scripts/nettoyer-guillemets.ts [--appliquer]
import pg from 'pg'

const appliquer = process.argv.includes('--appliquer')
async function main(): Promise<void> {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{ id: string; brand: string; product: string; extracted: { ingredients: { nom: string }[] } }>(
    "SELECT id, brand, product, extracted FROM app.food_analysis WHERE extracted::text ~ '&quot'",
  )
  for (const r of rows) {
    const ingredients = r.extracted.ingredients.map((i) => ({ ...i, nom: i.nom.replace(/&quot;?/g, '').trim() })).filter((i) => /\p{L}{2}/u.test(i.nom))
    console.log(`${r.brand} ${r.product} : ${r.extracted.ingredients.length} → ${ingredients.length} ingrédients · 1er : ${ingredients[0]?.nom}`)
    if (appliquer) await pool.query('UPDATE app.food_analysis SET extracted = $2 WHERE id = $1', [r.id, JSON.stringify({ ...r.extracted, ingredients })])
  }
  await pool.end()
}
void main()
