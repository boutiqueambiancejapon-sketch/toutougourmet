import Link from 'next/link'
import { CENTRES_ANTIPOISON } from '@/lib/assistant/urgence'
import { PrixLigne } from '@/components/scanner/PrixLigne'
import { MiloAvatar } from './MiloAvatar'
import type { MiloMessage, MiloReponse } from './use-milo'

// @cdc assistant — un échange : la question, puis la réponse de Milo. Les centres antipoison ne s'affichent que si
// Milo juge la situation urgente ; la mention « les IA peuvent faire des erreurs » quand aucun article ne l'appuie.

const LIEN = 'font-semibold text-orange-ink underline underline-offset-2'

function Urgence() {
  return (
    <div role="alert" className="mt-1 flex flex-col gap-1 rounded-box border-2 border-rose-ink bg-rose-bg p-3 text-sm text-ink">
      <p className="m-0 font-semibold">Appelle maintenant ton vétérinaire ou un centre antipoison :</p>
      {CENTRES_ANTIPOISON.map((c) => (
        <p key={c.tel} className="m-0">
          <a href={`tel:${c.tel.replace(/ /g, '')}`} className={LIEN}>{c.tel}</a> ({c.nom})
        </p>
      ))}
    </div>
  )
}

function Produits({ liste }: { liste: MiloReponse['produits'] }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-2.5">
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {liste.map((p) => (
          <li key={p.url} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-box bg-cream-2 p-2.5">
            <span className="min-w-0 grow text-sm font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
              {p.nom}
              {p.score !== null ? <span className="ml-1.5 whitespace-nowrap rounded-pill bg-ink px-2 py-0.5 text-xs text-cream">{`${p.score}/100`}</span> : null}
              {p.remise ? <span className="block text-xs font-normal text-ink-2">{p.remise}</span> : null}
              {p.prix ? <span className="mt-1 block font-normal"><PrixLigne prix={p.prix} compact /></span> : null}
            </span>
            <a href={p.url} rel="sponsored nofollow noopener" target="_blank" data-cta="assistant-produit" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-control bg-ink px-3.5 text-sm font-semibold text-cream no-underline">{`Voir chez ${p.chez}`}</a>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-ink-3">Liens partenaires : on touche une commission si tu commandes, sans surcoût pour toi. Les notes ne dépendent que de l&apos;étiquette.</p>
    </div>
  )
}

function Reponse({ r }: { r: MiloReponse }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-card rounded-tl-sm border-2 border-ink bg-paper p-3.5 shadow-[3px_3px_0_var(--orange)]">
      {r.reponse.split(/\n+/).map((p) => <p key={p} className="m-0 text-[15px] leading-relaxed text-ink">{p}</p>)}
      {r.gravite === 'urgence' ? <Urgence /> : null}
      {r.articles.length ? (
        <p className="m-0 text-sm text-ink-2">Pour aller plus loin : {r.articles.map((a, i) => <span key={a.url}>{i ? ', ' : ''}<Link href={a.url} className={LIEN}>{a.titre}</Link></span>)}</p>
      ) : null}
      {r.produits.length ? <Produits liste={r.produits} /> : null}
      {r.depuisLeSite || r.questions || r.fixe ? null : <p className="m-0 text-xs italic text-ink-3">Attention, les IA peuvent faire des erreurs : cette réponse ne s&apos;appuie sur aucun article du site.</p>}
    </div>
  )
}

export function MiloBulle({ m, enCours = false }: { m: MiloMessage; enCours?: boolean }) {
  return (
    <li className="flex flex-col gap-2.5">
      <p className="m-0 max-w-[85%] self-end rounded-card rounded-br-sm bg-ink px-3.5 py-2.5 text-[15px] leading-snug text-cream">{m.q}</p>
      <div className="flex items-start gap-2">
        <MiloAvatar size={32} className="mt-0.5" />
        {m.r ? <Reponse r={m.r} /> : null}
        {m.erreur ? <p className="m-0 pt-1.5 text-[15px] text-rose-ink">{m.erreur}</p> : null}
        {enCours ? <p className="m-0 pt-1.5 text-[15px] text-ink-2">Milo renifle nos articles…</p> : null}
      </div>
    </li>
  )
}
