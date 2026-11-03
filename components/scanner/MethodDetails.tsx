'use client'

import { useEffect, useRef, type ReactNode } from 'react'

// @cdc lot 6 — « Méthode » repliée par défaut sur /scanner (une par barème : #methode pour les
// aliments complets, #methode-friandises pour les friandises). Le contenu est dans le HTML servi
// (indexable) ; un lien vers son ancre (fiches, mention IA) l'ouvre et y descend.

export function MethodDetails({ title, children, id = 'methode' }: { title: string; children: ReactNode; id?: string }) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    const open = () => {
      if (window.location.hash !== `#${id}` || !ref.current) return
      ref.current.open = true
      ref.current.scrollIntoView({ block: 'start' })
    }
    open()
    window.addEventListener('hashchange', open)
    return () => window.removeEventListener('hashchange', open)
  }, [id])
  return (
    <details ref={ref} id={id} className="group scroll-mt-24 rounded-card border-2 border-ink bg-paper">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-display text-xl font-black text-ink sm:px-6 [&::-webkit-details-marker]:hidden">
        <h2 className="m-0 text-xl font-black">{title}</h2>
        <span aria-hidden="true" className="text-2xl leading-none transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="flex flex-col gap-3 border-t border-line px-4 py-4 text-base leading-relaxed text-ink-2 sm:px-6 [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-ink">
        {children}
      </div>
    </details>
  )
}
