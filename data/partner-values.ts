// @cdc tableau de bord — valeur d'un clic partenaire pour estimer les revenus (chiffres du propriétaire, 2026-11-07).
// Client : ce que rapporte une commande. Taux : clients ÷ clics du 1er au 18 novembre 2026 (Dog Chef 2 sur 14,
// Franklin 2 sur 12, recalé le 2026-11-21), petit échantillon : à recaler chaque mois. Maxi Zoo et les autres : valeur inconnue, comptés à 0.

export const VALEUR_CLIENT: Record<string, number> = { 'Dog Chef': 50, Franklin: 10 }
export const TAUX_CLIENT: Record<string, number> = { 'Dog Chef': 0.14, Franklin: 0.17 }

/** Revenu estimé d'un clic vers cette marque, en euros (0 si inconnu). */
export const valeurClic = (marque: string): number => (VALEUR_CLIENT[marque] ?? 0) * (TAUX_CLIENT[marque] ?? 0)
