# Scripts — Toutou Gourmet

## google_indexer.py

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
