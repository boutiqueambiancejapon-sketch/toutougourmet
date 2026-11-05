import { Sources } from '@/components/outils/ToolPage'
import { BAREMES_PUBLICS } from '@/lib/scanner/baremes/methode'

// @cdc scanner — méthode publiée des 4 barèmes, affichée seulement quand BAREMES_ACTIFS est vrai.

export function ScannerMethodBaremes() {
  return (
    <>
      <p>
        L&apos;IA ne donne pas la note. Elle recopie l&apos;étiquette dans un format fixe, puis un barème écrit par la rédaction
        calcule la note. Il y en a quatre, un par type de produit, car une friandise et un repas ne se jugent pas de la même façon.
        Une note se compare seulement dans son type.
      </p>
      <p>
        <strong>D&apos;où viennent les chiffres ?</strong> Des marques : l&apos;étiquette que tu photographies, leur site, la fiche
        d&apos;un revendeur comme Maxi Zoo, ou Open Pet Food Facts, base ouverte remplie par ses contributeurs (licence ODbL). Nous
        n&apos;analysons pas les produits en laboratoire, et la fiche dit d&apos;où viennent ses données. Compare toujours avec ton
        paquet : une recette peut changer.
      </p>
      <p>
        <strong>Les liens partenaires changent-ils la note ?</strong> Non. Certains liens nous rapportent une commission, mais le
        calcul ne connaît ni le partenaire ni le lien : le barème est le même pour toutes les marques. Les fiches de nos partenaires
        viennent souvent de leur propre site, sans vérification en laboratoire.
      </p>
      <p>
        <strong>Que se passe-t-il avant la note ?</strong> Une vérification de sécurité. Xylitol, raisin, chocolat ou macadamia cités
        dans la composition donnent 0. Oignon ou ail parmi les 3 premiers ingrédients, ou à 5 % et plus, donnent 0 aussi ; ailleurs,
        la note s&apos;arrête à 45 avec une alerte. Ces seuils sont un choix de la rédaction.
      </p>
      <p>
        <strong>Et un aliment vétérinaire ?</strong> Pas de note. Un aliment présenté pour une maladie est à juger avec ton
        vétérinaire, et il n&apos;existe aucun classement par maladie.
      </p>
      {BAREMES_PUBLICS.map((b) => (
        <section key={b.id} className="flex flex-col gap-3">
          <h3 className="m-0 font-display text-xl font-black text-ink">{b.titre}</h3>
          <p className="m-0">{b.intro}</p>
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="border-b-2 border-ink text-left">
                <th scope="col" className="py-2 pr-2 font-semibold text-ink">Critère</th>
                <th scope="col" className="py-2 pr-2 text-right font-semibold text-ink">Points</th>
              </tr>
            </thead>
            <tbody>
              {b.lignes.map(([critere, points, regle]) => (
                <tr key={critere} className="border-b border-line align-top">
                  <td className="py-2 pr-2">
                    <span className="block font-semibold text-ink">{critere}</span>
                    <span className="block text-sm">{regle}</span>
                  </td>
                  <td className="py-2 text-right font-semibold text-ink">{points}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="m-0 font-semibold text-ink">Quand la note s&apos;arrête-t-elle plus bas ?</p>
          <ul className="m-0 flex flex-col gap-1 pl-5">
            {b.plafonds.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}
      <p>
        Une note de 97 ne dit pas qu&apos;un produit est meilleur pour la santé de ton chien : les critères sont des choix de la
        rédaction, écrits ici pour que tu puisses les discuter. Le barème ne mesure ni la digestibilité, ni l&apos;adaptation à une
        maladie. Un chiot, un chien âgé ou malade a des besoins propres : demande l&apos;avis de ton vétérinaire.
      </p>
      <Sources
        items={[
          'FEDIAF, Nutritional Guidelines for Complete and Complementary Pet Food for Cats and Dogs, 2021 (minimums par 100 g de matière sèche, calcium et phosphore).',
          'National Research Council, Nutrient Requirements of Dogs and Cats, National Academies Press, 2006.',
          'Bauer J. E., « Therapeutic use of fish oils in companion animals », JAVMA 239(11), 2011 (valeurs NRC d\'EPA et de DHA).',
          'Règlement (CE) n° 767/2009 (ordre des ingrédients, mentions de l\'étiquette) et directive 82/475/CEE (catégories d\'ingrédients).',
          'Règlement d\'exécution (UE) 2017/962 (suspension de l\'éthoxyquine).',
          'VCA, repère de 10 % des calories du jour pour les friandises.',
        ]}
      />
    </>
  )
}
