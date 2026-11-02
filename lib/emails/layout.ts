import { SITE_URL } from '@/lib/i18n/config'

// @cdc e-mails — gabarit commun des e-mails de la lettre (bienvenue, lettre mensuelle). HTML pour
// messageries : tableaux, styles en ligne, 600 px, images en URL absolues, version texte jointe.
// Couleurs écrites en dur : les messageries ignorent les variables CSS (exception à la règle
// « variables CSS uniquement », limitée aux e-mails, comme lib/server/auth-emails.ts). Valeurs
// reprises des tokens de app/globals.css. Pas de boîte de réception : on renvoie vers le formulaire.

export const COLORS = {
  page: '#F5F0EA', // --cream-2
  card: '#FFFFFF', // --white
  soft: '#FAFAF8', // --cream
  ink: '#1A1109', // --ink
  ink2: '#4A3728', // --ink-2
  line: '#E2D5C8', // --line
  orange: '#E8622A', // --orange
  orangeInk: '#B4441A', // --orange-ink
  greenBg: '#E8F5EE',
  greenInk: '#1A7A47',
  amberBg: '#FFF8E8',
  amberInk: '#8B5A0F',
  roseBg: '#FFF0F5',
  roseInk: '#8B1A4A',
} as const

const SERIF = "Georgia,'Times New Roman',serif"
const SANS = 'Arial,Helvetica,sans-serif'

export const CONTACT_URL = `${SITE_URL}/contact`

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/** Un bloc d'e-mail : son HTML (une ou plusieurs lignes de tableau) et sa version texte. */
export interface EmailBlock {
  html: string
  text: string
}

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Texte affiché : échappé, espaces insécables avant : ; ? ! et à l'intérieur des guillemets. */
export const escapeText = (s: string): string =>
  escapeHtml(s.replace(/ ([:;?!»])/g, '\u00A0$1').replace(/« /g, '«\u00A0'))

/** URL absolue du site pour un chemin (« /outils » → https://www.toutou-gourmet.com/outils). */
export const siteUrl = (path: string): string => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

const cell = (inner: string, padding = '0 32px 16px'): string =>
  `<tr><td style="padding:${padding};font-family:${SANS};font-size:16px;line-height:1.55;color:${COLORS.ink}">${inner}</td></tr>`

export function heading(text: string, level: 1 | 2 = 2): EmailBlock {
  const size = level === 1 ? 26 : 21
  const pad = level === 1 ? '8px 32px 12px' : '20px 32px 8px'
  return {
    html: `<tr><td style="padding:${pad}"><h${level} style="margin:0;font-family:${SERIF};font-size:${size}px;line-height:1.25;font-weight:bold;color:${COLORS.ink}">${escapeText(text)}</h${level}></td></tr>`,
    text: level === 1 ? text.toUpperCase() : `## ${text}`,
  }
}

/** Libellé de section, petit et orange (« Le guide du mois »). */
export function label(text: string): EmailBlock {
  return {
    html: `<tr><td style="padding:20px 32px 6px;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:0.8px;text-transform:uppercase;color:${COLORS.orangeInk}">${escapeText(text)}</td></tr>`,
    text: `== ${text.toUpperCase()} ==`,
  }
}

export function paragraph(text: string, muted = false): EmailBlock {
  const color = muted ? COLORS.ink2 : COLORS.ink
  return { html: cell(`<p style="margin:0;color:${color}">${escapeText(text)}</p>`), text }
}

export function button(label: string, url: string, rel?: string): EmailBlock {
  const relAttr = rel ? ` rel="${rel}"` : ''
  const html = `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-radius:999px;background:${COLORS.orange}"><a href="${escapeHtml(url)}"${relAttr} target="_blank" style="display:inline-block;padding:12px 24px;font-family:${SANS};font-size:16px;font-weight:bold;color:${COLORS.ink};text-decoration:none;border-radius:999px">${escapeText(label)}</a></td></tr></table>`
  return { html: cell(html, '4px 32px 20px'), text: `${label} : ${url}` }
}

/** Élément de liste : titre en lien, ligne d'explication facultative, pastille facultative. */
export function linkItem(title: string, url: string, note?: string, pill?: { label: string; bg: string; ink: string }): EmailBlock {
  const pillHtml = pill
    ? `<span style="display:inline-block;margin:0 0 6px;padding:2px 10px;border-radius:999px;background:${pill.bg};color:${pill.ink};font-size:13px;font-weight:bold">${escapeText(pill.label)}</span><br>`
    : ''
  const noteHtml = note ? `<br><span style="font-size:15px;color:${COLORS.ink2}">${escapeText(note)}</span>` : ''
  const html = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:14px 16px;border:1px solid ${COLORS.line};border-radius:12px;background:${COLORS.soft};font-family:${SANS};font-size:16px;line-height:1.45">${pillHtml}<a href="${escapeHtml(url)}" target="_blank" style="color:${COLORS.ink};font-weight:bold;text-decoration:underline">${escapeText(title)}</a>${noteHtml}</td></tr></table>`
  const text = [`- ${pill ? `[${pill.label}] ` : ''}${title}`, note ? `  ${note}` : '', `  ${url}`].filter(Boolean).join('\n')
  return { html: cell(html, '0 32px 12px'), text }
}

export function image(src: string, alt: string, href: string, height: number): EmailBlock {
  const html = `<a href="${escapeHtml(href)}" target="_blank"><img src="${escapeHtml(src)}" width="536" height="${height}" alt="${escapeHtml(alt)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:12px"></a>`
  return { html: cell(html, '4px 32px 16px'), text: '' }
}

export function divider(): EmailBlock {
  return {
    html: `<tr><td style="padding:8px 32px"><div style="height:1px;line-height:1px;font-size:1px;background:${COLORS.line}">&nbsp;</div></td></tr>`,
    text: '',
  }
}

/** Petite mention en dessous d'un bloc (lien partenaire, source). */
export function smallPrint(text: string): EmailBlock {
  return { html: cell(`<p style="margin:0;font-size:13px;color:${COLORS.ink2}">${escapeText(text)}</p>`, '0 32px 16px'), text }
}

interface ShellOptions {
  subject: string
  preheader: string
  /** Ligne sous l'en-tête (ex. « Lettre de novembre 2026 ») */
  kicker?: string
  blocks: EmailBlock[]
  /** Lien de désinscription : URL signée, ou balise Brevo {{ unsubscribe }} pour une campagne.
   *  Absent : e-mail interne au propriétaire (résumé hebdomadaire), pied réduit à la raison. */
  unsubscribeUrl?: string
  /** Raison de l'envoi, affichée dans le pied */
  reason: string
}

const LOGO_HTML = `<a href="${SITE_URL}" target="_blank" style="text-decoration:none;font-family:${SERIF};font-size:28px;font-weight:bold;letter-spacing:-0.5px"><span style="color:${COLORS.ink}">Toutou</span> <span style="color:${COLORS.orange}">Gourmet</span></a>`

/** Assemble l'e-mail complet : en-tête, blocs, pied (contact + désinscription), version texte. */
export function renderEmail(o: ShellOptions): RenderedEmail {
  const kicker = o.kicker
    ? `<br><span style="font-family:${SANS};font-size:13px;color:${COLORS.ink2};letter-spacing:0.5px;text-transform:uppercase">${escapeText(o.kicker)}</span>`
    : ''
  const footerLines = o.unsubscribeUrl
    ? `<p style="margin:0 0 8px">Pour nous écrire, passe par le formulaire de contact du site&nbsp;: <a href="${CONTACT_URL}" target="_blank" style="color:${COLORS.ink2}">toutou-gourmet.com/contact</a></p>
<p style="margin:0 0 8px">${escapeText(o.reason)}</p>
<p style="margin:0"><a href="${escapeHtml(o.unsubscribeUrl)}" target="_blank" style="color:${COLORS.ink2}">Se désinscrire</a></p>`
    : `<p style="margin:0">${escapeText(o.reason)}</p>`
  const footer = `<tr><td style="padding:20px 32px 28px;font-family:${SANS};font-size:13px;line-height:1.5;color:${COLORS.ink2}">
${footerLines}
</td></tr>`
  const html = `<!doctype html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>${escapeHtml(o.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.page};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${COLORS.page}">${escapeText(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.page}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${COLORS.card};border:1px solid ${COLORS.line};border-radius:16px">
<tr><td style="padding:28px 32px 12px">${LOGO_HTML}${kicker}</td></tr>
${o.blocks.map((b) => b.html).join('\n')}
${divider().html}
${footer}
</table>
</td></tr>
</table>
</body>
</html>`
  const text = [
    'Toutou Gourmet',
    o.kicker ?? '',
    ...o.blocks.map((b) => b.text),
    '--',
    o.unsubscribeUrl ? `Pour nous écrire, passe par le formulaire de contact du site : ${CONTACT_URL}` : '',
    o.reason,
    o.unsubscribeUrl ? `Se désinscrire : ${o.unsubscribeUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  return { subject: o.subject, html, text }
}
