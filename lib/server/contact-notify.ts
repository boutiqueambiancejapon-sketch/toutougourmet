import { escapeHtml } from '@/lib/emails/layout'
import { sendNtfy } from './alerts/notify'
import type { ContactMessage } from './contact'
import { sendTransactionalEmail } from './mailer'

// @cdc contact — chaque nouveau message prévient le propriétaire (demande du 2026-11-09) : notification sur son
// téléphone (ntfy) et e-mail à CONTACT_NOTIFY_EMAIL, sinon NEWSLETTER_TEST_EMAIL, avec réponse directe au visiteur.
// Le message reste aussi dans le tableau de bord (onglet Contenu). Une panne d'envoi ne bloque jamais le formulaire.

const DASHBOARD = 'https://dashboard.toutou-gourmet.com/tableau-de-bord/contenu#messages'

export async function notifyContact(msg: ContactMessage): Promise<void> {
  const to = process.env.CONTACT_NOTIFY_EMAIL || process.env.NEWSLETTER_TEST_EMAIL
  const titre = `Message de ${msg.name} via le site`
  const lignes = [`De : ${msg.name} <${msg.email}>`, msg.page ? `Page : ${msg.page}` : '', '', msg.message].filter((l, i) => l !== '' || i === 2)
  await Promise.allSettled([
    sendNtfy({ title: titre, message: msg.message.slice(0, 300), priority: 4, tags: ['email'], click: DASHBOARD }),
    to
      ? sendTransactionalEmail({
          to,
          kind: 'contact',
          subject: titre,
          text: `${lignes.join('\n')}\n\nRéponds à cet e-mail pour lui répondre directement.\n${DASHBOARD}`,
          html: `<p><strong>${escapeHtml(msg.name)}</strong> &lt;${escapeHtml(msg.email)}&gt;${msg.page ? `<br>Page : ${escapeHtml(msg.page)}` : ''}</p><p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p><p>Réponds à cet e-mail pour lui répondre directement. <a href="${DASHBOARD}">Voir dans le tableau de bord</a></p>`,
          tags: ['contact'],
          replyTo: msg.email,
        })
      : Promise.resolve(),
  ]).then((r) => r.forEach((x) => x.status === 'rejected' && console.error('[contact] notification impossible', x.reason instanceof Error ? x.reason.message : x.reason)))
}
