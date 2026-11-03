import type { Metadata } from 'next'
import { RIGHTS_SECTIONS } from './sections-droits'
import { SALE_SECTIONS } from './sections-vente'

// @cdc premium — conditions générales de vente de l'abonnement Premium (page légale, non indexée
// comme les mentions légales). Contenu dans sections-vente.tsx et sections-droits.tsx ; les champs
// « [À compléter] » (identité de l'entreprise belge, BCE, TVA, médiateur) sont à remplir par le
// propriétaire avant la mise en vente.

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: 'Conditions générales de vente de l’abonnement Toutou Gourmet Premium : prix, durée, résiliation, rétractation.',
  robots: { index: false },
  alternates: { canonical: 'https://www.toutou-gourmet.com/conditions-generales-de-vente' },
}

const SECTIONS = [...SALE_SECTIONS, ...RIGHTS_SECTIONS]

export default function CgvPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 py-12">
      <div className="mx-auto max-w-prose">
        <h1 className="page-title mb-8">Conditions générales de vente</h1>
        <p className="mb-8 text-sm text-[var(--text-secondary)]">Abonnement Toutou Gourmet Premium · version du 3 novembre 2026</p>
        <nav aria-label="Sommaire" className="mb-8">
          <ol className="m-0 flex list-none flex-col gap-1 p-0 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-flex min-h-11 items-center text-[var(--text-primary)] underline underline-offset-2">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex flex-col gap-8 text-[var(--text-secondary)]">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
