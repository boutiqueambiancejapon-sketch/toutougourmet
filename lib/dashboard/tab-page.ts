import { notFound } from 'next/navigation'
import { dashboardAllowed } from './guard'
import { parsePeriod, type Period } from './period'

// @cdc tableau de bord — ouverture commune des onglets : identifiants revérifiés à chaque page
// (le proxy peut sauter, voir guard.ts), puis période lue dans l'URL.

export interface TabPageProps {
  searchParams: Promise<{ periode?: string | string[] }>
}

export async function openTab({ searchParams }: TabPageProps): Promise<Period> {
  if (!(await dashboardAllowed())) notFound()
  return parsePeriod((await searchParams).periode)
}

export const READ_FAILED = 'Une partie des chiffres n’a pas pu être lue : les blocs concernés restent vides.'
