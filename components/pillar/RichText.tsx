import Link from 'next/link'
import type { ReactNode } from 'react'

// Rend le seul balisage autorisé dans data/pillars.ts : **gras** et [lien](/chemin-interne).
const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g

export function RichText({ text }: { text: string }): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    const bold = /^\*\*(.+)\*\*$/.exec(part)
    if (bold) return <strong key={i}>{bold[1]}</strong>
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) return <Link key={i} href={link[2]}>{link[1]}</Link>
    return part
  })
}

/** Texte brut (JSON-LD) : retire le balisage. */
export function plainText(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
}
