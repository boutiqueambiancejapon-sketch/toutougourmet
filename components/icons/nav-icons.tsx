import { Svg, type IconProps } from './Svg'

// Icônes de navigation : accueil, guides, test, outils, races, recherche.

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-amber" d="M5.5 10.2v8.6c0 1 .7 1.7 1.6 1.7h9.8c.9 0 1.6-.7 1.6-1.7v-8.6" />
      <path className="fill-orange" d="M10 20.5v-4.3a2 2 0 0 1 4 0v4.3" />
      <path d="M3.2 11.6 11 4.7a1.5 1.5 0 0 1 2 0l7.8 6.9" />
    </Svg>
  )
}

export function IconBook(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-blue" d="M12 6.6C10 5.1 7 4.6 3.5 5.1v13.6c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5.1C17 4.6 14 5.1 12 6.6Z" />
      <path className="fill-orange" d="M15 5.4v5.4l1.6-1.3 1.6 1.3V5" />
      <path d="M12 6.6v13.5" />
    </Svg>
  )
}

export function IconTarget(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-rose" cx="11" cy="13" r="8" />
      <circle className="fill-paper" cx="11" cy="13" r="4.4" />
      <circle className="fill-orange" cx="11" cy="13" r="1.4" stroke="none" />
      <path d="m11 13 8.3-8.3" />
      <path d="M17.2 3.2v3.6h3.6" />
    </Svg>
  )
}

export function IconBowl(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-amber" cx="8.4" cy="10" r="1.8" />
      <circle className="fill-amber" cx="12" cy="8.6" r="1.8" />
      <circle className="fill-amber" cx="15.6" cy="10" r="1.8" />
      <path className="fill-orange" d="M2.6 12h18.8l-1.9 6.1a2 2 0 0 1-1.9 1.4H6.4a2 2 0 0 1-1.9-1.4Z" />
      <path d="M9.5 15.6h5" />
    </Svg>
  )
}

export function IconDog(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-amber" d="M12 5.4c3.3 0 5.4 2.4 5.4 5.9v2.6c0 3.3-2.4 5.6-5.4 5.6s-5.4-2.3-5.4-5.6v-2.6c0-3.5 2.1-5.9 5.4-5.9Z" />
      <path className="fill-orange" d="M8 6.3C5.3 5.4 3 7 3 10.1c0 2.8 1 4.9 2.4 5.4L7.1 10" />
      <path className="fill-orange" d="M16 6.3c2.7-.9 5 .7 5 3.8 0 2.8-1 4.9-2.4 5.4L16.9 10" />
      <circle className="fill-current" cx="10" cy="11.6" r="1" stroke="none" />
      <circle className="fill-current" cx="14" cy="11.6" r="1" stroke="none" />
      <path className="fill-current" d="M10.9 14.5h2.2L12 15.8Z" strokeWidth={1.4} />
    </Svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-blue" cx="10.5" cy="10.5" r="6.5" />
      <path d="M7.6 9.2a3.2 3.2 0 0 1 2.3-2.3" />
      <path d="m15.4 15.4 5.1 5.1" strokeWidth={2.6} />
    </Svg>
  )
}
