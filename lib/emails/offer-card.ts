import { CONFIRMED_DISCOUNTS, type OfferSlug } from '@/lib/account-offers'
import { getBrandBySlug } from '@/data/brands'
import { COLORS, escapeHtml, escapeText, type EmailBlock } from './layout'

// @cdc e-mails — carte « offre du mois », même dessin que l'encart du milieu d'article
// (components/article/MidArticleCta.tsx) : bloc encre, ombre orange décalée, pastille ronde,
// accroche ambre, titre, points cochés, bouton ambre. Compatible clients mail : tableaux, styles
// en ligne ; l'ombre est faite par des bordures orange à droite et en bas (box-shadow n'est pas
// rendu partout).

const SERIF = "Georgia,'Times New Roman',serif"
const SANS = 'Arial,Helvetica,sans-serif'
const AMBER = '#FFE8B5'
const CREAM = '#FAF7F2'

/** Remise courte pour la pastille : « −30 % », « −50 % »… */
function badgeOf(discount: string): string {
  return discount.match(/[−-]\s?\d+\s?%/)?.[0].replace('-', '−').replace(/\s?%/, ' %') ?? 'Offre'
}

export function offerCard(slug: OfferSlug, utmCampaign: string): EmailBlock | null {
  const brand = getBrandBySlug(slug)
  if (!brand) return null
  const discount = CONFIRMED_DISCOUNTS[slug]
  // Pas de point coché qui répète la phrase d'accroche (tagline).
  const start = (t: string) => t.toLowerCase().split(/\s+/).slice(0, 3).join(' ')
  const checks = brand.pros.filter((p) => start(p) !== start(brand.tagline)).slice(0, 3)
  const url = brand.affiliateUrl
  const eyebrow = discount ? `Nouveau chez ${brand.name} ? ${discount}` : `L'offre partenaire du mois`
  const body = `${brand.tagline}. Idéal pour un ${brand.facts.bestFor.charAt(0).toLowerCase()}${brand.facts.bestFor.slice(1)}.`
  const checkRows = checks
    .map(
      (c) =>
        `<tr><td valign="top" style="padding:0 8px 6px 0;font-family:${SANS};font-size:15px;color:${AMBER};font-weight:bold">&#10003;</td><td style="padding:0 0 6px;font-family:${SANS};font-size:15px;line-height:1.45;color:${CREAM}">${escapeText(c)}</td></tr>`,
    )
    .join('')
  const badge = discount
    ? `<td valign="top" align="right" width="92" style="padding:0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr><td align="center" valign="middle" width="84" height="84" style="width:84px;height:84px;border-radius:42px;background:${COLORS.orange};border:3px solid ${COLORS.ink};font-family:${SERIF};font-size:22px;font-weight:bold;line-height:1;color:${COLORS.ink}">${escapeText(badgeOf(discount))}<br><span style="font-family:${SANS};font-size:10px;font-weight:bold">offre</span></td></tr></table></td>`
    : ''
  const html = `<tr><td style="padding:8px 32px 24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate">
<tr><td style="background:${COLORS.ink};border-radius:16px;border-right:8px solid ${COLORS.orange};border-bottom:8px solid ${COLORS.orange};padding:24px 22px 22px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="top" style="padding:0 8px 0 0">
<p style="margin:0 0 10px;font-family:${SANS};font-size:13px;font-weight:bold;color:${AMBER}">${escapeText(eyebrow)}</p>
<p style="margin:0;font-family:${SERIF};font-size:24px;line-height:1.15;font-weight:bold;color:${CREAM}">${escapeText(brand.name)}</p>
</td>${badge}</tr></table>
<p style="margin:14px 0 14px;font-family:${SANS};font-size:15px;line-height:1.55;color:${CREAM}">${escapeText(body)}</p>
${checkRows ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px">${checkRows}</table>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate"><tr><td style="background:${AMBER};border-radius:12px;border-right:5px solid ${COLORS.orange};border-bottom:5px solid ${COLORS.orange}">
<a href="${escapeHtml(url)}" rel="sponsored nofollow" target="_blank" style="display:inline-block;padding:14px 22px;font-family:${SANS};font-size:16px;font-weight:bold;color:${COLORS.ink};text-decoration:none">Voir l'offre ${escapeText(brand.name)}&nbsp;&rarr;</a>
</td></tr></table>
<p style="margin:16px 0 0;font-family:${SANS};font-size:12px;line-height:1.45;color:#CFC6BC">Lien partenaire&nbsp;: nous touchons une commission si tu commandes, sans surcoût pour toi.</p>
</td></tr></table>
</td></tr>`
  const text = [
    "L'OFFRE DU MOIS",
    eyebrow,
    brand.name,
    body,
    ...checks.map((c) => `- ${c}`),
    `Voir l'offre ${brand.name} : ${url}`,
    'Lien partenaire : nous touchons une commission si tu commandes, sans surcoût pour toi.',
  ].join('\n')
  void utmCampaign
  return { html, text }
}
