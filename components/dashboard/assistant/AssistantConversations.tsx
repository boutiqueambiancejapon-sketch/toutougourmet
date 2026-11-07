import type { AssistantSuivi } from '@/lib/server/dashboard-assistant'
import { Card } from '../account/parts'
import { SORTES } from './AssistantNumbers'

// @cdc tableau de bord — dernières conversations de Milo (sans compte ni adresse) et questions sans article.

const quand = (d: Date) => new Date(d).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const GRAVITE: Record<string, string> = { urgence: 'Urgence', veterinaire: 'Vétérinaire' }

export function AssistantConversations({ s }: { s: AssistantSuivi }) {
  return (
    <Card title="Dernières conversations">
      {s.dernieres.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {s.dernieres.map((c, i) => (
            <li key={i} className="rounded-box border border-line p-2.5">
              <details>
                <summary className="cursor-pointer list-none text-sm">
                  <span className="block font-semibold text-ink [overflow-wrap:anywhere]">{c.question}</span>
                  <span className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-ink-2">
                    <span>{quand(c.at)}</span>
                    <span>{SORTES[c.kind ?? 'ancienne'] ?? c.kind}</span>
                    {c.gravite && GRAVITE[c.gravite] ? <span className="font-semibold text-rose-ink">{GRAVITE[c.gravite]}</span> : null}
                    {c.produits ? <span>{`${c.produits} produits proposés`}</span> : null}
                    {c.lieu === 'fenetre' ? <span>petite fenêtre</span> : null}
                  </span>
                </summary>
                {c.reponse ? <p className="m-0 mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-2">{c.reponse}</p> : null}
              </details>
            </li>
          ))}
        </ul>
      ) : <p className="m-0 text-sm text-ink-2">Aucune conversation pour l’instant.</p>}
    </Card>
  )
}

export function AssistantIdees({ s }: { s: AssistantSuivi }) {
  return (
    <Card title="Questions sans article (30 jours)">
      <p className="m-0 text-xs text-ink-2">Milo a répondu sans s’appuyer sur un article : des idées pour les prochains.</p>
      {s.idees.length ? (
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-ink">
          {s.idees.map((q, i) => <li key={i} className="[overflow-wrap:anywhere]">{q.question}</li>)}
        </ul>
      ) : <p className="m-0 text-sm text-ink-2">Rien pour l’instant.</p>}
    </Card>
  )
}
