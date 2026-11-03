import { POISON_COUNTRIES } from '@/data/poison-centers'
import type { GuideFoodFamily } from '@/lib/guide/foods'
import { BookPage, Source } from './BookPage'

// @cdc guide — chapitre 3, la page à coller sur le frigo : gestes de la maquette validée (repris
// de l'article raisin, composant WhatToDo), numéros de data/poison-centers.ts (FR, BE, CA),
// liste des interdits du livre et une ligne à remplir pour son vétérinaire.

const STEPS: { title: string; rest: string; detail?: string }[] = [
  { title: 'Retire le reste', rest: ' de sa portée et garde l’emballage.' },
  { title: 'Note l’heure', rest: ', son poids et la quantité estimée.' },
  { title: 'Appelle ton vétérinaire', rest: ' ou un centre antipoison.', detail: 'Sans attendre les symptômes.' },
  { title: 'Ne le fais pas vomir', rest: ' toi-même : ni sel, ni eau oxygénée.', detail: 'Le sel et l’eau oxygénée abîment l’estomac et l’œsophage.' },
]

export function BookUrgences({ number, chapter, families }: { number: number; chapter: number; families: GuideFoodFamily[] }) {
  const forbidden = families.flatMap((f) => f.foods.filter((food) => food.verdict === 'danger').map((food) => food.label))
  forbidden.sort((a, b) => a.localeCompare(b, 'fr'))
  return (
    <BookPage number={number} className="bk-urg">
      <header className="bk-head">
        <p className="bk-kicker">Chapitre {chapter} · À afficher sur le frigo</p>
        <h2 className="bk-h1">Il a avalé quelque chose ?</h2>
      </header>
      <ol className="bk-steps">
        {STEPS.map((s) => (
          <li key={s.title}>
            <b>{s.title}</b>
            {s.rest}
            {s.detail ? <span>{s.detail}</span> : null}
          </li>
        ))}
      </ol>
      <div className="bk-nums">
        {POISON_COUNTRIES.flatMap((country) =>
          country.centers.map((c) => (
            <div key={c.tel} className="bk-num">
              <span>
                {country.label} · {c.name}, {c.city}
                {c.hours ? `, ${c.hours}` : ''}
              </span>
              <b>{c.phone}</b>
              {c.note ? <em>{c.note}</em> : null}
            </div>
          )),
        )}
      </div>
      {POISON_COUNTRIES.map((c) => (c.advice ? <p key={c.code} className="bk-small">{`${c.label} : ${c.advice}`}</p> : null))}
      <p className="bk-write">
        Mon vétérinaire : <span className="line" /> Tél. : <span className="line s" />
        <br />
        Urgences vétérinaires 24 h : <span className="line" /> Tél. : <span className="line s" />
      </p>
      <div className="bk-verdict bk-tone-danger">
        <h3>Interdits, même en petite quantité</h3>
        <p className="bk-small">{forbidden.join(' · ')}</p>
      </div>
      <Source path="/chien/urgences/chien-mange-raisin-urgence" label="Les gestes en détail" />
    </BookPage>
  )
}
