# Pages — Contrat de page · Toutou Gourmet

## TL;DR

- Nouvelle page → consulter le tableau ci-dessous · copier le gabarit · remplir les champs
- Jamais de `'use client'` sur page.tsx — isoler dans un sous-composant
- Jamais de fetch sans cache explicite
- generateMetadata obligatoire sur toute page indexée
- JSON-LD côté serveur uniquement

---

## Arbre de layouts

Claude Code n'explore pas l'arborescence — il lit cet arbre.

```
app/
├── layout.tsx                              ← RACINE : fonts, html lang="fr", body, Header, Footer, Analytics
├── globals.css
├── not-found.tsx                           ← 404
├── sitemap.ts                              ← Sitemap dynamique
├── page.tsx                                ← Home (SSG)
│
├── a-propos/
│   └── page.tsx                            ← SSG
│
├── blog/                                   ← Legacy — redirects actifs vers /chien/
│   ├── page.tsx                            ← Hub blog (ISR 3600s)
│   └── [slug]/
│       └── page.tsx                        ← Article legacy (ISR 1800s)
│
├── chien/
│   ├── [category]/
│   │   └── [slug]/
│   │       └── page.tsx                    ← Article chien (ISR 1800s · MDX)
│   └── marque/
│       ├── page.tsx                        ← Hub marques (ISR 3600s)
│       ├── [slug]/
│       │   └── page.tsx                    ← Fiche marque (ISR 3600s · data/brands.ts)
│       └── comparatif/
│           └── page.tsx                    ← Comparatif (ISR 3600s)
│
├── comparateur/
│   └── page.tsx                            ← Outil interactif (SSG)
│
├── contact/
│   └── page.tsx                            ← SSG
│
├── marques/                                ← Legacy — redirects vers /chien/marque/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
│
├── mentions-legales/
│   └── page.tsx                            ← SSG · statique
│
├── outils/
│   ├── page.tsx                            ← Hub outils (SSG)
│   ├── budget/
│   │   └── page.tsx                        ← Calculateur budget (SSG)
│   ├── cout/
│   │   └── page.tsx                        ← Comparateur coût (SSG)
│   ├── poids/
│   │   └── page.tsx                        ← Calculateur poids (SSG)
│   └── ration/
│       └── page.tsx                        ← Calculateur ration (SSG)
│
└── politique-de-confidentialite/
    └── page.tsx                            ← SSG · statique
```

Règles :
- Nouveau fichier → créer dans cet arbre uniquement, jamais ailleurs
- Nouveau layout.tsx → uniquement si wrapping visuel distinct du parent
- Il n'y a qu'un seul layout.tsx (racine) — pas de layout imbriqué actuellement

---

## Tableau de référence

| Template | Fichier | Rendu | Revalidation | Data source | JSON-LD |
|----------|---------|-------|-------------|-------------|---------|
| Home | app/page.tsx | SSG | — | statique | WebSite (layout.tsx) |
| Hub marques | app/chien/marque/page.tsx | ISR | 3600s | data/brands.ts | — |
| Fiche marque | app/chien/marque/[slug]/page.tsx | ISR | 3600s | data/brands.ts | Product + BreadcrumbList |
| Comparatif | app/chien/marque/comparatif/page.tsx | ISR | 3600s | data/brands.ts | — |
| Article chien | app/chien/[category]/[slug]/page.tsx | ISR | 1800s | MDX /content/ | Article + BreadcrumbList |
| Hub blog | app/blog/page.tsx | ISR | 3600s | MDX /content/ | — |
| Article blog | app/blog/[slug]/page.tsx | ISR | 1800s | MDX /content/ | Article |
| Hub outils | app/outils/page.tsx | SSG | — | statique | WebApplication |
| Outil calculateur | app/outils/[outil]/page.tsx | SSG | — | JSON local | WebApplication + FAQPage |
| Comparateur | app/comparateur/page.tsx | SSG | — | data/brands.ts | — |
| À propos | app/a-propos/page.tsx | SSG | — | statique | — |
| Contact | app/contact/page.tsx | SSG | — | statique | — |
| Page légale | app/[legal]/page.tsx | SSG | — | statique | — |
| 404 | app/not-found.tsx | SSG | — | — | — |

---

## Gabarit — page ISR (serveur)

```tsx
// @cdc 5.0 — contrat : [NOM_TEMPLATE] · rendu ISR · JSON-LD [TYPE]
import type { Metadata } from 'next'

export const revalidate = [SECONDES]  // ex: 3600 ou 1800

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params  // Next.js 15+ : params est une Promise
  return {
    title: `[TITRE] | Toutou Gourmet`,  // max 60 chars
    description: '[DESCRIPTION]',       // max 155 chars
    alternates: { canonical: '/[CHEMIN]' },
  }
}

async function getData(slug: string) {
  // MDX : lecture depuis /content/
  // Brands : import depuis data/brands.ts
  // Toujours spécifier cache explicitement si fetch HTTP
}

export default async function [NomPage](
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = await getData(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': '[TYPE]',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* blocs dans l'ordre — un composant par bloc */}
        {/* <PartieInteractive /> isolée en 'use client' */}
      </main>
    </>
  )
}
```

---

## Gabarit — composant client isolé

```tsx
// @cdc 5.0 — 'use client' isolé : jamais sur la page entière
'use client'
import { motion } from 'framer-motion'
// ⚠️ motion sur wrappers décoratifs uniquement (div, section)
// Jamais sur h1, h2, p, li, article

interface [NomComposant]Props {
  // props typées strict, toujours exportées
}
export type { [NomComposant]Props }

export function [NomComposant]({ ... }: [NomComposant]Props) {
  // logique interactive uniquement — jamais de contenu textuel principal
}
```

---

## Règles rendu bots

| Règle | Correct | Interdit |
|-------|---------|---------|
| Contenu textuel | Rendu dans page.tsx serveur | useEffect / useState |
| Fetch data | Dans getData() serveur | useEffect, SWR |
| Framer Motion | Sur `<motion.div>` décoratifs | Sur h1, h2, p, li |
| JSON-LD | `<script>` dans JSX serveur | useEffect côté client |

Vérification :
```bash
curl -s https://[PREVIEW_URL]/chien/marque | grep -o '<h1[^>]*>.*</h1>'
```
