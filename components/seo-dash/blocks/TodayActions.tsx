import Link from 'next/link'
import type { Action } from '@/lib/seo-dash/actions'
import { markActionDone } from '@/app/(admin)/tableau-de-bord/seo-actions'
import { Card, Empty } from '../ui/Card'

// @cdc tableau de bord SEO — les 5 actions du jour, classées par clics en jeu ; « Fait » les range 30 jours.

export function TodayActions({ actions }: { actions: Action[] }) {
  return (
    <Card title="Les 5 actions du jour" desc="Calculées à partir de Google, des journaux du serveur et du plan du site, classées par clics en jeu. « Fait » range une action pour 30 jours.">
      {actions.length ? (
        <ol className="sd-acts">
          {actions.map((a) => (
            <li key={a.key}>
              <div>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
                <p className="sd-why">{a.why}</p>
              </div>
              <div className="sd-go">
                <Link className="sd-btn" href={a.href}>
                  {a.hrefLabel}
                </Link>
                <form action={markActionDone}>
                  <input type="hidden" name="key" value={a.key} />
                  <input type="hidden" name="title" value={a.title} />
                  <button className="sd-btn" type="submit">
                    Fait
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <Empty>Rien d’urgent aujourd’hui : aucune action ne ressort des chiffres.</Empty>
      )}
    </Card>
  )
}
