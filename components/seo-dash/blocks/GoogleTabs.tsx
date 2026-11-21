// @cdc tableau de bord SEO — sommaire de l'écran Google : ancres vers chaque partie de la même page.

const TABS = [
  ['#vue', 'Vue d’ensemble'],
  ['#requetes', 'Requêtes et pages'],
  ['#opportunites', 'Opportunités'],
  ['#indexation', 'Indexation'],
] as const

export function GoogleTabs() {
  return (
    <nav className="sd-tabs" aria-label="Parties de l’écran Google">
      {TABS.map(([href, label], i) => (
        <a key={href} href={href} aria-current={i === 0 ? 'true' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  )
}
