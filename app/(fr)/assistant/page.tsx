import type { Metadata } from 'next'
import Link from 'next/link'
import { MiloAvatar } from '@/components/assistant/MiloAvatar'
import { MiloChat } from '@/components/assistant/MiloChat'

// @cdc assistant — page de Milo, l'assistant (décision du 2026-11-07). Présentation servie en HTML, discussion dans
// le navigateur. Compte demandé à l'envoi de la question.

export const metadata: Metadata = {
  title: { absolute: 'Milo, l’assistant de Toutou Gourmet : une question sur la gamelle ?' },
  description: 'Pose ta question sur les croquettes, la ration ou un aliment à Milo, le Shiba de Toutou Gourmet. Il demande les détails utiles et répond avec nos articles.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/assistant' },
}

const POINTS = [
  { titre: 'Il demande avant de répondre', texte: 'Race, poids, quantité avalée : Milo pose les questions qui changent la réponse.' },
  { titre: 'Nos articles d’abord', texte: 'Sa réponse s’appuie sur nos guides quand on a traité le sujet, avec le lien pour lire la suite.' },
  { titre: 'Il connaît ton chien', texte: 'Enregistre ton chien dans ton compte : Milo lit son profil et ne te le redemande pas.' },
]

export default function AssistantPage() {
  return (
    <main className="v2 mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <header className="flex items-center gap-4 md:gap-6">
        <MiloAvatar size={96} className="border-[3px] shadow-[4px_4px_0_var(--orange)] md:size-[120px]" />
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-semibold uppercase tracking-wide text-orange-ink">Milo, l&apos;assistant</p>
          <h1 className="m-0 font-display text-[clamp(1.75rem,5vw,2.6rem)] font-black leading-[1.05] tracking-tight text-ink">Une question sur la gamelle de ton chien ?</h1>
          <p className="m-0 text-base leading-relaxed text-ink-2 md:text-lg">Milo, notre Shiba, répond à partir de nos articles sur l&apos;alimentation du chien.</p>
        </div>
      </header>
      <div className="rounded-hero border-2 border-ink bg-cream-2 p-3 shadow-[6px_6px_0_var(--ink)] md:p-5">
        <MiloChat />
      </div>
      <section aria-labelledby="comment" className="flex flex-col gap-3">
        <h2 id="comment" className="m-0 font-display text-2xl font-black text-ink">Comment répond Milo ?</h2>
        <ul role="list" className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
          {POINTS.map((p) => (
            <li key={p.titre} className="flex flex-col gap-1 rounded-card border border-line bg-paper p-4">
              <h3 className="m-0 text-base font-bold text-ink">{p.titre}</h3>
              <p className="m-0 text-sm leading-relaxed text-ink-2">{p.texte}</p>
            </li>
          ))}
        </ul>
      </section>
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        Milo n&apos;est pas vétérinaire : il ne pose pas de diagnostic et ne donne pas de dose de médicament. Si ton chien va mal, appelle ton vétérinaire. Tes questions sont gardées 90 jours, sans ton nom ni ton adresse, pour choisir nos prochains articles.{' '}
        <Link href="/mon-chien" className="font-semibold text-orange-ink underline underline-offset-2">Enregistrer mon chien</Link>
      </p>
    </main>
  )
}
