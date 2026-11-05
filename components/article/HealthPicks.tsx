import { ProductPick } from '@/components/article/ProductPicks'
import { HEALTH_NEEDS, type HealthNeedKey } from '@/data/health-picks'
import { titleTypo } from '@/lib/title-typo'

// @cdc santé — bloc produits des articles de maladie : photo, raison tirée de la marque, lien affilié
// déclaré. Une formule vétérinaire le dit. Rendu serveur.

export function HealthPicks({ need }: { need: HealthNeedKey }) {
  const { title, intro, items } = HEALTH_NEEDS[need]
  const amazon = items.some((item) => item.store === 'Amazon')
  return (
    <section data-cta="maladie-produit" className="not-prose my-8 flex flex-col gap-3">
      <h2 className="m-0 font-display text-2xl font-black text-ink">{titleTypo(title)}</h2>
      <p className="m-0 text-base leading-relaxed text-ink-2">{intro}</p>
      <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((item) => (
          <ProductPick key={item.name} name={item.name} why={item.why} href={item.href} image={item.image} vet={item.vet} store={item.store} />
        ))}
      </ul>
      <p className="m-0 text-sm text-ink-2">
        {`Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi.${amazon ? ' Recherche sur Amazon : vérifie la référence avant de commander. En tant que Partenaire Amazon, on réalise un bénéfice sur les achats remplissant les conditions requises.' : ''}`}
      </p>
    </section>
  )
}
