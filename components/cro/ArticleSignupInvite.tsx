'use client'

import { IconBowl, IconScale, IconScan, type IconProps } from '@/components/icons'
import type { ArticleSignupTopic } from '@/lib/article-signup'
import type { SignupPlace } from '@/lib/signup-places'
import { SignupCard } from './SignupCard'

// @cdc CRO compte (maquette 3A) — encart de fin d'article, avant la FAQ (posé par le plugin
// remarkSignupInvite). Le texte dépend du sujet de l'article ; masqué quand un compte est connecté.

interface TopicCopy {
  place: SignupPlace
  title: string
  text: string
  cta: string
  ctaShort?: string
  retour: string
  Icon: (props: IconProps) => React.JSX.Element
}

const WEIGHT_TEXT = 'Note son poids chaque semaine : on te prévient si la courbe dérape et sa ration se recalcule.'

const COPY: Record<ArticleSignupTopic, TopicCopy> = {
  kilos: {
    place: 'article-poids',
    title: 'Ton chien a des kilos en trop ?',
    text: WEIGHT_TEXT,
    cta: 'Suivre son poids gratuitement',
    ctaShort: 'Suivre son poids',
    retour: '/compte/chien/nouveau',
    Icon: IconScale,
  },
  poids: {
    place: 'article-poids',
    title: 'Suis son poids semaine après semaine',
    text: WEIGHT_TEXT,
    cta: 'Suivre son poids gratuitement',
    ctaShort: 'Suivre son poids',
    retour: '/compte/chien/nouveau',
    Icon: IconScale,
  },
  croquettes: {
    place: 'article-croquettes',
    title: 'Scanne ses croquettes, 5 analyses par mois offertes',
    text: 'Photographie l’étiquette du sac : une note sur 100, critère par critère, et chaque analyse reste dans ton compte.',
    cta: 'Créer mon compte gratuit',
    ctaShort: 'Créer mon compte',
    retour: '/scanner',
    Icon: IconScan,
  },
  aliments: {
    place: 'article-aliments',
    title: 'Enregistre ton chien, la ration se calcule toute seule dans chaque outil',
    text: 'Son poids, son âge et son activité remplissent la ration, le poids de forme et les portions des articles «\u00a0peut-il manger\u00a0».',
    cta: 'Enregistrer mon chien',
    retour: '/compte/chien/nouveau',
    Icon: IconBowl,
  },
}

export function ArticleSignupInvite({ topic }: { topic: ArticleSignupTopic }) {
  const copy = COPY[topic]
  if (!copy) return null
  return (
    <SignupCard
      place={copy.place}
      title={copy.title}
      text={copy.text}
      cta={copy.cta}
      ctaShort={copy.ctaShort}
      retour={copy.retour}
      Icon={copy.Icon}
      className="my-8"
    />
  )
}
