import Link from 'next/link'

export function QuizTeaser() {
  return (
    <section className="bg-[var(--bg-dark)] px-6 md:px-10 py-24 relative overflow-hidden">
      {/* Blob rose */}
      <div aria-hidden="true" className="absolute top-[-40px] right-[-40px] w-[300px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'var(--pill-rose)' }} />

      <div className="max-w-[1280px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">

          {/* Texte */}
          <div className="lg:max-w-[560px]">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ background: 'rgba(245,238,230,0.12)', color: 'var(--text-on-dark)' }}>
              ⚡ 2 minutes chrono
            </span>
            <h2 className="section-title text-[var(--text-on-dark)] mb-5">
              Quelle marque est faite pour{' '}
              <span className="inline-block px-3 py-0.5 rounded-[var(--radius-md)]" style={{ background: 'var(--pill-blue)', color: 'var(--text-primary)' }}>
                ton animal ?
              </span>
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-on-dark)', opacity: 0.70 }}>
              5 questions. On analyse le profil de ton animal. On te recommande la meilleure option — sans te noyer dans les détails.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quiz" className="btn-dark text-base px-8 py-4">
                Faire le quiz gratuit →
              </Link>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-4 lg:max-w-[380px] w-full">
            {[
              { num: '01', icon: '🐶', title: 'Ton animal', desc: 'Chien ou chat, âge, taille, problèmes de santé' },
              { num: '02', icon: '💰', title: 'Ton budget', desc: 'De moins de 30€ à plus de 100€ par mois' },
              { num: '03', icon: '🎯', title: 'Ta recommandation', desc: 'La marque idéale + des alternatives' },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 rounded-[var(--radius-lg)] p-4"
                style={{ background: 'rgba(245,238,230,0.06)', border: '1px solid rgba(245,238,230,0.10)' }}
              >
                <span className="text-xs font-black opacity-60 shrink-0 mt-0.5" style={{ color: 'var(--text-on-dark)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {step.num}
                </span>
                <span className="text-xl shrink-0">{step.icon}</span>
                <div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-on-dark)' }}>{step.title}</p>
                  <p className="text-sm" style={{ color: 'var(--text-on-dark)', opacity: 0.70 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
