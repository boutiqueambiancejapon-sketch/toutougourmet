const points = [
  {
    num: '0€',
    pillStyle: { background: 'var(--pill-rose)', color: 'var(--text-primary)' },
    title: 'de sponsoring',
    desc: "Aucune marque ne nous paie pour nos avis. On perçoit une commission uniquement si tu commandes — ça ne change rien à nos notes.",
  },
  {
    num: '100%',
    pillStyle: { background: 'var(--pill-blue)', color: 'var(--text-primary)' },
    title: 'honnête',
    desc: "On publie les points forts ET les points faibles de chaque marque. Si c'est trop cher pour ce que c'est, on le dit.",
  },
  {
    num: '4/4',
    pillStyle: { background: 'var(--pill-green)', color: 'var(--text-primary)' },
    title: 'marques analysées en détail',
    desc: "On a comparé des dizaines de marques et retenu seulement 4. Critères : qualité, digestibilité, rapport qualité/prix, vrais retours clients.",
  },
]

export function TrustSection() {
  return (
    <section className="py-20 px-6 md:px-10 bg-[var(--bg-blue)]">
      <div className="max-w-[1280px] mx-auto">

        <div className="text-center mb-12">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-blue)] mb-2">
            Pourquoi nous faire confiance ?
          </p>
          <h2 className="section-title">
            On est chiants.{' '}
            <span style={{ color: 'var(--accent-blue)' }}>C&apos;est voulu.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {points.map((p) => (
            <div
              key={p.num}
              className="bg-[var(--bg-surface)] rounded-[var(--radius-xl)] p-8 border border-[var(--border)] hover:-translate-y-2 hover:shadow-[var(--shadow-xl)] transition-all duration-300"
            >
              <span
                className="inline-block text-5xl font-black px-3 py-1 rounded-[var(--radius-md)] mb-4"
                style={{ fontFamily: "'Fraunces', serif", ...p.pillStyle }}
              >
                {p.num}
              </span>
              <h3
                className="text-xl font-bold text-[var(--text-primary)] mb-3"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {p.title}
              </h3>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
