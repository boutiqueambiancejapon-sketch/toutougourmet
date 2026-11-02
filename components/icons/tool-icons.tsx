import { Svg, type IconProps } from './Svg'

// Icônes des outils : budget (pièces), coût annuel (barres), âge (gâteau d'anniversaire).

export function IconCoins(props: IconProps) {
  return (
    <Svg {...props}>
      <ellipse className="fill-amber" cx="9" cy="15.5" rx="6" ry="2.6" />
      <path className="fill-amber" d="M3 15.5v2.4c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-2.4" />
      <ellipse className="fill-orange" cx="15" cy="8.5" rx="6" ry="2.6" />
      <path className="fill-orange" d="M9 8.5v3c0 .6.5 1.2 1.4 1.6M21 8.5v3c0 1.4-2.7 2.6-6 2.6" />
    </Svg>
  )
}

export function IconBars(props: IconProps) {
  return (
    <Svg {...props}>
      <rect className="fill-green" x="4" y="12" width="4" height="8" rx="1" />
      <rect className="fill-amber" x="10" y="8" width="4" height="12" rx="1" />
      <rect className="fill-orange" x="16" y="4" width="4" height="16" rx="1" />
      <path d="M2.5 20.5h19" />
    </Svg>
  )
}

export function IconCake(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-rose" d="M4 13.5h16v6.5H4Z" />
      <path className="fill-amber" d="M6 9.5h12v4H6Z" />
      <path d="M4 16.5c1.3 1 2.7 1 4 0s2.7-1 4 0 2.7 1 4 0 2.7-1 4 0" />
      <path d="M12 9.5V6.5" />
      <path className="fill-orange" d="M12 2.6c.9 1 1.3 1.8 1.3 2.4a1.3 1.3 0 0 1-2.6 0c0-.6.4-1.4 1.3-2.4Z" />
    </Svg>
  )
}
