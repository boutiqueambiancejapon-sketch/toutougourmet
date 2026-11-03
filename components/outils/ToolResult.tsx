import type { ReactNode } from 'react'
import { ToolSignupCard, type SignupTool } from '@/components/cro/ToolSignupCard'
import { KeepResult } from './KeepResult'
import { NextSteps, type NextStep } from './NextSteps'
import { PartnerLink, type Partner } from './partners'
import type { ToolEmailInput } from '@/lib/tool-email'

// @cdc 04-pages — bloc résultat commun aux outils (audit design-cro §3 Outils) : le chiffre,
// au plus un lien partenaire justifié par ce résultat, la suite logique, puis « Garder ce
// résultat ». L'outil l'enveloppe dans une zone aria-live présente dès le chargement.
// CRO compte (maquette 2A) : sous le résultat de la ration, du poids, du bilan et de l'âge, carte
// « Créer mon compte gratuit » ; la ligne e-mail « Garder ce résultat » s'efface alors (carte des
// conversions : une seule demande, le compte).
// CRO capture (2026-11-03) : ration, poids, âge et bilan passent leurs réglages (`emailInput`) :
// « Reçois ton résultat par e-mail » juste sous le chiffre, puis la carte compte (objectif
// principal), puis l'offre partenaire (secondaire, sous la carte compte), puis la suite logique.

const SIGNUP_TOOL: Record<string, SignupTool> = { ration: 'ration', 'etat-corporel': 'poids', 'bien-nourri': 'bilan', age: 'age' }

interface ToolResultProps {
  tool: string
  summary: string
  steps: NextStep[]
  partner?: Partner | null
  /** Réglages de l'outil pour l'e-mail du résultat (lib/tool-email.ts) */
  emailInput?: ToolEmailInput | null
  /** Prénom du chien quand l'outil le connaît (profil du compte) */
  dogName?: string | null
  children: ReactNode
}

export function ToolResult({ tool, summary, steps, partner, emailInput, dogName, children }: ToolResultProps) {
  const signup = SIGNUP_TOOL[tool]
  return (
    <section aria-label="Résultat" className="flex flex-col gap-5 rounded-card border-2 border-ink bg-paper p-4 sm:p-6">
      {children}
      {emailInput ? <KeepResult tool={tool} summary={summary} input={emailInput} accountLink={!signup} /> : null}
      {signup ? <ToolSignupCard tool={signup} dogName={dogName} /> : null}
      {partner ? <PartnerLink partner={partner} tool={tool} /> : null}
      <NextSteps steps={steps} />
      {signup || emailInput ? null : <KeepResult tool={tool} summary={summary} />}
    </section>
  )
}
