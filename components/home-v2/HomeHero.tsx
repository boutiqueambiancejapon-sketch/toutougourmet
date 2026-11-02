import { Illustration } from '@/components/ui/Illustration'
import { RationQuick } from '@/components/tools/RationQuick'

// @cdc 04-pages — hero de l'accueil V2 : H1 et accroche rendus serveur, calculateur de ration
// à la place du bandeau de chiffres (audit design-CRO, §3 Accueil).
// Mobile : titre, outil, photo. Bureau : titre et photo à gauche, outil à droite.
export function HomeHero() {
  return (
    <section className="v2 grid grid-cols-1 gap-6 [grid-template-areas:'text'_'tool'_'photo'] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-x-12 lg:gap-y-8 lg:[grid-template-areas:'text_tool'_'photo_tool']">
      <div className="flex flex-col gap-4 [grid-area:text]">
        <h1 className="m-0 font-display text-[clamp(2rem,5vw,3.6rem)] font-black leading-[1.02] tracking-tight text-ink">
          Bien nourrir ton <span className="tg-marker rounded-box bg-rose px-2">chien</span>, chiffres à l&apos;appui.
        </h1>
        <p className="m-0 max-w-[560px] text-lg leading-relaxed text-ink-2">
          Combien de grammes lui donner, et quels aliments éviter. <strong className="text-ink">Chaque chiffre renvoie à sa source.</strong>
        </p>
      </div>
      <div className="[grid-area:tool] lg:self-start">
        <RationQuick headingId="ration-accueil" />
      </div>
      <div className="tg-wiggle relative aspect-[3/2] w-full overflow-hidden rounded-hero [grid-area:photo] lg:aspect-[4/3] lg:self-end">
        <Illustration slot="home-hero" alt="Trois chiens assis côte à côte, illustrations dessinées" fill priority sizes="(max-width: 1024px) 100vw, 560px" className="!rounded-none" />
      </div>
    </section>
  )
}
