import type { ReactNode } from 'react'
import { KeepResult } from './KeepResult'
import { NextSteps, type NextStep } from './NextSteps'
import { PartnerLink, type Partner } from './partners'

// @cdc 04-pages — bloc résultat commun aux outils (audit design-cro §3 Outils) : le chiffre,
// au plus un lien partenaire justifié par ce résultat, la suite logique, puis « Garder ce
// résultat ». L'outil l'enveloppe dans une zone aria-live présente dès le chargement.

interface ToolResultProps {
  tool: string
  summary: string
  steps: NextStep[]
  partner?: Partner | null
  children: ReactNode
}

export function ToolResult({ tool, summary, steps, partner, children }: ToolResultProps) {
  return (
    <section aria-label="Résultat"className="flex flex-col gap-5 rounded-card border-2 border-ink bg-paper p-4 sm:p-6">
      {children}
      {partner ? <PartnerLink partner={partner} tool={tool} /> : null}
      <NextSteps steps={steps} />
      <KeepResult tool={tool} summary={summary} />
    </section>
  )
}
