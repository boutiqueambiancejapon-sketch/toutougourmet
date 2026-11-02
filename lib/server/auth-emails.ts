import type { TransactionalEmail } from './mailer'

// @cdc lot 4 — textes des e-mails de compte. HTML minimal (un lien, pas d'image) : il passe
// partout et reste lisible en texte brut. Couleurs écrites en dur : les messageries ignorent
// les variables CSS (exception à la règle « variables CSS uniquement », limitée aux e-mails).

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function layout(paragraphs: string[], cta: { label: string; url: string }, footer: string): string {
  const body = paragraphs.map((p) => `<p style="margin:0 0 16px">${escape(p)}</p>`).join('')
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#fbf6ee;font-family:Arial,sans-serif;color:#2b2118;font-size:16px;line-height:1.5">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:24px">
<p style="margin:0 0 16px;font-weight:bold">Toutou Gourmet</p>${body}
<p style="margin:0 0 24px"><a href="${escape(cta.url)}" style="display:inline-block;background:#2b2118;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">${escape(cta.label)}</a></p>
<p style="margin:0;font-size:13px;color:#6b5d50">${escape(footer)}</p>
</div></body></html>`
}

export function verificationEmail(to: string, name: string, url: string): TransactionalEmail {
  const hello = name ? `Bonjour ${name},` : 'Bonjour,'
  const lines = [hello, 'Il reste une étape pour ouvrir ton compte Toutou Gourmet : confirme ton adresse e-mail.']
  const footer = "Le lien est valable 24 heures. Si tu n'as pas créé de compte, ignore cet e-mail."
  return {
    to,
    subject: 'Confirme ton adresse e-mail',
    text: `${lines.join('\n\n')}\n\n${url}\n\n${footer}`,
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
    text: `${lines.join('\n\n')}\n\n${url}\n\n${footer}`,
    html: layout(lines, { label: 'Choisir un mot de passe', url }, footer),
  }
}
