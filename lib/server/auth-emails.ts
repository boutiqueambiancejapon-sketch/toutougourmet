import { SITE_URL } from '@/lib/i18n/config'
import type { TransactionalEmail } from './mailer'

// @cdc lot 4 — textes des e-mails de compte. HTML minimal (un lien, pas d'image) : il passe
// partout et reste lisible en texte brut. Couleurs écrites en dur : les messageries ignorent
// les variables CSS (exception à la règle « variables CSS uniquement », limitée aux e-mails).
// Pas de boîte de réception sur le domaine : chaque e-mail renvoie vers le formulaire de contact.

const CONTACT_URL = `${SITE_URL}/contact`
const CONTACT_LINE = 'Pour nous écrire, passe par le formulaire de contact du site :'

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(paragraphs: string[], cta: { label: string; url: string } | null, footer: string): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px">${escape(p)}</p>`).join('')
  const button = cta
    ? `<p style="margin:0 0 24px"><a href="${escape(cta.url)}" style="display:inline-block;background:#2b2118;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">${escape(cta.label)}</a></p>`
    : ''
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#fbf6ee;font-family:Arial,sans-serif;color:#2b2118;font-size:16px;line-height:1.5">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px">
<p style="margin:0 0 16px;font-weight:bold">Toutou Gourmet</p>${body}${button}
<p style="margin:0 0 12px;font-size:13px;color:#6b5d50">${escape(footer)}</p>
<p style="margin:0;font-size:13px;color:#6b5d50">${escape(CONTACT_LINE)} <a href="${CONTACT_URL}" style="color:#6b5d50">${CONTACT_URL.replace('https://', '')}</a></p>
</div></body></html>`
}

/** Version texte : paragraphes, lien éventuel, mention de fin, renvoi au formulaire de contact. */
function plain(paragraphs: string[], url: string | null, footer: string): string {
  return [...paragraphs, ...(url ? [url] : []), footer, `${CONTACT_LINE} ${CONTACT_URL}`].join('\n\n')
}

export function verificationEmail(to: string, name: string, url: string): TransactionalEmail {
  const hello = name ? `Bonjour ${name},` : 'Bonjour,'
  const lines = [hello, 'Ton compte Toutou Gourmet est ouvert. Confirme ton adresse e-mail pour recevoir ses alertes et garder ton compte.']
  const footer = "Le lien est valable 24 heures. Si tu n'as pas créé de compte, ignore cet e-mail."
  return {
    to,
    subject: 'Confirme ton adresse e-mail',
    kind: 'confirmation',
    text: plain(lines, url, footer),
    html: layout(lines, { label: 'Confirmer mon adresse', url }, footer),
  }
}

/** Rappel unique, 24 heures après l'inscription (scripts/rappel-confirmation.ts). */
export function verificationReminderEmail(to: string, name: string, url: string): TransactionalEmail {
  const hello = name ? `Bonjour ${name},` : 'Bonjour,'
  const lines = [hello, "Ton adresse n'est pas encore confirmée. Un clic suffit pour garder ton compte et recevoir ses alertes. Sans confirmation, il sera supprimé 30 jours après sa création."]
  const footer = "Le lien est valable 7 jours, et on ne te relancera pas. Si tu n'as pas créé de compte, ignore cet e-mail."
  return {
    to,
    subject: 'Il te reste un clic pour confirmer ton adresse',
    kind: 'confirmation-rappel',
    text: plain(lines, url, footer),
    html: layout(lines, { label: 'Confirmer mon adresse', url }, footer),
  }
}

export function resetPasswordEmail(to: string, name: string, url: string): TransactionalEmail {
  const hello = name ? `Bonjour ${name},` : 'Bonjour,'
  const lines = [hello, 'Tu as demandé à changer le mot de passe de ton compte Toutou Gourmet. Choisis-en un nouveau avec ce lien.']
  const footer = "Le lien est valable une heure. Si la demande ne vient pas de toi, ignore cet e-mail : ton mot de passe ne change pas."
  return {
    to,
    subject: 'Nouveau mot de passe',
    kind: 'mot-de-passe',
    text: plain(lines, url, footer),
    html: layout(lines, { label: 'Choisir un mot de passe', url }, footer),
  }
}

export function accountDeletedEmail(to: string, name: string): TransactionalEmail {
  const hello = name ? `Bonjour ${name},` : 'Bonjour,'
  const lines = [
    hello,
    "Ton compte Toutou Gourmet est supprimé, comme tu l'as demandé. Ton adresse e-mail, ton mot de passe, les profils de tes chiens et leurs pesées sont effacés de notre base.",
  ]
  const footer = "Cet e-mail est le dernier que tu reçois au sujet de ce compte. Si tu changes d'avis, tu peux en ouvrir un nouveau quand tu veux."
  return {
    to,
    subject: 'Ton compte est supprimé',
    kind: 'suppression',
    text: plain(lines, null, footer),
    html: layout(lines, null, footer),
  }
}
