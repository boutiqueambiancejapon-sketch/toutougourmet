import { BrandHub } from '@/components/marques/BrandHub'
import { getBrandBySlug } from '@/data/brands'

// @cdc seo — contenu de page mère posé dans un article qui porte déjà la requête de la marque (Dogfy Diet :
// l'avis a les positions, /chien/marque/dogfy-diet y redirige). MDX : <BrandHubBlock brand="dogfy-diet" />.
export function BrandHubBlock({ brand }: { brand: string }) {
  const found = getBrandBySlug(brand)
  return found ? <div className="not-prose v2 my-8"><BrandHub brand={found} /></div> : null
}
