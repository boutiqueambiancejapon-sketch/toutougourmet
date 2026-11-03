import Link from 'next/link'

// @cdc e-mails — liens de l’onglet « E-mails » du tableau de bord : liens vers les aperçus privés.

const LINKS = [
  { href: '/tableau-de-bord/emails/bienvenue', title: 'E-mail de bienvenue', note: 'Envoyé une fois après chaque inscription à la lettre.' },
  { href: '/tableau-de-bord/emails/lettre', title: 'Lettre mensuelle', note: 'Prochaine lettre, envois programmés et annulation.' },
  { href: '/tableau-de-bord/emails/hebdo', title: 'Résumé hebdomadaire', note: 'Chiffres de la semaine, envoyés au propriétaire chaque lundi à 8 h 40.' },
] as const

export function EmailLinks() {
  return (
    <ul className="m-0 mt-6 grid list-none gap-3 p-0 md:grid-cols-2">
      {LINKS.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="block rounded-card border border-line bg-paper p-4 no-underline hover:border-line-2">
            <span className="block font-display text-lg font-bold text-ink">{l.title}</span>
            <span className="text-sm text-ink-2">{l.note}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
