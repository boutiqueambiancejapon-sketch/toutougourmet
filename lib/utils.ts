import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function estimateReadTime(content: string): number {
  const words = content
    .replace(/^---[\s\S]*?---/, '')   // front matter
    .replace(/<[^>]+>/g, ' ')         // balises JSX/HTML
    .replace(/```[\s\S]*?```/g, ' ')  // blocs de code
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Typographie française : espace insécable avant « ? : ; ! € % » et après « (textes de données affichés tels quels). */
export function frTypo(text: string): string {
  return text.replace(/ ([?:;!€%»])/g, '\u00a0$1').replace(/« /g, '«\u00a0')
}
