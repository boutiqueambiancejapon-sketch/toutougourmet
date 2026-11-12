import type { Metadata } from 'next'
import Link from 'next/link'
import { CGU_VERSION, CONDITIONS } from '@/data/conditions'

// @cdc légal — conditions générales d'utilisation (texte dans data/conditions.ts).

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation',
  description: 'Conditions d’utilisation de Toutou Gourmet : articles, scanner, compte, liens partenaires et Milo, l’assistant.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/conditions-generales' },
  robots: { index: false },
}

const date = new Date(`${CGU_VERSION}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

export default function ConditionsPage() {
  return (
    <div className="v2 mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <header className="flex flex-col gap-2">
        <h1 className="m-0 font-display text-[clamp(1.75rem,5vw,2.4rem)] font-black leading-[1.05] tracking-tight text-ink">Conditions générales d&apos;utilisation</h1>
        <p className="m-0 text-sm text-ink-2">{`Version du ${date}`}</p>
      </header>
      <nav aria-label="Sommaire" className="rounded-card border border-line bg-paper p-4">
        <ol className="m-0 flex flex-col gap-1 pl-5 text-sm">
          {CONDITIONS.map((a) => <li key={a.id}><a href={`#${a.id}`} className="text-ink underline underline-offset-2">{a.titre}</a></li>)}
        </ol>
      </nav>
      {CONDITIONS.map((a, i) => (
        <section key={a.id} id={a.id} aria-labelledby={`${a.id}-t`} className="flex scroll-mt-24 flex-col gap-2">
          <h2 id={`${a.id}-t`} className="m-0 font-display text-xl font-black text-ink">{`${i + 1}. ${a.titre}`}</h2>
          {a.paragraphes.map((p) => <p key={p} className="m-0 text-base leading-relaxed text-ink-2">{p}</p>)}
        </section>
      ))}
      <p className="m-0 text-sm text-ink-2">
        Voir aussi les <Link href="/mentions-legales" className="font-semibold text-ink underline underline-offset-2">mentions légales</Link> et la{' '}
        <Link href="/politique-de-confidentialite" className="font-semibold text-ink underline underline-offset-2">politique de confidentialité</Link>.
      </p>
    </div>
  )
}
