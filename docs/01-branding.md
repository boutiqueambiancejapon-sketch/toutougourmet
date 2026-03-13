# Branding — Toutou Gourmet

## TL;DR

- Palette : orange (#E8622A) · ambre (#F2B85A) · teal (#4CAF7D) · fond crème (#FAFAF8)
- Fonts : Fraunces (serif, titres, 700+900) + DM_Sans (sans, corps, 400+500+600)
- Icons : lucide-react · SVG uniquement · pas d'icon font
- Animations : framer-motion 12 · CSS-only above-fold · prefers-reduced-motion géré
- Pas de dark mode (V2)

---

## Couleurs — variables CSS (app/globals.css)

```css
:root {
  --bg-primary:    #FAFAF8;
  --bg-surface:    #FFFFFF;
  --bg-surface-2:  #F5F0EA;
  --bg-dark:       #1A1109;
  --bg-rose:       #FFF0F5;
  --bg-blue:       #EEF4FF;

  --accent-1:      #E8622A;  /* CTA, actifs, error */
  --accent-2:      #F2B85A;  /* badges, highlights, warning */
  --accent-3:      #4CAF7D;  /* succès, icônes secondaires */
  --accent-rose:   #FF8FAB;
  --accent-blue:   #4E8EDB;

  --pill-rose:     #FFD6E3;
  --pill-blue:     #C8DCFF;
  --pill-amber:    #FFE8B5;
  --pill-green:    #C2F0D5;

  --text-primary:   #1A1109;
  --text-secondary: #4A3728;
  --text-muted:     #8A7264;
  --text-on-dark:   #F5EEE6;

  --border:         #E2D5C8;
  --border-strong:  #C4A98A;

  --success: #4CAF7D;
  --warning: #F2B85A;
  --error:   #E8622A;
  --info:    #4E8EDB;
}
```

Pas de `[data-theme="dark"]` — dark mode V2.

---

## Typographie

| Rôle | Famille | Weights | Variable CSS | Chargée dans |
|------|---------|---------|-------------|-------------|
| Titres | Fraunces | 700, 900 | --font-fraunces | app/layout.tsx |
| Corps / UI | DM_Sans | 400, 500, 600 | --font-dm-sans | app/layout.tsx |

⚠️ DM_Sans charge 3 weights (400/500/600) — CDC impose max 2 — DÉCISION À VALIDER.
⚠️ `adjustFontFallback: true` absent sur les deux polices — dette technique CLS.

### Échelle typographique (globals.css)

| Niveau | Taille | Weight | Line-height |
|--------|--------|--------|-------------|
| H1 | clamp(2.5rem, 7vw, 6rem) | 900 | 1.0 |
| H2 | clamp(1.35rem, 3vw, 1.85rem) | 800 | 1.2 |
| H3 | clamp(1.1rem, 2vw, 1.35rem) | 700 | 1.3 |
| Body | 1rem | 400 | 1.7 |
| .page-title | clamp(1.75rem, 4vw, 2.5rem) | 900 | 1.15 |
| .section-title | clamp(2rem, 5vw, 3rem) | 800 | 1.15 |

---

## Espacement

```css
--space-xs: 4px;  --space-sm: 8px;   --space-md: 16px;
--space-lg: 24px; --space-xl: 32px;  --space-2xl: 48px;
--space-3xl: 64px; --space-4xl: 96px;
```

---

## Rayons & Ombres

```css
--radius-sm: 6px;  --radius-md: 12px; --radius-lg: 16px;
--radius-xl: 24px; --radius-2xl: 32px; --radius-full: 9999px;

--shadow-sm:   0 1px 3px rgba(26,17,9,0.08);
--shadow-md:   0 4px 16px rgba(26,17,9,0.10);
--shadow-lg:   0 8px 32px rgba(26,17,9,0.14);
--shadow-xl:   0 16px 56px rgba(26,17,9,0.18);
--shadow-rose: 0 8px 32px rgba(255,143,171,0.30);
--shadow-blue: 0 8px 32px rgba(78,142,219,0.25);
```

---

## Icônes & Illustrations

- Lib : lucide-react · SVG inline · jamais d'icon font
- Style : line icons · 16×16 / 20×20 / 24×24

---

## Animations (§12)

| Animation | Usage | Lib | V1/V2 |
|-----------|-------|-----|-------|
| fadeInUp | entrées de sections | CSS @keyframes | V1 |
| marquee | bandeau marques | CSS @keyframes | V1 |
| wordSlideIn/Out | rotateur mots hero | CSS @keyframes | V1 |
| hover cards | élévation | CSS transform | V1 |
| Framer Motion | wrappers décoratifs | framer-motion 12 | V1 |

Règles :
- Framer Motion : wrappers `<motion.div>` / `<motion.section>` uniquement — jamais sur h1, h2, p, li
- Above-fold : CSS animations uniquement — zéro Framer Motion sur éléments visibles sans scroll
- prefers-reduced-motion : transitions 0ms (géré dans globals.css)
- Transition globale : `cubic-bezier(0.4, 0, 0.2, 1)` · 180ms
