import { COLORS, button, escapeText, heading, label, paragraph, renderEmail, type EmailBlock, type RenderedEmail } from './layout'
import { addDays } from './schedule'
import { NIGHT_LABELS, nightOk } from '@/lib/server/night-logs'
import type { Pair, Row, WeeklyDigestData } from '@/lib/server/weekly-digest-data'

// @cdc e-mails — résumé hebdomadaire envoyé au propriétaire (OWNER_EMAIL), gabarit commun de
// layout.ts sans lien de désinscription. Chiffres de lib/server/weekly-digest-data.ts.

const SANS = 'Arial,Helvetica,sans-serif'
const DASHBOARD_URL = 'https://dashboard.toutou-gourmet.com/tableau-de-bord'
const nf = new Intl.NumberFormat('fr-FR')
const n = (v: number) => nf.format(v)
const dayLong = (d: string) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`))
const dayShort = (d: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`)).replace(/^1 /, '1er ')
const pct = (v: number) => `${Math.round(v * 100)} %`
const views = (v: number) => `${n(v)} page${v > 1 ? 's' : ''} vue${v > 1 ? 's' : ''}`

interface StatRow {
  label: string
  value: string
  note?: string
}

/** Tableau à deux colonnes : libellé à gauche, valeur (et note grise) à droite. */
function statTable(items: StatRow[]): EmailBlock {
  const tr = items
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${COLORS.line};font-family:${SANS};font-size:15px;color:${COLORS.ink}">${escapeText(r.label)}</td>` +
        `<td align="right" style="padding:8px 0 8px 12px;border-bottom:1px solid ${COLORS.line};font-family:${SANS};font-size:15px;color:${COLORS.ink};white-space:nowrap"><b>${escapeText(r.value)}</b>` +
        (r.note ? `<br><span style="font-size:13px;color:${COLORS.ink2}">${escapeText(r.note)}</span>` : '') +
        `</td></tr>`,
    )
    .join('')
  return {
    html: `<tr><td style="padding:0 32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${tr}</table></td></tr>`,
    text: items.map((r) => `- ${r.label} : ${r.value}${r.note ? ` (${r.note})` : ''}`).join('\n'),
  }
}

/** « +12 % sur la semaine d'avant (1 100) » */
function evolution({ current, previous }: Pair): string {
  if (previous === 0) return "0 la semaine d'avant"
  const delta = Math.round(((current - previous) / previous) * 100)
  return `${delta > 0 ? '+' : ''}${delta} % sur la semaine d'avant (${n(previous)})`
}

const pairRow = (lbl: string, p: Pair): StatRow => ({ label: lbl, value: n(p.current), note: evolution(p) })
const listRows = (rows: Row[]): StatRow[] => rows.map((r) => ({ label: r.label, value: n(r.value) }))

function listOrEmpty(rows: Row[], empty: string): EmailBlock {
  return rows.length > 0 ? statTable(listRows(rows)) : paragraph(empty, true)
}

function serverBlocks(d: WeeklyDigestData): EmailBlock[] {
  const { host, backup, alerts } = d.server
  const items: StatRow[] = []
  if (host.disk) items.push({ label: 'Disque libre', value: pct(1 - host.disk.used / host.disk.total) })
  if (host.memory) items.push({ label: 'Mémoire disponible', value: pct(1 - host.memory.used / host.memory.total) })
  if (host.load) items.push({ label: 'Charge sur 15 minutes', value: pct(host.load[2] / host.cores), note: `${host.cores} cœurs` })
  const backupDate = backup.latest ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(new Date(backup.latest)) : null
  items.push({ label: 'Dernière sauvegarde', value: backupDate ?? (backup.readable ? 'aucune' : 'dossier illisible') })
  const notes = alerts.length > 0 ? alerts.map((a) => paragraph(a)) : [paragraph("Rien à signaler au moment de l'envoi.", true)]
  return [statTable(items), ...notes]
}

export function weeklyDigestEmail(d: WeeklyDigestData): RenderedEmail {
  const end = addDays(d.weekStart, 6)
  const sameMonth = d.weekStart.slice(0, 7) === end.slice(0, 7)
  const span = `du ${sameMonth ? dayShort(d.weekStart).split(' ')[0] : dayShort(d.weekStart)} au ${dayShort(end)}`
  const okNights = d.nights.filter((x) => nightOk(x.status)).length
  const clicks = d.affiliateClicks.current
  const blocks: EmailBlock[] = [
    heading(`Semaine ${span}`, 1),
    paragraph(`${views(d.pageViews.current)}, ${evolution(d.pageViews)}.`),
    label('Audience'),
    statTable([pairRow('Pages vues', d.pageViews), pairRow('Inscriptions à la lettre', d.newsletter), pairRow('Comptes créés', d.accounts), pairRow('Premium activés', d.premium)]),
    label('Pages les plus vues'),
    listOrEmpty(d.topPages, 'Aucune page vue enregistrée cette semaine.'),
    label('Clics vers les partenaires'),
    paragraph(`${n(clicks)} clic${clicks > 1 ? 's' : ''}, ${evolution(d.affiliateClicks)}.`),
    ...(d.clicksByBrand.length > 0 ? [statTable(listRows(d.clicksByBrand))] : []),
    label('Scanner de croquettes'),
    statTable([
      pairRow('Étiquettes photographiées', d.scansPhoto),
      pairRow('Codes-barres scannés', d.scansBarcode),
      { label: 'Fiches à relire', value: n(d.toReview.total), note: `dont ${n(d.toReview.newThisWeek)} créées cette semaine` },
      { label: 'Signalements non traités', value: n(d.openReports) },
    ]),
    label("Robots d'IA"),
    listOrEmpty(d.aiByOperator, "Aucune visite de robot d'IA relevée cette semaine."),
    label('Tâches de nuit'),
    paragraph(`${okNights} passage${okNights > 1 ? 's' : ''} réussi${okNights > 1 ? 's' : ''} sur 7.`),
    statTable(d.nights.map((x) => ({ label: dayLong(x.date), value: NIGHT_LABELS[x.status] }))),
    label('Serveur'),
    ...serverBlocks(d),
    button('Ouvrir le tableau de bord', DASHBOARD_URL),
  ]
  return renderEmail({
    subject: `Semaine ${span} : ${views(d.pageViews.current)}`,
    preheader: `${views(d.pageViews.current)}, ${n(clicks)} clic${clicks > 1 ? 's' : ''} partenaire${clicks > 1 ? 's' : ''}, ${okNights} nuit${okNights > 1 ? 's' : ''} réussie${okNights > 1 ? 's' : ''} sur 7.`,
    kicker: 'Résumé de la semaine',
    blocks,
    reason: "Résumé envoyé chaque lundi matin à l'adresse du propriétaire du site (OWNER_EMAIL).",
  })
}
