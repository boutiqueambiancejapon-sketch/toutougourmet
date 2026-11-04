import type { ReactNode } from 'react'
import { ToolSignupCard, type SignupTool } from '@/components/cro/ToolSignupCard'
import { KeepResult } from './KeepResult'
import { NextSteps, type NextStep } from './NextSteps'
import { PartnerLink, type Partner } from './partners'

// @cdc 04-pages — bloc résultat commun aux outils (audit design-cro §3 Outils) : le chiffre,
// au plus un lien partenaire justifié par ce résultat, la suite logique, puis « Garder ce
// résultat ». L'outil l'enveloppe dans une zone aria-live présente dès le chargement.
// CRO compte (maquette 2A) : sous le résultat de la ration, du poids, du bilan et de l'âge, carte
// « Créer mon compte gratuit » ; la ligne e-mail « Garder ce résultat » s'efface alors (carte des
// conversions : une seule demande, le compte).
// Audit mobile (2026-11-04) : « Reçois ton résultat par e-mail » retiré de l'affichage, trop de
// demandes à la suite. Ordre : le chiffre, la carte compte (objectif principal), l'offre partenaire
// (secondaire), la suite logique. La route /api/outils/email reste en place, sans bouton qui l'appelle.
// `data-tool-result` : cible du défilement et du focus après le calcul (lib/use-result-reveal.ts).

const SIGNUP_TOOL: Record<string, SignupTool> = { ration: 'ration', 'etat-corporel': 'poids', 'bien-nourri': 'bilan', age: 'age' }

interface ToolResultProps {
  tool: string
  summary: string
  steps: NextStep[]
  partner?: Partner | null
  /** Prénom du chien quand l'outil le connaît (profil du compte) */
  dogName?: string | null
  children: ReactNode
}

export function ToolResult({ tool, summary, steps, partner, dogName, children }: ToolResultProps) {
  const signup = SIGNUP_TOOL[tool]
  return (
    <section data-tool-result tabIndex={-1} aria-label="Résultat" className="flex scroll-mt-20 flex-col gap-5 rounded-card border-2 border-ink bg-paper p-4 sm:p-6">
      {children}
      {signup ? <ToolSignupCard tool={signup} dogName={dogName} /> : null}
      {partner ? <PartnerLink partner={partner} tool={tool} /> : null}
      <NextSteps steps={steps} />
      {signup ? null : <KeepResult tool={tool} summary={summary} />}
    </section>
  )
}
