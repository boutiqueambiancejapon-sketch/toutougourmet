// @cdc lot 6 — petites illustrations du scanner (SVG en ligne, couleurs des tokens) : exemples
// de photo attendue pour chaque emplacement et étapes de « Comment ça marche ».
// Décoratives : aria-hidden, le texte à côté dit tout.

const box = 'h-auto w-full'

export function BarcodeArt({ className = box }: { className?: string }) {
  const bars = [0, 3, 5, 9, 11, 14, 18, 20, 23, 27, 29, 32, 36, 38, 41, 45, 47, 50, 54, 56]
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="76" height="52" rx="8" className="fill-paper stroke-ink" strokeWidth="2" />
      {bars.map((x, i) => (
        <rect key={x} x={12 + x} y="10" width={i % 3 === 0 ? 2.4 : 1.2} height="28" className="fill-ink" />
      ))}
      <rect x="8" y="22" width="64" height="2" className="fill-orange" />
      <text x="40" y="48" textAnchor="middle" fontSize="7" className="fill-ink-2 font-body">3 760000 000017</text>
    </svg>
  )
}

/** Liste des ingrédients : bloc de texte serré sous le mot « Composition ». */
export function IngredientsArt({ className = box }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="76" height="52" rx="8" className="fill-cream-2 stroke-ink" strokeWidth="2" />
      <rect x="9" y="9" width="30" height="5" rx="2" className="fill-ink" />
      {[19, 25, 31, 37, 43].map((y, i) => (
        <rect key={y} x="9" y={y} width={i === 4 ? 40 : 62} height="3" rx="1.5" className="fill-ink-2" />
      ))}
      <rect x="9" y="19" width="16" height="3" rx="1.5" className="fill-green-strong" />
    </svg>
  )
}

/** Tableau des constituants analytiques : libellés à gauche, pourcentages à droite. */
export function AnalysisArt({ className = box }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="76" height="52" rx="8" className="fill-cream-2 stroke-ink" strokeWidth="2" />
      <rect x="9" y="9" width="40" height="5" rx="2" className="fill-ink" />
      {[19, 26, 33, 40].map((y) => (
        <g key={y}>
          <rect x="9" y={y} width="34" height="3" rx="1.5" className="fill-ink-2" />
          <rect x="56" y={y} width="15" height="3" rx="1.5" className="fill-orange" />
          <rect x="9" y={y + 5} width="62" height="0.8" className="fill-line-2" />
        </g>
      ))}
    </svg>
  )
}

/** Devant du sac : marque, nom de la recette et code-barres. */
export function BagFrontArt({ className = box }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <path d="M22 4h36l4 6v40a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V10z" className="fill-amber stroke-ink" strokeWidth="2" />
      <rect x="25" y="12" width="30" height="6" rx="2" className="fill-ink" />
      <rect x="27" y="22" width="26" height="3" rx="1.5" className="fill-ink-2" />
      <circle cx="40" cy="35" r="5" className="fill-orange" />
      {[0, 2, 3, 5, 7, 8, 10].map((x) => (
        <rect key={x} x={47 + x} y="42" width="1" height="7" className="fill-ink" />
      ))}
    </svg>
  )
}

/** Note sur 100 en tampon orange. */
export function ScoreArt({ className = box }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="76" height="52" rx="8" className="fill-paper stroke-ink" strokeWidth="2" />
      <g transform="rotate(-8 40 28)">
        <circle cx="40" cy="28" r="18" className="fill-orange stroke-ink" strokeWidth="2" />
        <text x="40" y="33" textAnchor="middle" fontSize="15" fontWeight="900" className="fill-ink font-display">
          78
        </text>
      </g>
    </svg>
  )
}

/** Photo à ne pas envoyer : un chien au lieu d'une étiquette (exemple des refus). */
export function WrongPhotoArt({ className = box }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 56" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="76" height="52" rx="8" className="fill-rose-bg stroke-ink" strokeWidth="2" />
      <circle cx="40" cy="30" r="13" className="fill-amber stroke-ink" strokeWidth="2" />
      <path d="M29 22l-4-9 9 5M51 22l4-9-9 5" className="fill-amber stroke-ink" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="35" cy="28" r="1.6" className="fill-ink" />
      <circle cx="45" cy="28" r="1.6" className="fill-ink" />
      <path d="M12 46L68 10" className="stroke-rose-ink" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
