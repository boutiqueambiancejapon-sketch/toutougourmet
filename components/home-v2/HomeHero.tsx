import Link from 'next/link'
import { Illustration } from '@/components/ui/Illustration'
import { RationQuick } from '@/components/tools/RationQuick'

// @cdc 04-pages — hero de l'accueil V2 : H1 et accroche rendus serveur, calculateur de ration
// à la place du bandeau de chiffres (audit design-CRO, §3 Accueil).
// Mobile : titre, bouton du test (objectif principal de l'accueil, carte des conversions), outil,
// photo. Bureau : titre et photo à gauche, outil à droite.
export function HomeHero() {
  return (
    <section className="v2 grid grid-cols-1 gap-6 [grid-template-areas:'text'_'tool'_'photo'] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-8 lg:[grid-template-areas:'text_tool'_'photo_tool']">
      <div className="flex flex-col gap-4 [grid-area:text]">
        <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.6rem)] font-black leading-[1.02] tracking-tight text-ink">
          Bien nourrir ton <span className="tg-marker rounded-box bg-rose pr-0.5 pl-2">chien</span>, sans deviner.
        </h1>
        <p className="m-0 max-w-[560px] text-lg leading-relaxed text-ink-2">
          Il fixe ton assiette avec ses yeux de chien battu ? Avant de céder, vérifie ici combien de grammes il lui faut et ce qu&apos;il a le droit de manger. <strong className="text-ink">Chaque chiffre renvoie à son étude.</strong>
        </p>
        <Link
          href="/quiz"
          data-cta="home-quiz"
          className="inline-flex min-h-12 max-w-full items-center self-start rounded-control bg-orange px-5 py-3 text-base font-bold text-ink no-underline shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
        >
          Faire le test de mon chien&nbsp;→
        </Link>
      </div>
      <div className="[grid-area:tool] lg:self-start">
        <RationQuick headingId="ration-accueil" />
      </div>
      <div className="tg-wiggle relative aspect-[3/2] w-full overflow-hidden rounded-hero [grid-area:photo] lg:aspect-[4/3] lg:self-end">
        <Illustration slot="home-hero" alt="Deux Cavaliers King Charles et un Shiba assis côte à côte" fill priority imageClassName="object-right" sizes="(max-width: 1024px) 100vw, 560px" className="!rounded-none" />
      </div>
    </section>
  )
}
