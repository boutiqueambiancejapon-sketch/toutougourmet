import type { Metadata } from 'next'
import { QuizWrapper } from '@/components/quiz/QuizWrapper'

export const metadata: Metadata = {
  title: 'Quiz — Quelle nourriture pour mon chien ?',
  description:
    "5 questions pour trouver la meilleure nourriture pour ton chien. Résultat immédiat, recommandation personnalisée et code promo exclusif.",
  alternates: { canonical: 'https://toutou-gourmet.com/quiz' },
}

export default function QuizPage() {
  return (
    <div className="min-h-screen py-12 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[960px] mx-auto">
        <div className="mb-12 max-w-[640px]">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-1)] mb-2">
            ⚡ 2 minutes — Résultat immédiat
          </p>
          <h1 className="page-title mb-4">
            Quelle marque est faite pour ton animal ?
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Réponds à 5 questions, on analyse ton profil et on te recommande la meilleure option.
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 md:p-10 shadow-[var(--shadow-md)] max-w-2xl mx-auto">
          <QuizWrapper />
        </div>
      </div>
    </div>
  )
}
