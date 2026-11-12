import Link from 'next/link'
import { ConsentLink } from '@/components/consent/ConsentLink'
import { Brand } from './Brand'
import { FooterGuide } from './FooterGuide'
import { FooterScanner } from './FooterScanner'

// @cdc 04-pages — pied de page V2 : liens vers les hubs (maillage) et pages légales.
const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Guides',
    links: [
      { href: '/chien/peut-manger', label: 'Que peut manger un chien ?' },
      { href: '/chien/urgences', label: 'Aliments dangereux' },
      { href: '/chien/alimentation-quotidienne', label: 'Bien nourrir son chien' },
      { href: '/chien/sante', label: 'Santé et alimentation' },
      { href: '/chien/race', label: 'Alimentation par race' },
      { href: '/guide-alimentation', label: 'Le guide gratuit (PDF)' },
      { href: '/mon-chien', label: 'Mon chien : ton espace gratuit' },
      { href: '/assistant', label: 'Poser une question à l’assistant' },
    ],
  },
  {
    title: 'Marques',
    links: [
      { href: '/chien/marque', label: 'Toutes les marques' },
      { href: '/chien/marque/dog-chef', label: 'Dog Chef' },
      { href: '/chien/marque/franklin', label: 'Franklin' },
      { href: '/chien/marque/elmut', label: 'Elmut' },
      { href: '/chien/marque/ultra-premium-direct', label: 'Ultra Premium Direct' },
      { href: '/chien/avis-marques/avis-dogfy-diet-repas-frais-chien', label: 'Dogfy Diet' },
      { href: '/comparateur', label: 'Comparateur' },
      { href: '/codes-promo', label: 'Codes promo' },
      { href: '/promo-croquettes-chien', label: 'Promo croquettes' },
    ],
  },
  {
    title: 'Outils',
    links: [
      { href: '/scanner', label: 'Scanner de croquettes' },
      { href: '/meilleures-croquettes', label: 'Classement des croquettes' },
      { href: '/choisir-croquettes', label: 'Choisir ses croquettes' },
      { href: '/meilleures-friandises', label: 'Classement des friandises' },
      { href: '/quiz', label: 'Le test de mon chien' },
      { href: '/outils/ration', label: 'Calcul de la ration' },
      { href: '/outils/age', label: 'Âge humain du chien' },
      { href: '/outils/fiche-de-garde', label: 'Fiche de garde' },
      { href: '/outils', label: 'Tous les outils' },
    ],
  },
  {
    title: 'Toutou Gourmet',
    links: [
      { href: '/a-propos', label: 'À propos' },
      { href: '/contact', label: 'Contact' },
      { href: '/mentions-legales', label: 'Mentions légales' },
      { href: '/conditions-generales', label: 'Conditions d’utilisation' },
      { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
      { href: '/plan-du-site', label: 'Plan du site' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="v2 mt-16 bg-ink text-cream">
      <div className="mx-auto max-w-page px-4 py-12 md:px-8">
        <div data-footer-offers className="mb-10 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <FooterScanner />
          <FooterGuide />
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
            <Brand onDark />
            <p className="text-sm leading-relaxed text-cream/70">
              Guides sourcés et calculateurs pour bien nourrir ton chien.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-3">
              <h2 className="m-0 font-body text-sm font-semibold text-cream">{col.title}</h2>
              <ul role="list" className="flex list-none flex-col gap-2 p-0">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-cream/75 no-underline hover:text-cream">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-cream/10 pt-6 text-xs text-cream/50 md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} Toutou Gourmet ·{' '}
            <ConsentLink className="inline-flex min-h-11 cursor-pointer items-center bg-transparent p-0 text-xs text-cream/70 underline" />
          </p>
          <p>
            {"Site indépendant financé par l'affiliation. "}
            <Link href="/a-propos#affiliation" className="text-cream/70 underline">
              Comment on travaille
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
