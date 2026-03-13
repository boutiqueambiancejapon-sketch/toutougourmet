# SEO & GEO — Toutou Gourmet

## TL;DR

- Métadonnées via Next.js Metadata API · generateMetadata sur chaque page indexée
- JSON-LD WebSite en place dans layout.tsx · Article + BreadcrumbList sur pages chien
- Sitemap dynamique via next-sitemap (postbuild)
- Plausible Analytics · Search Console à configurer
- Cibles LCP < 2.5s · CLS < 0.1 · INP < 200ms

---

## 7.1 Métadonnées

Pattern par défaut (layout.tsx) :
```typescript
title: {
  default: 'Toutou Gourmet — Comparateur de nourriture premium pour chiens et chats',
  template: '%s | Toutou Gourmet',
}
metadataBase: new URL('https://www.toutou-gourmet.com')
```

Par page : `generateMetadata()` obligatoire.
- Title : max 60 chars · mot-clé en tête
- Description : max 155 chars
- `alternates.canonical` obligatoire sur toute page indexée
- OG image : /images/og/[page].webp · 1200×630

---

## 7.2 JSON-LD

| Page | Type Schema.org |
|------|----------------|
| Toutes (layout) | WebSite + SearchAction |
| Fiche marque | Product + BreadcrumbList |
| Article chien | Article + BreadcrumbList |
| Outils | WebApplication + FAQPage |
| Hub blog | — |

Injection côté serveur uniquement — jamais useEffect.

---

## 7.3 Fichiers techniques

- `app/sitemap.ts` : sitemap dynamique généré par next-sitemap (postbuild)
- `robots.txt` : à créer via next-sitemap config ou app/robots.ts
- Manifest PWA : non prévu (V2)

---

## 7.4 Règles GEO

- Réponse directe dès le premier paragraphe de chaque H2
- Chiffres sourcés obligatoires (compositions marques, prix)
- H2/H3 en questions quand naturel (ex: "Quelle ration pour mon chien ?")
- Termes techniques définis à leur première apparition
- `<time datetime="...">` visible sur chaque article

---

## 7.5 Règles contenu SEO

- HTML statique pour tout contenu textuel (rendu serveur)
- Structure H1 > H2 > H3 stricte
- FAQ sur pages outils : 6 questions minimum + JSON-LD FAQPage
- TL;DR en haut des articles longs (3 lignes max)

---

## 7.6 Core Web Vitals — Cibles

| Métrique | Cible |
|----------|-------|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| FCP | < 1.8s |
| TTFB | < 800ms |
| First Load JS | < 80kb gzippé |

Points d'attention :
- Images hero : `priority` prop obligatoire sur l'image LCP
- Polices : `adjustFontFallback: true` manquant (dette technique — ajouter si on touche layout.tsx)
- Framer Motion above-fold : interdit
- Vérifier zéro requête fonts.googleapis.com : `curl -s [URL] | grep googleapis`

---

## 7.7 Checklist avant publication

- [ ] Metadata complètes sur toutes les pages
- [ ] JSON-LD valide (Google Rich Results Test)
- [ ] robots.txt accessible
- [ ] Sitemap soumis Search Console
- [ ] Scores Lighthouse ≥ 90 sur pages clés
- [ ] Pas de console errors en production
- [ ] OG images 1200×630 présentes sur toutes les pages
- [ ] `<time datetime>` sur tous les articles
- [ ] CSP unsafe-eval documenté dans DECISIONS.md ✓
- [ ] Zéro requête fonts.googleapis.com
- [ ] Images hero : priority prop + width + height
- [ ] Framer Motion : zéro import sur composants above-fold
