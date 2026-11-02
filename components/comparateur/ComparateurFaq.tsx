import { FaqItem, FaqList } from '@/components/article/Faq'
import { frTypo } from '@/lib/utils'

// @cdc 04-pages — FAQ du comparateur en accordéon natif, rendue côté serveur. Chiffres repris
// des fiches marques et des tests de la rubrique Avis (data/brands.ts › facts).

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Quelle est la différence entre les croquettes et le repas frais pour chien ?',
    a: "Les croquettes sont cuites à haute température par extrusion, ce qui donne un aliment sec et concentré. Les repas frais d'Elmut, Dog Chef ou Dogfy Diet sont cuits à basse température (autour de 90 °C), puis livrés réfrigérés ou congelés. Ils demandent de la place au frigo ou au congélateur et coûtent plus cher au quotidien.",
  },
  {
    q: 'Les croquettes sans céréales sont-elles meilleures ?',
    a: "Pas pour tous les chiens. Un chien en bonne santé, sans sensibilité connue, n'en a pas besoin. Pour un chien sensible ou intolérant, une recette sans céréales retire un ingrédient de plus à surveiller. Franklin est sans céréales sur toute sa gamme ; Ultra Premium Direct propose une gamme Sans Céréales, environ 1 € plus chère au kilo que sa gamme standard, qui contient 13 % de maïs.",
  },
  {
    q: 'Comment choisir entre Franklin, Elmut, Ultra Premium Direct et Dog Chef ?',
    a: "Pars de ton chien. Allergique ou à la digestion sensible : Franklin, avec une seule viande par recette. Budget serré et chien adulte sans souci : Ultra Premium Direct, à 3 à 5 € le kilo. Senior ou en surpoids, avec l'envie de passer au frais : Elmut. Chiot ou chien dont le poids change : Dog Chef, qui recalcule les portions.",
  },
  {
    q: 'Combien coûte une alimentation premium pour chien ?',
    a: "En croquettes, compte 3 à 5 € le kilo chez Ultra Premium Direct et environ 6,30 à 9 € le kilo chez Franklin. En repas frais, le budget va d'environ 45 € par mois pour un petit chien chez Dog Chef jusqu'à 165 € pour un chien de 40 kg ; Elmut va de 55 à 180 € par mois et Dogfy Diet de 50 à 200 € selon le gabarit.",
  },
  {
    q: 'Peut-on mélanger croquettes et pâtée pour son chien ?',
    a: "Oui. La pâtée ajoute de l'eau et de l'appétence, les croquettes restent pratiques. Réduis chaque part pour que la ration totale corresponde aux besoins du chien. Franklin et Ultra Premium Direct vendent les deux formats, et Dog Chef propose un plan mixte repas frais et croquettes.",
  },
]

export function ComparateurFaq() {
  return (
    <section aria-labelledby="faq" className="v2 flex max-w-prose flex-col gap-2">
      <h2 id="faq" className="m-0 font-display text-2xl font-black text-ink md:text-3xl">Quelle nourriture pour chien choisir&nbsp;?</h2>
      <FaqList>
        {FAQ.map((f) => (
          <FaqItem key={f.q} question={frTypo(f.q)}>
            <p className="m-0">{frTypo(f.a)}</p>
          </FaqItem>
        ))}
      </FaqList>
    </section>
  )
}
