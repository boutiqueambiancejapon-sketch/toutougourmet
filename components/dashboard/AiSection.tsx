import type { AiData } from '@/lib/server/dashboard-queries'
import type { Period } from '@/lib/dashboard/period'
import { AiTimeline } from './AiTimeline'
import { BarList, PlainList } from './BarList'
import { Panel, SectionTitle } from './Panel'

// @cdc tableau de bord — robots IA (scripts/lib/bots.mjs) et visiteurs envoyés par une IA.

const KIND_LABELS: Record<string, string> = {
  ai_training: 'Entraînement',
  ai_search: 'Moteur IA',
  ai_user: 'Lecture en direct',
}

export interface UnreadArticle {
  path: string
  title: string
}

interface AiSectionProps {
  data: AiData
  period: Period
  unread: UnreadArticle[]
  articleCount: number
}

const SHOWN = 12

export function AiSection({ data, period, unread, articleCount }: AiSectionProps) {
  const unreadItems = unread.map((a) => ({ key: a.path, label: a.title, href: a.path }))
  return (
    <>
      <SectionTitle
        id="ia"
        title="Robots IA"
        intro="Entraînement : collecte pour un futur modèle. Moteur IA : index d’un assistant qui cite ses sources. Lecture en direct : page ouverte au moment où quelqu’un pose une question."
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Panel title={period.bucket === 'hour' ? 'Visites par heure' : 'Visites par jour'} wide>
          <AiTimeline rows={data.timeline} hourly={period.bucket === 'hour'} />
        </Panel>
        <Panel title="Par opérateur">
          <BarList rows={data.byOperator} empty="Aucun robot IA sur la période." />
        </Panel>
        <Panel title="Par type de visite">
          <BarList rows={data.byKind} format={(k) => KIND_LABELS[k] ?? k} empty="Aucun robot IA sur la période." />
        </Panel>
        <Panel title="Pages les plus lues par les robots IA" wide>
          <BarList rows={data.topPages} empty="Aucune page lue par un robot IA sur la période." />
        </Panel>
        <Panel title="Visiteurs envoyés par une IA" hint="Lien suivi depuis une réponse de ChatGPT, Perplexity, Gemini…">
          <BarList rows={data.referrals} empty="Aucun visiteur venu d’une IA sur la période." />
        </Panel>
        <Panel title="Leurs pages d’arrivée">
          <BarList rows={data.landingPages} empty="Pas encore de page d’arrivée à classer." />
        </Panel>
        <Panel title="Erreurs vues par les robots IA" hint="Code HTTP puis adresse. Une 404 ici est une page citée qui n’existe plus." wide>
          <BarList rows={data.errors} empty="Aucune erreur servie à un robot IA sur la période." />
        </Panel>
        <Panel
          title="Articles jamais lus par un robot IA"
          hint={`Depuis le début de la mesure : ${unread.length} sur ${articleCount} articles.`}
          wide
        >
          <PlainList items={unreadItems.slice(0, SHOWN)} empty="Chaque article a reçu au moins une visite de robot IA." />
          {unreadItems.length > SHOWN && (
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-ink-2">Voir les {unreadItems.length - SHOWN} autres</summary>
              <PlainList items={unreadItems.slice(SHOWN)} empty="" />
            </details>
          )}
        </Panel>
      </div>
    </>
  )
}
