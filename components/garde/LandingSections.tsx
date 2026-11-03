import Link from 'next/link'
import { SitterView } from './SitterView'
import { TemplateOffer } from './TemplateOffer'
import { FORBIDDEN_FOODS } from '@/lib/garde/forbidden'
import { EXAMPLE_SHEET, sitterView } from '@/lib/garde/view'

// @cdc fiche de garde — sections de la page publique entre le formulaire et la méthode : à quoi
// sert la fiche, ce qu'elle contient, aperçu (le même composant que la page du gardien), étapes,
// modèle vierge à imprimer. Rendu serveur : tout ce texte est indexable.

export const ARTICLE_HREF = '/chien/alimentation-quotidienne/faire-garder-son-chien-vacances-alimentation'

export const STEPS = [
  { name: 'Remplis le formulaire', text: "Le poids, l'âge et l'activité donnent la ration en grammes. Corrige-la si le sac de ses croquettes indique autre chose." },
  { name: 'Crée ton compte gratuit', text: "Ou connecte-toi. Ta saisie, gardée sur ton téléphone, est reprise après la confirmation de l'e-mail." },
  { name: 'Envoie le lien au gardien', text: "Par WhatsApp, SMS ou e-mail. Il ouvre la fiche sans compte. Le PDF d'une page s'imprime pour le frigo." },
  { name: 'Au retour, rien à faire', text: 'Le lien expire seul le lendemain de ton retour. Tu peux supprimer la fiche avant, depuis ton compte.' },
]

const h2 = 'm-0 font-display text-2xl font-black text-ink'
const body = 'flex flex-col gap-3 text-base leading-relaxed text-ink-2 [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-ink'

export function LandingSections() {
  const forbidden = FORBIDDEN_FOODS.map((f) => f.label.toLowerCase()).join(', ')
  return (
    <>
      <section aria-labelledby="a-quoi-sert" className="flex flex-col gap-3">
        <h2 id="a-quoi-sert" className={h2}>
          À quoi sert une fiche de garde pour chien&nbsp;?
        </h2>
        <div className={body}>
          <p className="m-0">
            Une fiche de garde rassemble sur une page les consignes qu&apos;on répète d&apos;habitude sur le pas de la porte : combien de
            croquettes, à quelle heure, ce que le chien n&apos;a jamais le droit de manger et qui appeler s&apos;il se passe quelque chose.
            Le gardien, un proche, un voisin ou un pet sitter, l&apos;a sous les yeux pendant toute ton absence.
          </p>
          <p className="m-0">
            Elle évite les écarts de gamelle qu&apos;on découvre au retour : une ration doublée parce qu&apos;il réclamait, des restes de
            table, un sac de croquettes acheté en dépannage. Pour préparer les repas avant le départ, lis aussi notre guide pour{' '}
            <Link href={ARTICLE_HREF}>faire garder son chien pendant les vacances</Link>.
          </p>
        </div>
      </section>

      <section aria-labelledby="contenu" className="flex flex-col gap-3">
        <h2 id="contenu" className={h2}>
          Que contient la fiche&nbsp;?
        </h2>
        <ul role="list" className="m-0 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed text-ink-2 [&_a]:text-orange-ink [&_a]:underline">
          <li>Le chien : nom, race, poids, âge, stérilisation.</li>
          <li>
            Sa ration du jour en grammes, calculée comme dans notre <Link href="/outils/ration">calculateur de ration</Link>, répartie
            par repas avec les heures.
          </li>
          <li>Ses croquettes habituelles et les friandises autorisées, en vert.</li>
          <li>{`« Jamais, même un peu », en rose : ${forbidden}, plus ses allergies.`}</li>
          <li>Ses médicaments et ses habitudes (peur de l&apos;orage, promenade avant le repas).</li>
          <li>
            Trois boutons d&apos;appel : toi, son vétérinaire et le centre antipoison vétérinaire du pays (CNITV en France, Centre
            Antipoisons en Belgique, Pet Poison Helpline au Canada).
          </li>
        </ul>
      </section>

      <section aria-labelledby="apercu" className="flex flex-col gap-3">
        <h2 id="apercu" className={h2}>
          À quoi ressemble la fiche du gardien&nbsp;?
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Exemple avec Rex, 12 kg. Le gardien reçoit cette page par un lien, sans compte ni application, ou en PDF d&apos;une page A4.
        </p>
        <div className="mx-auto w-full max-w-md">
          <SitterView m={sitterView(EXAMPLE_SHEET)} headingLevel={2} />
        </div>
      </section>

      <section aria-labelledby="etapes" className="flex flex-col gap-3">
        <h2 id="etapes" className={h2}>
          Comment préparer la fiche en quatre étapes&nbsp;?
        </h2>
        <ol className="m-0 flex flex-col gap-3 pl-5 text-base leading-relaxed text-ink-2">
          {STEPS.map((s) => (
            <li key={s.name}>
              <strong className="font-semibold text-ink">{s.name}.</strong> {s.text}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="modele" className="flex flex-col gap-3 rounded-card bg-cream-2 p-4 sm:p-6">
        <h2 id="modele" className={h2}>
          Un modèle de fiche de garde à imprimer
        </h2>
        <p className="m-0 text-base leading-relaxed text-ink-2">
          Pour remplir la fiche au stylo : une page A4 avec des cases pour la ration, les heures, les friandises et les numéros. Les
          aliments interdits et les centres antipoison sont déjà imprimés. Laisse ton e-mail, le PDF s&apos;affiche aussitôt.
        </p>
        <TemplateOffer />
      </section>
    </>
  )
}
