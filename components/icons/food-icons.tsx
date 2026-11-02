import { Svg, type IconProps } from './Svg'

// Icônes de rubriques : aliments, fruits, viandes (os), urgences, santé, quantités, patte.

export function IconCarrot(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-green" d="M15.4 8.6c-.6-2.6.4-4.6 2.5-5.6.9 2.3 0 4.4-2.5 5.6Z" />
      <path className="fill-green" d="M15.4 8.6c2.6-.6 4.6.4 5.6 2.5-2.3.9-4.4 0-5.6-2.5Z" />
      <path className="fill-orange" d="M15.6 8.4c-1.6-1.6-4-1.4-5.4.2L3.7 19.4c-.5.8.1 1.4.9.9l10.8-6.5c1.6-1.4 1.8-3.8.2-5.4Z" />
      <path d="m9.6 12.4 1.4 1.4M7.2 15.6l1.2 1.2" />
    </Svg>
  )
}

export function IconFruit(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-amber" d="M12 7.2c-1.8 0-2.6 1.6-2.8 3.2-.2 1.6-2.7 2.8-2.7 5.6 0 2.8 2.4 4.5 5.5 4.5s5.5-1.7 5.5-4.5c0-2.8-2.5-4-2.7-5.6-.2-1.6-1-3.2-2.8-3.2Z" />
      <path d="M12 7.2c0-1.5.4-2.7 1.4-3.6" />
      <path className="fill-green" d="M13.2 5.3c1.2-1.3 3-1.5 4.5-.7-1 1.5-2.9 1.9-4.5.7Z" />
      <path d="M9.2 15.4c0 1.4.9 2.4 2.1 2.7" />
    </Svg>
  )
}

export function IconBone(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        className="fill-amber"
        transform="rotate(-40 12 12)"
        d="M7.2 9.6h9.6a2.5 2.5 0 1 1 2.5 2.4 2.5 2.5 0 1 1-2.5 2.4H7.2a2.5 2.5 0 1 1-2.5-2.4 2.5 2.5 0 1 1 2.5-2.4Z"
      />
    </Svg>
  )
}

export function IconAlert(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-rose" d="M10.3 4.3a2 2 0 0 1 3.4 0l7.5 13a2 2 0 0 1-1.7 3.1H4.5a2 2 0 0 1-1.7-3.1Z" />
      <path d="M12 9.4v4.4" />
      <circle className="fill-current" cx="12" cy="17" r="1.2" stroke="none" />
    </Svg>
  )
}

export function IconHeart(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-rose" d="M12 20.2s-7.6-4.5-7.6-10.1a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5.6-7.6 10.1-7.6 10.1Z" />
      <path d="M7.4 9.7a2.2 2.2 0 0 1 1.7-1.8" />
    </Svg>
  )
}

export function IconScale(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 6.4h14M12 6.4v3" />
      <path className="fill-blue" d="M4 19.6 5.6 9.4h12.8L20 19.6Z" />
      <circle className="fill-paper" cx="12" cy="14.6" r="2.9" />
      <path d="m12 14.6 1.4-1.4" />
    </Svg>
  )
}

export function IconPaw(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-orange" d="M12 12.2c-3 0-5.5 3-5.5 5.1 0 1.6 1.2 2.3 2.6 2.3 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.7 2.6-2.3 0-2.1-2.5-5.1-5.5-5.1Z" />
      <ellipse className="fill-orange" cx="5.4" cy="10.8" rx="1.7" ry="2.1" />
      <ellipse className="fill-orange" cx="9.3" cy="6.9" rx="1.8" ry="2.3" />
      <ellipse className="fill-orange" cx="14.7" cy="6.9" rx="1.8" ry="2.3" />
      <ellipse className="fill-orange" cx="18.6" cy="10.8" rx="1.7" ry="2.1" />
    </Svg>
  )
}

export function IconBread(props: IconProps) {
  return (
    <Svg {...props}>
      <path className="fill-amber" d="M5 20v-8.8C3.4 10.6 3 9.4 3 8.4 3 5.6 6.6 4 12 4s9 1.6 9 4.4c0 1-.4 2.2-2 2.8V20Z" />
      <path className="fill-paper" d="M8 17.6v-6.9c-1-.4-1.4-1-1.4-1.6C6.6 7.6 9 6.8 12 6.8s5.4.8 5.4 2.3c0 .6-.4 1.2-1.4 1.6v6.9Z" />
      <path d="M10.4 12.4h.01M13.6 14.6h.01" />
    </Svg>
  )
}
