import { WELCOME_TOOLS } from '@/lib/emails/welcome'
import { BookPage, FillImage, fullUrl, shortUrl } from './BookPage'

// @cdc guide — dernière page : les outils du site, avec des adresses lisibles à recopier.
// Textes repris de l'e-mail de bienvenue validé (lib/emails/welcome.ts).

const MORE = [
  { title: 'Que peut manger un chien ?', path: '/chien/peut-manger', note: 'Toutes les fiches aliment par aliment.' },
  { title: 'Aliments dangereux', path: '/chien/urgences', note: 'Les gestes et les numéros, aliment par aliment.' },
  {
    title: 'Tous nos outils',
    path: '/outils',
    note: 'Les autres outils calculent son âge en années humaines, son poids idéal et le budget de sa gamelle, font le bilan « bien nourri » et proposent un quiz.',
  },
]

export function BookEnd({ number }: { number: number }) {
  const links = [...WELCOME_TOOLS.filter((t) => t.path !== '/fiche-aliments-dangereux'), ...MORE]
  return (
    <BookPage number={number}>
      <header className="bk-head">
        <p className="bk-kicker">Aller plus loin</p>
        <h2 className="bk-h2">La suite sur toutou-gourmet.com</h2>
        <p className="bk-lead">Chaque page de ce guide vient d&apos;une fiche du site. Les outils, eux, calculent pour ton chien.</p>
      </header>
      <ul className="bk-links">
        {links.map((l) => (
          <li key={l.path}>
            <b>{l.title}</b>
            <p>{l.note}</p>
            <a href={fullUrl(l.path)} className="bk-link">
              {shortUrl(l.path)}
            </a>
          </li>
        ))}
      </ul>
      <p className="bk-small">
        Une erreur, une question ? Écris-nous par le formulaire de contact : <a href={fullUrl('/contact')} className="bk-link">{shortUrl('/contact')}</a>
      </p>
      <FillImage src="/images/articles/cat-alimentation.webp" />
    </BookPage>
  )
}
