#!/usr/bin/env node
// Met à jour data/disposable-domains.json depuis la liste publique (CC0)
// github.com/disposable-email-domains/disposable-email-domains. Usage : node scripts/update-disposable-domains.mjs
import { writeFileSync } from 'node:fs'

const SOURCE = 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/main/disposable_email_blocklist.conf'
// Fournisseurs réels à ne jamais bloquer, même si la liste se trompait un jour.
const NEVER = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'outlook.fr', 'hotmail.com', 'hotmail.fr', 'live.fr', 'icloud.com', 'me.com', 'yahoo.com', 'yahoo.fr', 'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr', 'laposte.net', 'proton.me', 'protonmail.com', 'gmx.fr', 'skynet.be', 'telenet.be', 'videotron.ca', 'bell.net'])

const res = await fetch(SOURCE)
if (!res.ok) throw new Error(`HTTP ${res.status}`)
const domains = (await res.text())
  .split('\n')
  .map((l) => l.trim().toLowerCase())
  .filter((d) => d && !d.startsWith('#') && !NEVER.has(d))
  .sort()
writeFileSync(new URL('../data/disposable-domains.json', import.meta.url), `${JSON.stringify(domains)}\n`)
console.log(`${domains.length} domaines jetables enregistrés`)
