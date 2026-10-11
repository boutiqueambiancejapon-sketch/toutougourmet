/* global React */
/**
 * Placeholder éditorial — style paysage géométrique tons crème.
 * Utilise SVG inline (zéro requête HTTP, perf PSI friendly).
 * variant: 'landscape' | 'portrait' | 'square' | 'dog' | 'food' | 'editorial'
 */
function Placeholder({ variant = 'landscape', label, ratio, radius = 24, tone = 'cream', style: extraStyle = {} }) {
  const tones = {
    cream:  { bg: '#F5F0EA', fg: '#E2D5C8', accent: '#C4A98A' },
    rose:   { bg: '#FFE8EF', fg: '#FFD6E3', accent: '#FF8FAB' },
    blue:   { bg: '#E6EEFF', fg: '#C8DCFF', accent: '#4E8EDB' },
    green:  { bg: '#E4F5EC', fg: '#C2F0D5', accent: '#4CAF7D' },
    amber:  { bg: '#FFF3D9', fg: '#FFE8B5', accent: '#F2B85A' },
    dark:   { bg: '#2A1E12', fg: '#4A3728', accent: '#8A7264' },
  };
  const t = tones[tone] || tones.cream;

  // Scene variants -- all inline SVG, viewBox 80 56 (16:9-ish)
  const scenes = {
    landscape: (
      <svg viewBox="0 0 80 56" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="80" height="56" fill={t.bg}/>
        <circle cx="60" cy="18" r="7" fill={t.accent} opacity=".55"/>
        <path d="M0 44 L18 30 L32 38 L48 26 L62 34 L80 28 L80 56 L0 56 Z" fill={t.fg}/>
        <path d="M0 50 L14 42 L28 48 L44 40 L60 46 L80 40 L80 56 L0 56 Z" fill={t.accent} opacity=".6"/>
      </svg>
    ),
    portrait: (
      <svg viewBox="0 0 56 80" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="56" height="80" fill={t.bg}/>
        <circle cx="40" cy="22" r="8" fill={t.accent} opacity=".5"/>
        <path d="M0 60 L14 46 L26 54 L40 42 L56 48 L56 80 L0 80 Z" fill={t.fg}/>
        <path d="M0 68 L12 60 L24 66 L38 58 L56 64 L56 80 L0 80 Z" fill={t.accent} opacity=".55"/>
      </svg>
    ),
    square: (
      <svg viewBox="0 0 60 60" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="60" height="60" fill={t.bg}/>
        <circle cx="44" cy="18" r="7" fill={t.accent} opacity=".5"/>
        <path d="M0 44 L14 32 L26 40 L40 28 L60 34 L60 60 L0 60 Z" fill={t.fg}/>
        <path d="M0 50 L12 44 L24 50 L40 42 L60 46 L60 60 L0 60 Z" fill={t.accent} opacity=".55"/>
      </svg>
    ),
    // Silhouette chien stylisée
    dog: (
      <svg viewBox="0 0 80 56" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="80" height="56" fill={t.bg}/>
        <circle cx="62" cy="14" r="6" fill={t.accent} opacity=".4"/>
        {/* corps */}
        <ellipse cx="40" cy="36" rx="18" ry="9" fill={t.fg}/>
        {/* tête */}
        <circle cx="56" cy="28" r="8" fill={t.fg}/>
        {/* oreille */}
        <path d="M58 20 L54 14 L62 16 Z" fill={t.accent} opacity=".7"/>
        {/* pattes */}
        <rect x="28" y="40" width="3" height="8" rx="1.5" fill={t.fg}/>
        <rect x="36" y="42" width="3" height="8" rx="1.5" fill={t.fg}/>
        <rect x="46" y="42" width="3" height="8" rx="1.5" fill={t.fg}/>
        <rect x="52" y="40" width="3" height="8" rx="1.5" fill={t.fg}/>
        {/* sol */}
        <rect x="0" y="48" width="80" height="8" fill={t.accent} opacity=".3"/>
      </svg>
    ),
    // Bol de bouffe vue de dessus stylisé
    food: (
      <svg viewBox="0 0 80 56" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="80" height="56" fill={t.bg}/>
        <ellipse cx="40" cy="30" rx="22" ry="16" fill={t.accent} opacity=".4"/>
        <ellipse cx="40" cy="28" rx="18" ry="12" fill={t.fg}/>
        {/* croquettes */}
        <circle cx="34" cy="25" r="2.2" fill={t.accent} opacity=".8"/>
        <circle cx="42" cy="23" r="2" fill={t.accent} opacity=".7"/>
        <circle cx="46" cy="30" r="2.4" fill={t.accent} opacity=".8"/>
        <circle cx="36" cy="31" r="1.8" fill={t.accent} opacity=".6"/>
        <circle cx="40" cy="29" r="1.6" fill={t.accent} opacity=".7"/>
      </svg>
    ),
    editorial: (
      <svg viewBox="0 0 80 56" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="80" height="56" fill={t.bg}/>
        <rect x="10" y="10" width="60" height="36" fill={t.fg} opacity=".6"/>
        <circle cx="24" cy="24" r="6" fill={t.accent} opacity=".8"/>
        <rect x="34" y="20" width="28" height="3" rx="1" fill={t.accent} opacity=".6"/>
        <rect x="34" y="26" width="20" height="3" rx="1" fill={t.accent} opacity=".4"/>
        <rect x="14" y="36" width="52" height="3" rx="1" fill={t.accent} opacity=".4"/>
      </svg>
    ),
  };

  const wrapStyle = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius,
    background: t.bg,
    width: '100%',
    ...(ratio ? { aspectRatio: ratio } : {}),
    ...extraStyle,
  };

  return (
    <div style={wrapStyle} role="img" aria-label={label || 'Photo placeholder'}>
      {scenes[variant] || scenes.landscape}
      {label && (
        <span style={{
          position:'absolute', bottom: 10, left: 12,
          fontFamily:'var(--font-mono)', fontSize: 10, fontWeight:700,
          color: tone === 'dark' ? '#F5EEE6' : '#4A3728',
          background: tone === 'dark' ? 'rgba(245,238,230,0.12)' : 'rgba(255,255,255,0.7)',
          padding:'3px 8px', borderRadius: 6, letterSpacing:'0.04em',
          backdropFilter:'blur(4px)',
        }}>{label}</span>
      )}
    </div>
  );
}

Object.assign(window, { Placeholder });
