import Link from 'next/link'
import { FORBIDDEN_FOODS } from '@/lib/garde/forbidden'
import type { SitterViewModel } from '@/lib/garde/view'
import { SitterCalls } from './SitterCalls'

// @cdc fiche de garde — ce que voit la personne qui garde le chien (maquette validée) : repas en
// gros, friandises autorisées en vert, « Jamais, même un peu » en rose avec les allergies,
// habitudes, puis les boutons d'appel. Rendu serveur, sans JavaScript. Ni e-mail ni adresse.

function Chips({ items }: { items: string[] }) {
  return (
    <ul role="list" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((t) => (
        <li key={t} className="rounded-pill bg-paper px-2.5 py-1 text-sm text-ink">
          {t}
        </li>
      ))}
    </ul>
  )
}

function SubTitle({ children, nested }: { children: string; nested: boolean }) {
  const Tag = nested ? 'h3' : 'h2'
  return <Tag className="m-0 font-display text-xl font-black leading-tight text-ink">{children}</Tag>
}

export function SitterView({ m, headingLevel = 1 }: { m: SitterViewModel; headingLevel?: 1 | 2 }) {
  const nested = headingLevel === 2
  const Name = nested ? 'p' : 'h1'
  const Box = nested ? 'h4' : 'h3'
  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-cream">
      <header className="flex flex-col gap-1 bg-ink px-4 py-5 text-cream">
        <p className="m-0 text-xs font-semibold uppercase tracking-wider text-amber">{`Fiche de garde · ${m.period}`}</p>
        <Name className="m-0 font-display text-3xl font-black leading-tight text-cream">{m.name}</Name>
        <p className="m-0 text-sm text-cream-2">{m.facts}</p>
      </header>
      <div className="flex flex-col gap-4 p-4">
        <SubTitle nested={nested}>Ses repas</SubTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <p className="m-0 flex flex-col gap-1 rounded-box bg-amber-bg px-3 py-2.5">
            <strong className="font-display text-3xl font-black leading-none text-ink">{m.grams}</strong>
            <span className="text-sm text-ink-2">de croquettes par jour</span>
          </p>
          <p className="m-0 flex flex-col gap-1 rounded-box bg-amber-bg px-3 py-2.5">
            <strong className="font-display text-3xl font-black leading-none text-ink">{m.split}</strong>
            <span className="text-sm text-ink-2">{m.splitDetail}</span>
          </p>
        </div>
        <ul role="list" className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px] text-ink">
          {m.food ? <li>{`Croquettes : ${m.food}`}</li> : null}
          <li>Pèse avec une balance de cuisine, le doseur trompe.</li>
          <li>Eau fraîche toujours à disposition.</li>
        </ul>
        {m.treats.length > 0 ? (
          <section className="flex flex-col gap-2 rounded-box bg-green-bg p-3">
            <Box className="m-0 font-display text-base font-black text-green-ink">Friandises autorisées</Box>
            <Chips items={m.treats} />
          </section>
        ) : null}
        <section className="flex flex-col gap-2 rounded-box bg-rose-bg p-3">
          <Box className="m-0 font-display text-base font-black text-rose-ink">Jamais, même un peu</Box>
          <Chips items={FORBIDDEN_FOODS.map((f) => f.label)} />
          {m.allergies ? (
            <p className="m-0 text-sm text-ink">
              Allergie connue : <strong className="font-semibold">{m.allergies}</strong>
            </p>
          ) : null}
        </section>
        {m.meds || m.notes.length > 0 ? (
          <>
            <SubTitle nested={nested}>À savoir</SubTitle>
            <ul role="list" className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px] text-ink">
              {m.meds ? <li>{`Médicament : ${m.meds}`}</li> : null}
              {m.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </>
        ) : null}
        <SubTitle nested={nested}>En cas de souci</SubTitle>
        <SitterCalls m={m} />
        <p className="m-0 text-center text-xs text-ink-2">
          Fiche préparée avec{' '}
          <Link href="/outils/fiche-de-garde" className="text-ink-2 underline underline-offset-2">
            Toutou Gourmet
          </Link>
        </p>
      </div>
    </article>
  )
}
