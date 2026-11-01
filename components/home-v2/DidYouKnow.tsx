import Link from 'next/link'

// @cdc 04-pages — encart « Le savais-tu ? » (prototype) vers l'outil âge humain.
// Formule UCSD : âge humain = 16 × ln(âge du chien) + 31 (Wang et al. 2020, Cell Systems).
const DOG_AGE = 4
const HUMAN_AGE = Math.round(16 * Math.log(DOG_AGE) + 31)

export function DidYouKnow() {
  return (
    <Link href="/outils/age" className="v2 flex flex-col gap-1 rounded-card bg-orange p-6 text-ink no-underline">
      <span className="text-[15px] font-semibold">Le savais-tu ?</span>
      <span className="font-display text-2xl font-black leading-tight">
        {`Un chien de ${DOG_AGE} ans a ${HUMAN_AGE} ans en âge humain, pas ${DOG_AGE * 7}.`}
      </span>
      <span className="text-sm font-semibold">Calcule l&apos;âge du tien →</span>
    </Link>
  )
}
