import Link from 'next/link'

const footerLinks = {
  'Les marques': [
    { href: '/marques/franklin', label: 'Franklin Pet Food' },
    { href: '/marques/elmut', label: 'Elmut' },
    { href: '/marques/petty-well', label: 'Petty Well' },
    { href: '/marques/dog-chef', label: 'Dog Chef' },
  ],
  'Outils': [
    { href: '/quiz', label: 'Le quiz personnalisé' },
    { href: '/comparateur', label: 'Comparateur' },
    { href: '/outils', label: 'Calculateurs & Simulateurs' },
    { href: '/blog', label: 'Le blog' },
  ],
  'Infos': [
    { href: '/a-propos', label: 'À propos' },
    { href: '/contact', label: 'Contact' },
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
    { href: '/plan-du-site', label: 'Plan du site' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[var(--text-primary)] text-white mt-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3 font-black text-xl" style={{ fontFamily: "'Fraunces', serif" }}>
              <span className="text-white">Toutou</span>
              <span className="px-2 py-0.5 rounded-[var(--radius-sm)]" style={{ background: '#FFD6E3', color: 'var(--text-primary)' }}>Gourmet</span>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Le comparateur fun et honnête de la bouffe premium pour chiens et chats en France.
            </p>
            <p className="text-xs text-white/40 mt-3">
              Site indépendant monétisé par affiliation.{' '}
              <Link href="/a-propos#affiliation" className="underline hover:text-[var(--accent-2)]">
                En savoir plus
              </Link>
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Toutou Gourmet — Tous droits réservés</p>
          <p>
            Les liens de ce site peuvent être affiliés.{' '}
            <Link href="/a-propos#affiliation" className="underline">
              Disclosure complète
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
