import Link from 'next/link'
import { TOOLS, type ToolSlug } from '@/components/outils/tool-list'

// @cdc cro-carte — encart d'article vers un outil (MDX <ToolCta tool="ration" />). Le texte vient de
// la liste des outils (une seule source) ; l'outil mène ensuite au compte. Un seul par article.

const ACTION: Record<string, string> = {
  ration: 'Calculer sa ration',
  poids: 'Vérifier son poids',
  'bien-nourri': 'Faire le bilan',
  scanner: 'Scanner un paquet',
  age: 'Calculer son âge',
  budget: 'Comparer le budget',
  cout: 'Comparer sur un an',
  quiz: 'Faire le test',
  'fiche-de-garde': 'Remplir sa fiche de garde',
}

export function ToolCta({ tool }: { tool: ToolSlug }) {
  const entry = TOOLS.find((t) => t.slug === tool)
  if (!entry) return null
  const { href, question, detail, Icon } = entry
  return (
    <aside
      aria-label={question}
      data-cta={`tool-${tool}`}
      className="v2 my-8 flex flex-col gap-3 rounded-card border-2 border-ink bg-paper p-5 shadow-[4px_4px_0_var(--orange)]"
    >
      <p className="m-0 flex items-center gap-2 font-display text-xl font-black leading-tight text-ink">
        <Icon className="size-6 shrink-0" />
        {question}
      </p>
      <p className="m-0 text-base leading-relaxed text-ink-2">{detail}</p>
      <Link
        href={href}
        className="inline-flex min-h-12 items-center justify-center self-start whitespace-nowrap rounded-control bg-orange px-5 text-base font-semibold text-ink no-underline hover:underline"
      >
        {ACTION[tool] ?? "Ouvrir l'outil"}
      </Link>
    </aside>
  )
}
