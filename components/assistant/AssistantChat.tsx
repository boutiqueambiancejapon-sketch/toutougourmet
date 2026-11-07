'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { CENTRES_ANTIPOISON, estUrgence } from '@/lib/assistant/urgence'
import { track } from '@/lib/analytics'

// @cdc assistant — discussion : question libre, réponse tirée des articles du site quand c'est possible. Une question
// d'urgence affiche d'abord les centres antipoison. Les deux derniers échanges suivent la question suivante.

interface Reponse {
  reponse: string
  depuisLeSite: boolean
  articles: { url: string; titre: string }[]
  fiches: { url: string; nom: string; score: number }[]
}
interface Message {
  q: string
  r?: Reponse
  erreur?: string
}

const SUGGESTIONS = ['Mon chien peut-il manger des noisettes ?', 'Combien de croquettes par jour pour un chien de 10 kg ?', 'Comment lire une étiquette de croquettes ?', 'Quelles friandises pour un chiot ?']
const LIEN = 'font-semibold text-orange-ink underline underline-offset-2'

function Urgence() {
  return (
    <div role="alert" className="flex flex-col gap-1 rounded-box border-2 border-rose-ink bg-rose-bg p-3 text-[15px] text-ink">
      <p className="m-0 font-semibold">Si ton chien a avalé quelque chose ou montre des signes inquiétants, appelle tout de suite ton vétérinaire ou un centre antipoison :</p>
      {CENTRES_ANTIPOISON.map((c) => <p key={c.tel} className="m-0"><a href={`tel:${c.tel.replace(/ /g, '')}`} className={LIEN}>{c.tel}</a> ({c.nom})</p>)}
    </div>
  )
}

function Bulle({ m }: { m: Message }) {
  return (
    <li className="flex flex-col gap-2">
      <p className="m-0 self-end rounded-card bg-ink px-4 py-2.5 text-[15px] text-cream">{m.q}</p>
      {estUrgence(m.q) ? <Urgence /> : null}
      {m.erreur ? <p className="m-0 text-[15px] text-rose-ink">{m.erreur}</p> : null}
      {!m.r && !m.erreur ? <p className="m-0 text-[15px] text-ink-2">Je cherche dans nos articles…</p> : null}
      {m.r ? (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-paper p-4">
          {m.r.reponse.split(/\n+/).map((p) => <p key={p} className="m-0 text-[15px] leading-relaxed text-ink">{p}</p>)}
          {m.r.articles.length ? <p className="m-0 text-sm text-ink-2">D&apos;après {m.r.articles.map((a, i) => <span key={a.url}>{i ? ', ' : ''}<Link href={a.url} className={LIEN}>{a.titre}</Link></span>)}</p> : null}
          {m.r.fiches.length ? <p className="m-0 text-sm text-ink-2">Fiches : {m.r.fiches.map((f, i) => <span key={f.url}>{i ? ', ' : ''}<Link href={f.url} className={LIEN}>{`${f.nom} (${f.score}/100)`}</Link></span>)}</p> : null}
          {m.r.depuisLeSite ? null : <p className="m-0 text-xs italic text-ink-2">Attention, les IA peuvent faire des erreurs : cette réponse ne s&apos;appuie sur aucun article du site.</p>}
        </div>
      ) : null}
    </li>
  )
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [texte, setTexte] = useState('')
  const [occupe, setOccupe] = useState(false)
  const champ = useRef<HTMLTextAreaElement>(null)

  async function envoyer(question: string) {
    const q = question.trim()
    if (q.length < 3 || occupe) return
    const historique = messages.filter((m) => m.r).slice(-2).map((m) => ({ q: m.q, r: m.r?.reponse ?? '' }))
    setMessages((l) => [...l, { q }])
    setTexte('')
    setOccupe(true)
    track('Assistant Question', {})
    const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q, historique }) }).catch(() => null)
    const body = (await res?.json().catch(() => null)) as (Reponse & { ok: boolean; message?: string }) | null
    setMessages((l) => l.map((m, i) => (i === l.length - 1 ? (body?.ok ? { q, r: body } : { q, erreur: body?.message ?? 'Pas de réponse pour l\'instant. Réessaie dans un instant.' }) : m)))
    setOccupe(false)
    champ.current?.focus()
  }

  return (
    <section aria-label="Assistant" className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0">
          {SUGGESTIONS.map((s) => <li key={s}><button type="button" onClick={() => void envoyer(s)} className="min-h-11 rounded-pill border border-line bg-paper px-3 text-left text-sm text-ink hover:bg-cream-2">{s}</button></li>)}
        </ul>
      ) : (
        <ol role="list" aria-live="polite" className="m-0 flex list-none flex-col gap-4 p-0">{messages.map((m, i) => <Bulle key={i} m={m} />)}</ol>
      )}
      <form onSubmit={(e) => { e.preventDefault(); void envoyer(texte) }} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex grow flex-col gap-1">
          <span className="sr-only">Ta question</span>
          <textarea ref={champ} value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void envoyer(texte) } }} rows={2} maxLength={500} placeholder="Croquettes, ration, aliment, étiquette : pose ta question" className="w-full resize-none rounded-box border-2 border-ink bg-paper px-3 py-2.5 text-base text-ink" />
        </label>
        <button type="submit" disabled={occupe || texte.trim().length < 3} className="min-h-12 shrink-0 whitespace-nowrap rounded-control bg-orange px-5 font-semibold text-ink disabled:opacity-60">Envoyer</button>
      </form>
    </section>
  )
}
