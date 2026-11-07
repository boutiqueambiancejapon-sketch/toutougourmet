// @cdc tableau de bord — valeur d'un clic partenaire pour estimer les revenus (chiffres du propriétaire, 2026-11-07).
// Client : ce que rapporte une commande. Taux : clients ÷ clics observés en novembre 2026 (Dog Chef 1 sur 4, Franklin
// 1 sur 7), échantillon minuscule : à recaler chaque mois. Maxi Zoo et les autres : valeur inconnue, comptés à 0.

export const VALEUR_CLIENT: Record<string, number> = { 'Dog Chef': 50, Franklin: 10 }
export const TAUX_CLIENT: Record<string, number> = { 'Dog Chef': 0.25, Franklin: 0.14 }

/** Revenu estimé d'un clic vers cette marque, en euros (0 si inconnu). */
export const valeurClic = (marque: string): number => (VALEUR_CLIENT[marque] ?? 0) * (TAUX_CLIENT[marque] ?? 0)
