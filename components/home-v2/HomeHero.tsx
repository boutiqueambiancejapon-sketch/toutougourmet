import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'

// @cdc 04-pages — hero de l'accueil V2 (prototype) : promesse, 2 actions, chiffres réels du site, photo LCP.
interface HomeHeroProps {
  guides: number
  breeds: number
  foods: number
}

export function HomeHero({ guides, breeds, foods }: HomeHeroProps) {
  const stats = [
    { value: `${guides}`, label: 'guides sourcés' },
    { value: `${breeds}`, label: 'races détaillées' },
    { value: `${foods}`, label: 'aliments classés' },
  ]
  return (
    <section className="v2 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
      <div className="order-2 flex flex-col gap-5 lg:order-1">
        <h1 className="m-0 font-display text-[clamp(2.4rem,5.2vw,4rem)] font-black leading-[1.02] tracking-tight text-ink">
          Ce que mange ton <span className="rounded-box bg-rose px-2">chien</span>, calculé pour lui.
        </h1>
        <p className="m-0 max-w-[560px] text-lg leading-relaxed text-ink-2">
          Combien de grammes lui donner, et quels aliments éviter. <strong className="text-ink">Chaque chiffre renvoie à sa source.</strong>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/outils/ration" className="inline-flex min-h-13 items-center rounded-box bg-orange px-5 text-base font-semibold text-ink no-underline">
            Calculer sa ration
          </Link>
          <Link href="/chien" className="inline-flex min-h-13 items-center rounded-box border-[1.5px] border-ink px-5 text-base font-semibold text-ink no-underline">
            Lire les guides
          </Link>
        </div>
        <dl className="m-0 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col">
              <dt className="order-2 text-sm text-ink-2">{s.label}</dt>
              <dd className="order-1 m-0 font-display text-3xl font-black text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-hero lg:order-2">
        <Illustration slot="home-hero" alt="Trois chiens assis côte à côte, illustrations dessinées" fill priority sizes="(max-width: 1024px) 100vw, 540px" className="!rounded-none" />
      </div>
    </section>
  )
}
