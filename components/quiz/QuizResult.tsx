import Link from 'next/link'
import { QuizAccountInvite } from './QuizAccountInvite'
import { NextSteps, type NextStep } from '@/components/outils/NextSteps'
import {
  brandLabels,
  brandReasons,
  brandSlugMap,
  computeScores,
  getSortedBrands,
  hasClearWinner,
  quizWeight,
  type BrandKey,
  type QuizAnswers,
} from '@/lib/quiz'
import { QuizPartner } from './QuizPartner'

// @cdc outils — résultat du test, dans l'ordre des outils V2 : la marque en grand et pourquoi,
// au plus un lien partenaire (seulement si elle devance nettement la suivante), l'invitation au
// compte (sans demande d'e-mail), puis la suite logique (ration pré-remplie, avis complet, aliments dangereux).

function rationLink(answers: QuizAnswers): NextStep {
  const q = new URLSearchParams()
  const kg = quizWeight(answers)
  if (kg) q.set('poids', String(kg))
  if (typeof answers.age === 'string') q.set('age', answers.age)
  if (answers.format === 'croquettes' || answers.format === 'frais') q.set('aliment', answers.format)
  return {
    href: `/outils/ration?${q.toString()}`,
    label: 'Combien de grammes par jour ?',
    sub: kg ? `Sa ration, déjà remplie pour ${String(kg).replace('.', ',')} kg` : 'Le chiffre à peser selon son poids',
  }
}

const reviewHref = (b: BrandKey) => `/chien/marque/${brandSlugMap[b]}`

/** Après l'inscription : formulaire du chien pré-rempli avec le poids donné au test. */
function profileReturn(answers: QuizAnswers): string {
  const kg = quizWeight(answers)
  return kg ? `/compte/chien/nouveau?poids=${kg}` : '/compte/chien/nouveau'
}

export function QuizResult({ answers, onRestart }: { answers: QuizAnswers; onRestart: () => void }) {
  const scores = computeScores(answers)
  const sorted = getSortedBrands(scores)
  const [top, second] = sorted
  const reasons = brandReasons(top, answers)
  const clear = hasClearWinner(scores, sorted) && reasons.length > 0

  const steps: NextStep[] = [
    rationLink(answers),
    clear
      ? { href: reviewHref(top), label: `Notre avis complet sur ${brandLabels[top]}`, sub: 'Composition, prix, points faibles' }
      : { href: '/comparateur', label: 'Comparer les marques', sub: 'Prix, format et composition côte à côte' },
    { href: '/fiche-aliments-dangereux', label: 'Les aliments dangereux pour lui', sub: 'La fiche à garder sur le frigo' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="quiz-result" className="flex flex-col gap-5 rounded-card border-2 border-ink bg-paper p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 id="quiz-result" className="m-0 text-base font-semibold text-ink-2">
            {clear ? 'La marque qui correspond à tes réponses' : 'Deux marques correspondent à tes réponses'}
          </h2>
          <p className="m-0 font-display text-4xl font-black leading-[1.05] tracking-tight text-ink md:text-5xl">
            {clear ? brandLabels[top] : `${brandLabels[top]} ou ${brandLabels[second]}`}
          </p>
          {clear ? (
            <ul role="list" className="m-0 mt-1 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-ink-2 marker:text-ink">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p className="m-0 text-[15px] leading-relaxed text-ink-2">
              Elles sont au coude-à-coude pour ton profil. Lis nos deux avis (
              <Link href={reviewHref(top)} className="text-orange-ink underline underline-offset-2">
                {brandLabels[top]}
              </Link>
              ,{' '}
              <Link href={reviewHref(second)} className="text-orange-ink underline underline-offset-2">
                {brandLabels[second]}
              </Link>
              ) avant de choisir.
            </p>
          )}
        </div>
        {clear ? <QuizPartner brand={top} /> : null}
        <QuizAccountInvite retour={profileReturn(answers)} />
        <NextSteps steps={steps} />
      </section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onRestart} className="min-h-11 text-[15px] font-semibold text-ink underline underline-offset-2">
          Refaire le test
        </button>
        <p className="m-0 text-sm text-ink-2">Pour un chien malade, demande d&apos;abord l&apos;avis de ton vétérinaire.</p>
      </div>
    </div>
  )
}
