import { NOTE_LABEL, type NoteKind } from '@/lib/seo-dash/chart-types'
import type { JournalItem } from '@/lib/seo-dash/server/notes'
import { dayLabel } from '@/lib/seo-dash/format'
import { removeNote, saveNote } from '@/app/(admin)/tableau-de-bord/seo-actions'
import { Card, Empty } from '../ui/Card'

// @cdc tableau de bord SEO — ajouter une note (elle apparaît en pastille sur toutes les courbes) et le journal.

const KINDS: NoteKind[] = ['tech', 'pub', 'maj', 'google']
const SOURCE: Record<JournalItem['source'], string> = { manuel: 'note', auto: 'automatique', journal: 'automatique', articles: 'articles' }

export function NoteForm({ today }: { today: string }) {
  return (
    <Card title="Ajouter une note">
      <form action={saveNote} className="sd-form">
        <input type="date" name="day" defaultValue={today} aria-label="Date" required />
        <input type="text" name="text" placeholder="Ce qui a changé (ex. : nouveau menu)" maxLength={200} aria-label="Ce qui a changé" required />
        <fieldset className="sd-seg" aria-label="Genre">
          {KINDS.map((k, i) => (
            <label key={k}>
              <input type="radio" name="kind" value={k} defaultChecked={i === 0} />
              {NOTE_LABEL[k]}
            </label>
          ))}
        </fieldset>
        <div>
          <button className="sd-btn sd-pri" type="submit">
            Enregistrer
          </button>
        </div>
        <p className="sd-small sd-muted">Les publications d’articles, les déploiements et les réécritures s’ajoutent seuls.</p>
      </form>
    </Card>
  )
}

export function Journal({ items }: { items: JournalItem[] }) {
  return (
    <Card title="Journal" desc="Notes ajoutées à la main ou par les tâches automatiques">
      {items.length ? (
        <ul className="sd-list">
          {items.slice(0, 30).map((n, i) => (
            <li key={`${n.day}-${n.kind}-${i}`}>
              <span className={`sd-pin ${n.kind}`} aria-hidden="true" />
              <div>
                {n.text}
                <div className="m">
                  {dayLabel(n.day)} · {NOTE_LABEL[n.kind]} · {SOURCE[n.source]}
                  {n.source === 'manuel' && n.id ? (
                    <form action={removeNote} className="sd-inline">
                      <input type="hidden" name="id" value={n.id} />
                      <button type="submit" className="sd-linkbtn">
                        retirer
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Aucune note sur la période.</Empty>
      )}
    </Card>
  )
}
