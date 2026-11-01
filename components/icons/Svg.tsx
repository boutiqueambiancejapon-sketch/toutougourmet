import type { ReactNode } from 'react'

// @cdc branding — jeu d'icônes maison (audit design 2026-11-02, §2.2) : trait encre arrondi
// (currentColor, épaisseur 2), aplats de la palette via les utilitaires fill-* (tokens CSS).
// Décoratives par défaut (aria-hidden) ; passer `title` pour une icône porteuse de sens.

export interface IconProps {
  className?: string
  title?: string
}

export function Svg({ className = 'size-6', title, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={`shrink-0 ${className}`}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  )
}
