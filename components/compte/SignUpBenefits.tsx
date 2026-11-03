import type { ComponentType } from 'react'
import { IconDog, IconScale, IconScan, IconSparkle, type IconProps } from '@/components/icons'
import { FREE_MONTHLY_SCANS, PREMIUM_MONTHLY_SCANS } from '@/lib/scanner/config'

// @cdc compte — bénéfices du compte gratuit à côté du formulaire d'inscription (sous le formulaire
// sur téléphone). Uniquement des fonctions qui existent : profil repris par les outils, courbe de
// poids, quota du scanner, Premium gratuit pendant le lancement, suppression depuis les réglages.

const BENEFITS: { Icon: ComponentType<IconProps>; title: string; text: string }[] = [
  { Icon: IconDog, title: 'Le profil de ton chien, repris par les outils', text: 'Le calcul de ration se remplit avec son poids, son âge et son activité.' },
  { Icon: IconScale, title: 'Sa courbe de poids', text: "Chaque pesée s'ajoute à la courbe, à côté de la fourchette de poids de sa race." },
  { Icon: IconScan, title: `${FREE_MONTHLY_SCANS} analyses d'étiquette par photo par mois`, text: 'Tes 20 dernières analyses restent dans ton historique.' },
  { Icon: IconSparkle, title: 'Premium à 0 € pendant le lancement', text: `${PREMIUM_MONTHLY_SCANS} analyses par mois et une alerte quand son poids change vite.` },
]

export function SignUpBenefits() {
  return (
    <aside aria-labelledby="avantages" className="flex flex-col gap-4 rounded-card bg-cream-2 p-5 md:p-8">
      <h2 id="avantages" className="m-0 font-display text-2xl font-black leading-tight text-ink">
        Avec ton compte gratuit
      </h2>
      <ul role="list" className="m-0 flex list-none flex-col gap-4 p-0">
        {BENEFITS.map(({ Icon, title, text }) => (
          <li key={title} className="m-0 flex items-start gap-3">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-paper text-ink">
              <Icon className="size-5" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-base font-semibold leading-snug text-ink">{title}</span>
              <span className="text-sm leading-relaxed text-ink-2">{text}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 border-t border-line pt-4 text-sm font-semibold text-ink">
        Gratuit, sans carte bancaire. Compte supprimable à tout moment.
      </p>
    </aside>
  )
}

/** Titre de la page selon d'où vient le visiteur (?retour=). */
export function signUpTitle(returnTo: string): string {
  if (returnTo.startsWith('/scanner')) return "Crée ton compte pour scanner l'étiquette"
  if (returnTo.startsWith('/croquettes')) return 'Crée ton compte pour garder tes analyses'
  if (returnTo.startsWith('/compte/chien/nouveau')) return 'Crée ton compte pour enregistrer ton chien'
  if (returnTo.startsWith('/outils') || returnTo.startsWith('/quiz')) return 'Crée ton compte pour garder ce résultat'
  return 'Crée ton compte'
}
