# Scripts — Toutou Gourmet

## submit-indexing.mjs (recommandé)

Script Node zéro-dépendance qui appelle `/api/indexing` (déployée sur Vercel).
Construit les URLs canoniques directement depuis le frontmatter MDX
(`categorySlug` pour blog, `marque/<slug>` pour comparatifs) — impossible
de se tromper d'URL.

### Usage

```bash
# Une URL unique
npm run indexing:submit -- --url https://www.toutou-gourmet.com/chien/alimentation-quotidienne/chien-peut-manger-yaourt

# Toutes les URLs du site (max 200/jour, quota Google)
npm run indexing:submit -- --all

# Depuis le diff git (ajoutés + modifiés depuis un ref)
npm run indexing:submit -- --since HEAD~5
npm run indexing:submit -- --since main

# Avec filtre regex sur l'URL
npm run indexing:submit -- --all --filter "yaourt|miel|curcuma"

# Dry run (affiche sans envoyer)
npm run indexing:submit -- --all --dry-run

# Supprimer une URL de l'index
npm run indexing:submit -- --url https://www.toutou-gourmet.com/old-page --action delete
```

### Env

```bash
# Dans .env.local (jamais committé)
INDEXING_API_SECRET=xxx
```

Ou inline : `INDEXING_API_SECRET=xxx npm run indexing:submit -- --all`.

### GitHub Action (automatique)

`.github/workflows/indexing.yml` se déclenche à chaque push sur `main`
touchant `content/blog/**.mdx` ou `content/comparatifs/**.mdx`. Il
détecte les fichiers ajoutés/modifiés via `git diff`, construit les
URLs canoniques et les soumet à l'API.

Pour que ça marche :
1. Ajouter le secret `INDEXING_API_SECRET` dans **Settings > Secrets and variables > Actions** du repo GitHub (même valeur que celle de Vercel).
2. S'assurer que `GOOGLE_SERVICE_ACCOUNT_JSON` est bien configurée côté Vercel (env var utilisée par la route `/api/indexing`).

Trigger manuel : **Actions > Google Indexing API > Run workflow**, avec
filter regex optionnel ou `full: true` pour resoumettre tout le site.

---

## google_indexer.py (legacy, usage local)

Soumet des URLs à l'API Google Indexing pour accélérer l'indexation.

### Prérequis

1. **Service account Google** avec l'API Indexing activée
2. Le service account doit être **propriétaire vérifié** dans la Google Search Console pour `www.toutou-gourmet.com`
3. Fichier JSON du service account stocké localement (jamais dans le repo)

```bash
pip install -r scripts/requirements.txt
```

### Usage

```bash
# URL unique
python scripts/google_indexer.py --url "https://www.toutou-gourmet.com/chien/urgences/aliments-toxiques-chien-liste-complete" --action update --credentials /path/to/sa.json

# Batch depuis un fichier
python scripts/google_indexer.py --file urls.txt --action update --credentials /path/to/sa.json

# Toutes les URLs du site (auto-détection MDX)
python scripts/google_indexer.py --auto --action update --credentials /path/to/sa.json

# Filtrer certaines pages (regex sur le slug)
python scripts/google_indexer.py --auto --action update --filter "spiruline|taurine|toxiques" --credentials /path/to/sa.json

# Depuis le sitemap
python scripts/google_indexer.py --sitemap "https://www.toutou-gourmet.com/sitemap.xml" --action update --credentials /path/to/sa.json

# Dry run (affiche sans soumettre)
python scripts/google_indexer.py --auto --action update --dry-run

# Supprimer une URL de l'index
python scripts/google_indexer.py --url "https://www.toutou-gourmet.com/old-page" --action delete --credentials /path/to/sa.json
```

### Variable d'environnement

Au lieu de `--credentials`, vous pouvez définir :

```bash
export GOOGLE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
```

### Rapport

Chaque exécution génère un fichier CSV `indexing_report_YYYYMMDD_HHMMSS.csv` avec :
- timestamp, url, action, status (success/error/rate_limited), response

### Limites API

- **200 requêtes/jour** (quota Google Indexing API)
- Backoff exponentiel automatique sur erreur 429
- Le script respecte un délai de 250ms entre chaque requête

### Usage avec Claude Code

Depuis une session Claude Code, demandez simplement :

> "Soumets les 3 nouveaux articles à l'indexation Google"

Claude exécutera :
```bash
python scripts/google_indexer.py --auto --action update --filter "aliments-toxiques|spiruline|taurine" --credentials $GOOGLE_SERVICE_ACCOUNT_JSON
```
