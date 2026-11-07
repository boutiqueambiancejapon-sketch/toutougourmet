import type { Metadata } from 'next'
import Link from 'next/link'
import { AssistantChat } from '@/components/assistant/AssistantChat'

// @cdc assistant — page de l'assistant (décision du 2026-11-07). Le texte de présentation est servi en HTML, la
// discussion se fait dans le navigateur.

export const metadata: Metadata = {
  title: { absolute: 'Assistant : une question sur l’alimentation de ton chien ? | Toutou Gourmet' },
  description: 'Pose ta question sur les croquettes, la ration, un aliment ou une étiquette : l’assistant répond à partir des articles de Toutou Gourmet.',
  alternates: { canonical: 'https://www.toutou-gourmet.com/assistant' },
}

export default function AssistantPage() {
  return (
    <main className="v2 mx-auto flex max-w-prose flex-col gap-6 px-4 pt-6 pb-16 md:px-8 md:pt-10">
      <header className="flex flex-col gap-3">
        <h1 className="m-0 font-display text-[clamp(1.9rem,5vw,2.75rem)] font-black leading-[1.05] tracking-tight text-ink">Une question sur l&apos;alimentation de ton chien ?</h1>
        <p className="m-0 text-lg leading-relaxed text-ink-2">Croquettes, ration, aliment, étiquette : pose ta question. L&apos;assistant répond d&apos;abord avec nos articles.</p>
      </header>
      <AssistantChat />
      <p className="m-0 text-sm leading-relaxed text-ink-2">
        L&apos;assistant n&apos;est pas un vétérinaire. Tes questions sont gardées 90 jours, sans ton nom ni ton adresse, pour choisir nos prochains articles. Pour suivre ton chien,{' '}
        <Link href="/mon-chien" className="font-semibold text-orange-ink underline underline-offset-2">crée son espace gratuit</Link>.
      </p>
    </main>
  )
}
