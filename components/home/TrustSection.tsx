const trustPoints = [
  {
    icon: '🔍',
    title: 'Indépendance totale',
    desc: "On n'est payé par aucune marque pour nos avis. On reçoit une commission uniquement si tu commandes via nos liens — ça ne change rien à nos notes.",
  },
  {
    icon: '📊',
    title: 'Comparaison honnête',
    desc: "On publie les points forts ET les points faibles de chaque marque. Zéro langue de bois. Si c'est trop cher pour ce que c'est, on le dit.",
  },
  {
    icon: '✅',
    title: 'Sélection rigoureuse',
    desc: "On a comparé des dizaines de marques et retenu seulement 4. Les critères : qualité ingrédients, digestibilité, rapport qualité/prix, retours clients réels.",
  },
]

export function TrustSection() {
  return (
    <section className="py-16 px-4 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-10">
          <h2 style={{ fontFamily: "'Fraunces', serif" }}>
            Pourquoi nous faire confiance ?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-xl)] p-6 text-center shadow-[var(--shadow-sm)]"
            >
              <span className="text-4xl mb-4 block">{point.icon}</span>
              <h3
                className="text-lg font-bold text-[var(--text-primary)] mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {point.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
