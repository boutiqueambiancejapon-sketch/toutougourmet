import { button, heading, linkItem, paragraph, renderEmail, siteUrl, type RenderedEmail } from './layout'

// @cdc e-mails — e-mail de bienvenue après une inscription à la lettre (texte validé par le
// propriétaire, repris tel quel, plus le lien vers tous les outils). Envoyé une fois par adresse.

export const WELCOME_SUBJECT = 'Bienvenue chez Toutou Gourmet : 3 choses à garder sous la main'

/** Les trois outils les plus utilisés (repris aussi par la dernière page du guide PDF). */
export const WELCOME_TOOLS = [
  { title: 'La ration au gramme près', path: '/outils/ration', note: 'Selon son poids, son âge et son activité.' },
  { title: 'La liste des aliments dangereux à coller sur le frigo', path: '/fiche-aliments-dangereux', note: 'Une page à imprimer.' },
  { title: 'Le scanner de croquettes', path: '/scanner', note: "Photographie l'étiquette du paquet, tu obtiens une note sur 100." },
] as const

export function welcomeEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: WELCOME_SUBJECT,
    preheader: 'Un e-mail par mois, pas plus. En attendant, trois outils à garder sous la main.',
    blocks: [
      heading('Bienvenue chez Toutou Gourmet', 1),
      paragraph("Merci de t'être inscrit. Tu recevras un e-mail par mois, pas plus : les nouveaux guides et les offres des marques partenaires quand elles valent le coup."),
      paragraph('En attendant, trois outils que les maîtres utilisent le plus :'),
      ...WELCOME_TOOLS.map((t) => linkItem(t.title, siteUrl(t.path), t.note)),
      paragraph('Les autres outils calculent son âge en années humaines, son poids idéal et le budget de sa gamelle, font le bilan « bien nourri » et proposent un quiz.'),
      button('Tous nos outils', siteUrl('/outils')),
      paragraph("L'équipe Toutou Gourmet"),
    ],
    unsubscribeUrl,
    reason: "Tu reçois cet e-mail parce que tu t'es inscrit à la lettre de Toutou Gourmet.",
  })
}
