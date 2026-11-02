import Link from 'next/link'
import { SectionTitle } from './Panel'

// @cdc e-mails — section « E-mails » du tableau de bord : liens vers les aperçus privés.

const LINKS = [
  { href: '/tableau-de-bord/emails/bienvenue', title: 'E-mail de bienvenue', note: "Envoyé une fois après chaque inscription à la lettre." },
  { href: '/tableau-de-bord/emails/lettre', title: 'Lettre mensuelle', note: 'Prochaine lettre, envois programmés et annulation.' },
] as const

export function EmailsSection() {
  return (
    <>
      <SectionTitle id="emails" title="E-mails" intro="Aperçu exact de chaque e-mail, en largeur ordinateur et mobile, avec un bouton d'envoi de test." />
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="block rounded-card border border-line bg-paper p-4 no-underline hover:border-line-2">
              <span className="block font-display text-lg font-bold text-ink">{l.title}</span>
              <span className="text-sm text-ink-2">{l.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
