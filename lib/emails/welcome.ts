import { button, linkItem, paragraph, renderEmail, siteUrl, type RenderedEmail } from './layout'

// @cdc e-mails — e-mail de bienvenue après une inscription à la lettre (voix de Milo, validée par le
// propriétaire le 2026-11-04, plus le lien vers tous les outils). Envoyé une fois par adresse.

export const WELCOME_SUBJECT = 'Bienvenue sur Toutou Gourmet : 3 outils pour ton chien'

/** Les trois outils les plus utilisés (repris aussi par la dernière page du guide PDF). */
export const WELCOME_TOOLS = [
  { title: 'La ration au gramme près', path: '/outils/ration', note: 'Selon son poids, son âge et son activité.' },
  { title: 'La liste des aliments dangereux à coller sur le frigo', path: '/fiche-aliments-dangereux', note: 'Une page à imprimer.' },
  { title: 'Le scanner de croquettes', path: '/scanner', note: "Photographie l'étiquette du paquet, tu obtiens une note sur 100." },
] as const

export function welcomeEmail(unsubscribeUrl: string): RenderedEmail {
  return renderEmail({
    subject: WELCOME_SUBJECT,
    preheader: 'Je renifle tout, je refuse la moitié, et j\'ai un avis sur la gamelle de ton chien.',
    blocks: [
      paragraph("Salut, moi c'est Milo, Shiba Inu et mascotte de Toutou Gourmet. Je renifle tout, je refuse la moitié de ce qu'on me sert, et j'ai donc un avis sur la gamelle de ton chien."),
      paragraph("Merci de t'être inscrit. Je t'envoie quelques conseils les premiers jours, puis une lettre par mois avec les nouveaux guides et les offres qui valent le coup."),
      paragraph('En attendant, trois outils à garder sous la patte :'),
      ...WELCOME_TOOLS.map((t) => linkItem(t.title, siteUrl(t.path), t.note)),
      button('Voir tous les outils', siteUrl('/outils')),
      paragraph('Milo'),
    ],
    unsubscribeUrl,
    reason: "Tu reçois cet e-mail parce que tu t'es inscrit à la lettre de Toutou Gourmet.",
  })
}
