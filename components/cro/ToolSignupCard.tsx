'use client'

import { IconBars, IconCake, IconHeart, IconScale, IconScan, type IconProps } from '@/components/icons'
import type { SignupPlace } from '@/lib/signup-places'
import { SignupCard } from './SignupCard'

// @cdc CRO compte (maquette 2A) — carte sous le résultat d'un outil, titre propre à l'outil.
// Mêmes coches et même bouton partout ; le prénom du chien est repris quand l'outil le connaît.

export type SignupTool = 'ration' | 'poids' | 'bilan' | 'age' | 'scanner'

interface ToolCopy {
  place: SignupPlace
  title: (name: string | null) => string
  text: string
  Icon: (props: IconProps) => React.JSX.Element
}

const COPY: Record<SignupTool, ToolCopy> = {
  ration: {
    place: 'tool-ration',
    title: (name) => `Garde la ration de ${name ?? 'ton chien'}`,
    text: 'Elle sera déjà remplie la prochaine fois, et tu pourras suivre son poids semaine après semaine.',
    Icon: IconBars,
  },
  poids: {
    place: 'tool-poids',
    title: () => 'Suis son poids semaine après semaine',
    text: 'Note chaque pesée : la courbe montre s’il se rapproche de son poids de forme, et sa ration suit.',
    Icon: IconScale,
  },
  bilan: {
    place: 'tool-bilan',
    title: () => 'Refais le bilan dans un mois et compare',
    text: 'Entre-temps, note ses pesées dans ton compte : au prochain bilan, tu verras si les changements de gamelle ont payé.',
    Icon: IconHeart,
  },
  age: {
    place: 'tool-age',
    title: (name) => `Enregistre la date de naissance de ${name ?? 'ton chien'}`,
    text: 'Son âge se met à jour tout seul, et la ration passe en mode senior le moment venu.',
    Icon: IconCake,
  },
  scanner: {
    place: 'tool-scanner',
    title: () => 'Garde l’historique de ses croquettes',
    text: 'Chaque sac scanné reste dans ton compte, à côté de son profil et de sa courbe de poids.',
    Icon: IconScan,
  },
}

const CHECKS = ['Ration recalculée quand son poids change', 'Courbe de poids avec la zone de sa race', '5 scans de croquettes par mois']

export function ToolSignupCard({ tool, dogName = null, retour }: { tool: SignupTool; dogName?: string | null; retour?: string }) {
  const copy = COPY[tool]
  return (
    <SignupCard
      place={copy.place}
      title={copy.title(dogName?.trim() || null)}
      text={copy.text}
      Icon={copy.Icon}
      checks={CHECKS}
      cta="Garder ses résultats"
      ctaShort="Garder ses résultats"
      retour={retour}
      reassurance
    />
  )
}
