# Instructions Claude Code — Toutou Gourmet

Lis PROGRESS.md avant chaque session.
Lis le fichier /docs/ correspondant à ta tâche.
Pour tâche transversale : lis docs/CDC.md uniquement.
**Rédaction de contenu (article, page pilier, page cluster) : lis docs/09-seo-geo-guide.md en entier avant d'écrire la première ligne.**

## Projet

Domaine : www.toutou-gourmet.com
Stack : Next.js 16.1.6 + React 19 + TypeScript strict + Tailwind v4 + MDX
Next.js : 16.1.6 — ne jamais changer sans PR dédiée
Langue défaut : français (monolangue, pas de i18n)
Déploiement : Vercel · prod sur main · GitHub

## Comportement agent

- Tâche non-triviale (3+ étapes) → plan dans tasks/todo.md avant exécution
- Blocage → STOP + re-plan, jamais de pushing
- Correction reçue → mettre à jour tasks/lessons.md immédiatement
- Tâche terminée → prouver que ça marche avant de marquer done
- Bug report → fix autonome, zéro questions, pointer logs + tests
- Sous-agents → décharger recherche, exploration, analyse parallèle

## Filtre qualité — vérifier avant chaque commit

- [ ] TypeScript : zéro `any`, zéro erreur `tsc --noEmit`
- [ ] Lint : zéro erreur `next lint`
- [ ] next/image : jamais de `<img>` natif · width+height sur toutes les images · priority sur LCP uniquement
- [ ] Variables CSS : jamais de valeur hardcodée
- [ ] Composants : aucun > 150 lignes
- [ ] TODO : aucun sans numéro d'issue GitHub
- [ ] Secrets : aucun dans le code, tout dans Vercel Dashboard
- [ ] Bots : `curl -s [PREVIEW_URL]/[page]` retourne H1 + premier paragraphe sans JS
- [ ] CSP : unsafe-eval présent → exception documentée dans DECISIONS.md (Plausible Analytics)
- [ ] Polices : zéro requête fonts.googleapis.com · max 2 familles · DM_Sans 3 weights (exception documentée DECISIONS.md)
- [ ] Above-fold : aucun import Framer Motion sur composants visibles sans scroll
- [ ] Dette technique : adjustFontFallback absent sur Fraunces + DM_Sans — ajouter si on touche layout.tsx
- [ ] **Article MDX : `frontmatter.category` aligné avec le mapping de `components/blog/blog-categories.ts` — sinon cover + OG tombent sur le fallback `cat-nutrition`**

## Règles Git absolues

- Jamais de push direct sur main
- Une feature = une branche = une PR
- Conventional Commits en anglais
- Chaque PR déclenche un preview Vercel automatiquement

## Règles absolues code

- TypeScript strict, jamais de `any`
- Variables CSS uniquement, jamais de valeur hardcodée
- next/image obligatoire, jamais de `<img>` natif
- next/image : width + height obligatoires sur toutes les images
- next/image : priority uniquement sur l'image LCP (above-fold) — une seule par page
- HTML sémantique, jamais de `<div>` inutile
- prefers-reduced-motion respecté (déjà dans globals.css)
- Polices : next/font uniquement · jamais de `<link>` Google Fonts
- Jamais de `'use client'` sur un fichier page.tsx — isoler dans un sous-composant
- Contenu textuel indexable (H1, H2, p, li) → rendu serveur obligatoire
- Fetch → toujours spécifier `{ next: { revalidate: X } }` ou `{ cache: 'no-store' }` explicitement
- Pas d'explication de ce que tu vas faire — fais-le
- Un seul doute bloquant à la fois

## Images & covers article

Chaque page a une cover illustrée dérivée automatiquement. **Jamais** imposer
un chemin d'image en dur dans un composant ou un frontmatter : passer par le
composant `<Illustration slot="..." />` qui résout le fichier via le manifest.

- **Source de vérité** : `data/images-manifest.ts` (1 entrée par slot : id, group, ratio, tone, decorations, `imageReady`)
- **Mapping catégorie → slot** : `components/blog/blog-categories.ts` (`getCategoryVisual(label)`)
- **Résolution runtime** : `<Illustration>` lit `slot.imageReady` → sert `/public/images/{group}/{id}.webp` si `true`, sinon rend le placeholder SVG + overlay décoratif
- **Open Graph** : l'image social d'un article est dérivée **automatiquement** de `frontmatter.category` dans `generateMetadata` (voir `app/chien/[category]/[slug]/page.tsx` et `app/blog/[slug]/page.tsx`) — ne pas la hardcoder

### Ajouter une nouvelle catégorie d'article

1. Ajouter l'entrée dans `CATEGORY_TABLE` de `blog-categories.ts` (slot, pillVar, emoji)
2. Déclarer le slot correspondant dans `data/images-manifest.ts` (`imageReady: false` initialement)
3. Générer le WebP via Gemini en suivant `docs/prompts/gemini-image-system.md` (ratio 3:2, tone aligné pill color)
4. Déposer le fichier dans `/public/images/articles/{slot}.webp`, faire tourner `node scripts/compress-images.mjs` (target < 150 KB)
5. Flipper `imageReady: true` sur le slot du manifest
6. Commit : `feat(images): add cover for {category}`

### Écrire un nouvel article MDX

- `frontmatter.category` **doit** matcher une clé existante de `CATEGORY_TABLE` (sinon fallback silencieux sur `cat-nutrition` — bug visuel)
- `frontmatter.categorySlug` pilote la route finale (`/chien/{categorySlug}/{slug}`)
- Aucune image de cover à ajouter dans le MDX : la cover est résolue automatiquement depuis la catégorie

## Annotation dans le code

```
// @cdc [section] — [règle courte]
```

## Fin de session

1. Mettre à jour PROGRESS.md
2. Mettre à jour DECISIONS.md si nouvelle décision
3. `git add PROGRESS.md DECISIONS.md && git commit -m "docs: update PROGRESS and DECISIONS"`
4. Pusher la branche courante (jamais main directement)
