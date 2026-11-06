#!/usr/bin/env node
// Classe les articles du plus lourd au plus léger, pour le nettoyage du ton de la nuit : organismes cités dans le texte,
// formules de rapport et tirets cadratins, pour 1 000 mots, hors bloc « Sources ». Un chiffre haut veut dire « à relire ».
// Usage : node scripts/tone-score.mjs [nombre]   (articles modifiés ce jour ou la veille exclus)
import { readdirSync, readFileSync } from 'node:fs'

const ORGANISMES = /FEDIAF|WSAVA|\bAnses\b|ANSES|\bFDA\b|EFSA|\bNRC\b|National Research Council|Merck|USDA|\bFAO\b|\bOMS\b|Santévet|Petscare|ASPCA|manuel vétérinaire|base américaine|équipe (?:américaine|hongroise|texane|britannique)|\bAAFCO\b|\bAKC\b/g
const RAPPORT = /lien de cause|ne prouve|reste ouverte|échantillon|d'après l'annuaire|selon l[ae] |selon les |\bDL50\b|IC 95|PMID|DOI|et al\.|cas rapportés|chiens témoins|une étude a (?:comparé|mesuré|analysé)|sur matière sèche/g
const compte = (texte, motif) => (texte.match(motif) ?? []).length
const jour = (decalage) => new Date(Date.now() - decalage * 86_400_000).toISOString().slice(0, 10)
const recents = [jour(0), jour(1)]

const lignes = readdirSync('content/blog')
  .filter((f) => f.endsWith('.mdx'))
  .flatMap((f) => {
    const brut = readFileSync(`content/blog/${f}`, 'utf8')
    if (recents.includes(/^updatedAt:\s*"([\d-]+)"/m.exec(brut)?.[1])) return []
    const corps = brut.slice(brut.indexOf('---', 3) + 3).split(/^## Sources/m)[0]
    const mots = corps.split(/\s+/).length
    const brut100 = compte(corps, ORGANISMES) + compte(corps, RAPPORT) + compte(corps, /—/g)
    return [{ slug: f.replace('.mdx', ''), score: Math.round((brut100 * 10000) / mots) / 10 }]
  })
  .sort((a, b) => b.score - a.score)

for (const l of lignes.slice(0, Number(process.argv[2] ?? 10))) console.log(`${l.score}\t${l.slug}`)
