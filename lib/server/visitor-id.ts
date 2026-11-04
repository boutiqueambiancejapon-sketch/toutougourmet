import { createHash, randomBytes } from 'node:crypto'

// @cdc mesure — compte les visiteurs du moment sans cookie : empreinte de l'adresse et du navigateur
// mêlés à un sel aléatoire gardé en mémoire et changé chaque jour. Le sel n'est jamais écrit : une
// empreinte ne se relie ni à une adresse ni à la même personne le lendemain. Un redémarrage du site
// change aussi le sel, un visiteur en cours peut alors compter double.

let current = { day: '', salt: '' }

export function visitorId(ip: string, ua: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10)
  if (current.day !== day) current = { day, salt: randomBytes(32).toString('hex') }
  return createHash('sha256').update(`${current.salt}|${ip}|${ua}`).digest('hex').slice(0, 16)
}
