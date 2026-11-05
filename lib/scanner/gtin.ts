// @cdc 06-seo — code-barres d'une fiche en donnée structurée : la bonne propriété selon sa longueur,
// et seulement si la clé de contrôle est juste. Un code faux n'identifierait pas le produit.

export function validGtin(code: string): boolean {
  if (!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false
  const digits = [...code].map(Number)
  const check = digits.pop() as number
  const sum = digits.reverse().reduce((total, d, i) => total + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check
}

/** { gtin13: '…' } selon la longueur, ou rien si le code n'est pas valide. */
export function gtinProperty(code: string | null | undefined): Record<string, string> {
  if (!code || !validGtin(code)) return {}
  // Préfixes GS1 20 à 29 : codes internes d'un magasin (Maxi Zoo : 205…), pas un code-barres officiel.
  if (code.length === 13 && code.startsWith('2')) return {}
  return { [`gtin${code.length}`]: code }
}
