// @cdc assistant — question qui ressemble à une urgence : le numéro du centre antipoison s'affiche avant tout,
// sans compte et sans attendre la réponse de l'IA. Préférer une fausse alerte à une urgence manquée.

const URGENCE = /\b(a mang[ée]|a aval[ée]|a croqu[ée]|a bu|a l[ée]ch[ée]|vomi|vomit|diarrh[ée]e.*sang|sang|convuls|tremble|empoisonn|intoxi|s[’']?[ée]touff|respire mal|ne respire|inconscient|effondr|paralys|gonfl[ée]|ventre dur|urgence)/i

export const estUrgence = (question: string): boolean => URGENCE.test(question)

export const CENTRES_ANTIPOISON = [
  { nom: 'CNITV (Lyon)', tel: '04 78 87 10 40' },
  { nom: 'CAPAE-Ouest (Nantes)', tel: '02 40 68 77 40' },
]
