'use client'

import { useEffect, useRef, useState } from 'react'
import { MiloAvatar } from './MiloAvatar'
import { MiloBulle } from './MiloBulle'
import { MiloCompte } from './MiloCompte'
import { useMilo } from './use-milo'

// @cdc assistant — la discussion avec Milo : page /assistant (grand format) ou petite fenêtre (compact).

const SUGGESTIONS = ['Mon chien a mangé du raisin, je fais quoi ?', 'Combien de croquettes par jour pour mon chien ?', 'Mon chien peut-il manger des noisettes ?', 'Quelles friandises pour un chiot ?']

export function MiloChat({ compact = false }: { compact?: boolean }) {
  const { messages, occupe, compte, envoyer, effacer } = useMilo(compact ? 'fenetre' : 'page')
  const [texte, setTexte] = useState('')
  const champ = useRef<HTMLTextAreaElement>(null)
  const fin = useRef<HTMLDivElement>(null)
  const dernier = occupe ? messages[messages.length - 1] : undefined
  const fil = occupe ? messages.slice(0, -1) : messages

  useEffect(() => {
    if (messages.length || compte) fin.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [messages.length, occupe, compte])

  const partir = (q: string) => {
    if (q.trim().length < 3 || occupe) return
    envoyer(q)
    setTexte('')
  }

  return (
    <section aria-label="Discussion avec Milo" className={`flex min-h-0 flex-col gap-3 ${compact ? 'h-full' : ''}`}>
      <div className={`flex min-h-0 flex-col gap-4 ${compact ? 'grow overflow-y-auto overscroll-contain px-1' : ''}`}>
        {fil.length === 0 && !occupe && !compte ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <MiloAvatar size={32} />
              <p className="m-0 rounded-card rounded-tl-sm border-2 border-ink bg-paper p-3.5 text-[15px] leading-relaxed text-ink">
                Salut, moi c&apos;est Milo. Pose-moi ta question sur la gamelle de ton chien : si j&apos;ai besoin de détails, je te les demande.
              </p>
            </div>
            <ul role="list" className="m-0 flex list-none flex-wrap gap-2 p-0 pl-10">
              {SUGGESTIONS.slice(0, compact ? 3 : 4).map((s) => (
                <li key={s}><button type="button" onClick={() => setTexte(s)} className="min-h-11 rounded-pill border border-ink bg-cream-2 px-3 py-1.5 text-left text-sm text-ink hover:bg-paper">{s}</button></li>
              ))}
            </ul>
          </div>
        ) : null}
        {fil.length || dernier ? (
          <ol role="list" aria-live="polite" className="m-0 flex list-none flex-col gap-4 p-0">
            {fil.map((m, i) => <MiloBulle key={i} m={m} />)}
            {dernier ? <MiloBulle m={dernier} enCours /> : null}
          </ol>
        ) : null}
        {compte ? <MiloCompte question={compte} place={compact ? 'assistant-fenetre' : 'assistant'} /> : null}
        <div ref={fin} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); partir(texte) }} className="flex shrink-0 items-end gap-2 rounded-box border-2 border-ink bg-paper p-1.5 focus-within:shadow-[3px_3px_0_var(--orange)]">
        <label className="flex grow">
          <span className="sr-only">Ta question pour Milo</span>
          <textarea ref={champ} value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); partir(texte) } }} rows={compact ? 1 : 2} maxLength={500} placeholder="Écris ta question à Milo" className="w-full resize-none border-0 bg-transparent px-2 py-2 text-base text-ink outline-none" />
        </label>
        <button type="submit" disabled={occupe || texte.trim().length < 3} className="min-h-11 shrink-0 whitespace-nowrap rounded-control bg-orange px-4 font-semibold text-ink disabled:opacity-50">Envoyer</button>
      </form>
      {messages.length ? <button type="button" onClick={effacer} className="self-start text-xs font-semibold text-ink-2 underline underline-offset-2">Nouvelle discussion</button> : null}
    </section>
  )
}
