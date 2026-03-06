import Link from 'next/link'

const steps = [
  { icon: '🐶', title: 'Ton animal', desc: 'Chien ou chat, âge, problèmes de santé' },
  { icon: '💰', title: 'Ton budget', desc: 'De < 30€ à + de 100€ par mois' },
  { icon: '🍖', title: 'Ta recommandation', desc: 'La marque idéale + des alternatives' },
]

export function QuizTeaser() {
  return (
    <section className="py-16 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-8 md:p-10 text-center shadow-[var(--shadow-md)]">
          <p className="text-sm font-semibold text-[var(--accent-1)] uppercase tracking-wider mb-2">
            ⚡ Quiz — 2 minutes
          </p>
          <h2 className="mb-3" style={{ fontFamily: "'Fraunces', serif" }}>
            Quelle marque est faite pour ton animal ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            5 questions. On analyse ton profil. On te recommande la meilleure option. Sans te noyer
            dans les détails.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-4xl">{step.icon}</span>
                <p className="font-bold text-[var(--text-primary)]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {step.title}
                </p>
                <p className="text-sm text-[var(--text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>

          <Link href="/quiz" className="btn-primary text-base px-8 py-3 inline-block">
            Je fais le quiz maintenant →
          </Link>
        </div>
      </div>
    </section>
  )
}
