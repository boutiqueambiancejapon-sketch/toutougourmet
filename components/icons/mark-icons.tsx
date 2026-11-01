import { Svg, type IconProps } from './Svg'

// Marques de verdict (oui / danger / modération), étincelle décorative et chevron.

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-green" cx="12" cy="12" r="9" />
      <path d="m7.8 12.4 2.8 2.8 5.6-6" strokeWidth={2.4} />
    </Svg>
  )
}

export function IconCross(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-rose" cx="12" cy="12" r="9" />
      <path d="m8.8 8.8 6.4 6.4M15.2 8.8l-6.4 6.4" strokeWidth={2.4} />
    </Svg>
  )
}

export function IconBang(props: IconProps) {
  return (
    <Svg {...props}>
      <circle className="fill-amber" cx="12" cy="12" r="9" />
      <path d="M12 7.2v5.6" strokeWidth={2.4} />
      <circle className="fill-current" cx="12" cy="16.4" r="1.3" stroke="none" />
    </Svg>
  )
}

export function IconSparkle(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-amber" d="M10 2.5Q11.8 7.2 16.5 9 11.8 10.8 10 15.5 8.2 10.8 3.5 9 8.2 7.2 10 2.5Z" />
      <path className="fill-orange" d="M17.5 13Q18.4 15.6 21 16.5 18.4 17.4 17.5 20 16.6 17.4 14 16.5 16.6 15.6 17.5 13Z" />
    </Svg>
  )
}

export function IconChevron(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9.5 6 6 6-6 6" strokeWidth={2.2} />
    </Svg>
  )
}
