import { YUKA_PUBLISHER, YUKA_URL } from './yuka-facts'

// @cdc juridique — encadré de transparence exigé par le propriétaire, placé tôt dans la page :
// aucun lien avec Yuka, nom de l'éditeur vérifié (yuka-facts.ts), lien officiel sans transmission
// de popularité (nofollow) et ouvert dans un nouvel onglet annoncé dans le texte du lien.
// Couleurs neutres du site (crème, encre) : rien qui rappelle l'identité visuelle de Yuka.

export function YukaNotice() {
  return (
    <aside aria-label="Aucun lien avec Yuka" className="rounded-box border-[1.5px] border-ink bg-cream-2 p-4 text-base leading-relaxed text-ink sm:p-5">
      <p className="m-0 font-semibold">
        {`Toutou Gourmet n'a aucun lien avec Yuka : ni partenariat, ni affiliation. Yuka est une marque de ${YUKA_PUBLISHER}, la société qui l'édite.`}
      </p>
      <p className="m-0 mt-2 text-sm text-ink-2">
        {'Yuka est cité ici pour comparer, d\'après ses propres pages. Pour en savoir plus, consulte le '}
        <a href={YUKA_URL} target="_blank" rel="nofollow noopener" className="font-semibold text-orange-ink underline underline-offset-2">
          site officiel de Yuka (nouvel onglet)
        </a>
        .
      </p>
    </aside>
  )
}
