# CI/CD & Tests — Toutou Gourmet

## TL;DR

- GitHub → Vercel · jamais push direct sur main
- CI/CD : .github/workflows/ci.yml à créer (DÉCISION À VALIDER)
- Tests : vitest à installer (zéro tests actuellement)
- Scripts manquants : type-check · test · audit

---

## 13.1 Stratégie de branches

| Branche | Environnement | Protection |
|---------|--------------|------------|
| main | Production | PR obligatoire |
| feature/xxx | Preview éphémère | — |
| fix/xxx | Preview éphémère | — |
| content/xxx | Preview éphémère | — |

Règles :
- Jamais de push direct sur main
- Chaque PR → preview deployment automatique Vercel
- Merge sur main → déploiement production automatique

---

## 13.2 GitHub Actions — à créer

Fichier : `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm audit --audit-level=high --omit=dev
```

---

## 13.3 Scripts package.json — état actuel vs requis

| Script | Présent | À ajouter |
|--------|---------|-----------|
| dev | ✓ | — |
| build | ✓ | — |
| postbuild | ✓ (next-sitemap) | — |
| start | ✓ | — |
| lint | ✓ | — |
| type-check | ✗ | `tsc --noEmit` |
| test | ✗ | `vitest run` |
| test:watch | ✗ | `vitest` |
| test:e2e | ✗ | `playwright test` (V2) |
| audit | ✗ | `npm audit --audit-level=high --omit=dev` |

---

## 13.4 Protection branche main (GitHub)

- Require PR reviews : 1 reviewer minimum — DÉCISION À VALIDER
- Require status checks : CI workflow (quand créé)
- Jamais de push direct

---

## 13.5 Vercel — vercel.json à créer

```json
{
  "github": {
    "silent": true
  }
}
```

Variables d'environnement à configurer dans Vercel Dashboard :
- `NEXT_PUBLIC_SITE_URL` : Production + Preview + Development
- Autres secrets si ajoutés

---

## 14. Tests

### Infrastructure à créer

```
vitest.config.ts          ← à créer à la racine
tests/
├── setup.ts              ← import @testing-library/jest-dom
├── fixtures/             ← données de test
└── helpers/              ← utilitaires de test
```

### Configuration vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['lib/**', 'utils/**'],
    },
  },
})
```

### Dépendances à installer

```bash
npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths @testing-library/react @testing-library/jest-dom jsdom
```

### Priorités de test V1

| Scope | Fichiers | Priorité |
|-------|---------|---------|
| Calculateurs | lib/calculators.ts | V1 |
| Logique quiz | lib/quiz.ts | V1 |
| Utils | lib/utils.ts | V1 |
| Affiliés | lib/affiliate.ts | V1 |
| Composants UI critiques | components/ui/ | V1 |
| E2E parcours quiz | tests/e2e/ | V2 |

Colocation : `[composant].test.tsx` à côté du composant.
