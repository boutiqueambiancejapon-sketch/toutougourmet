#!/usr/bin/env python3
"""
Google Indexing API — Soumet des URLs à l'indexation Google.

Usage:
  # URL unique
  python google_indexer.py --url "https://www.toutou-gourmet.com/blog" --action update

  # Batch depuis un fichier (1 URL par ligne)
  python google_indexer.py --file urls.txt --action update

  # Toutes les URLs du sitemap
  python google_indexer.py --sitemap "https://www.toutou-gourmet.com/sitemap.xml" --action update

  # Auto-détection depuis les fichiers MDX du projet
  python google_indexer.py --auto --action update
  python google_indexer.py --auto --action update --filter "spiruline|taurine|toxiques"

  # Dry run (affiche sans soumettre)
  python google_indexer.py --auto --action update --dry-run

Auth:
  --credentials /path/to/service-account.json
  ou variable d'env GOOGLE_SERVICE_ACCOUNT_JSON (chemin vers le fichier)

Dépendances: pip install google-auth google-auth-httplib2 requests
"""

import argparse
import csv
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests

# ─── Configuration ────────────────────────────────────────────────────────────

INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
SCOPES = ["https://www.googleapis.com/auth/indexing"]
MAX_REQUESTS_PER_DAY = 200
SITE_URL = "https://www.toutou-gourmet.com"

# Backoff exponentiel
INITIAL_BACKOFF = 2  # secondes
MAX_BACKOFF = 64  # secondes
MAX_RETRIES = 5

# ─── Logging ──────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("google_indexer")

# ─── Auth ─────────────────────────────────────────────────────────────────────


def get_credentials(credentials_path: str):
    """Charge les credentials depuis un fichier JSON de service account."""
    from google.oauth2 import service_account as sa

    if not os.path.isfile(credentials_path):
        log.error("Fichier de credentials introuvable : %s", credentials_path)
        sys.exit(1)

    credentials = sa.Credentials.from_service_account_file(
        credentials_path, scopes=SCOPES
    )
    log.info("Credentials chargées depuis %s", credentials_path)
    return credentials


def get_auth_token(credentials) -> str:
    """Obtient un token d'accès OAuth2."""
    from google.auth.transport.requests import Request

    credentials.refresh(Request())
    return credentials.token


# ─── Soumission ───────────────────────────────────────────────────────────────


def submit_url(
    url: str, action: str, token: str, dry_run: bool = False
) -> dict:
    """Soumet une URL à l'API Google Indexing.

    Returns:
        dict avec keys: url, action, status, response, timestamp
    """
    action_type = "URL_UPDATED" if action == "update" else "URL_DELETED"

    result = {
        "url": url,
        "action": action_type,
        "status": "pending",
        "response": "",
        "timestamp": datetime.now().isoformat(),
    }

    if dry_run:
        result["status"] = "dry_run"
        result["response"] = "Skipped (dry run)"
        log.info("[DRY RUN] %s → %s", action_type, url)
        return result

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
    }
    body = {"url": url, "type": action_type}

    backoff = INITIAL_BACKOFF
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.post(
                INDEXING_ENDPOINT, json=body, headers=headers, timeout=30
            )

            if resp.status_code == 200:
                result["status"] = "success"
                result["response"] = resp.text[:200]
                log.info("✓ %s → %s (200)", action_type, url)
                return result

            if resp.status_code == 429:
                result["status"] = "rate_limited"
                result["response"] = f"429 Rate Limited (attempt {attempt}/{MAX_RETRIES})"
                log.warning(
                    "⏳ Rate limited on %s — backoff %ds (attempt %d/%d)",
                    url,
                    backoff,
                    attempt,
                    MAX_RETRIES,
                )
                time.sleep(backoff)
                backoff = min(backoff * 2, MAX_BACKOFF)
                continue

            # Autres erreurs
            result["status"] = f"error_{resp.status_code}"
            result["response"] = resp.text[:200]
            log.error("✗ %s → %s (%d: %s)", action_type, url, resp.status_code, resp.text[:100])
            return result

        except requests.RequestException as e:
            result["status"] = "network_error"
            result["response"] = str(e)[:200]
            log.error("✗ Network error on %s: %s", url, e)
            if attempt < MAX_RETRIES:
                time.sleep(backoff)
                backoff = min(backoff * 2, MAX_BACKOFF)
                continue
            return result

    result["status"] = "max_retries_exceeded"
    result["response"] = f"Gave up after {MAX_RETRIES} retries (429)"
    log.error("✗ Max retries exceeded for %s", url)
    return result


# ─── Collecte d'URLs ─────────────────────────────────────────────────────────


def urls_from_file(filepath: str) -> list[str]:
    """Lit les URLs depuis un fichier texte (1 par ligne)."""
    p = Path(filepath)
    if not p.is_file():
        log.error("Fichier introuvable : %s", filepath)
        sys.exit(1)
    urls = [
        line.strip()
        for line in p.read_text().splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    log.info("📄 %d URLs chargées depuis %s", len(urls), filepath)
    return urls


def urls_from_sitemap(sitemap_url: str) -> list[str]:
    """Extrait les URLs depuis un sitemap XML."""
    try:
        resp = requests.get(sitemap_url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as e:
        log.error("Impossible de récupérer le sitemap : %s", e)
        sys.exit(1)

    # Parsing simple avec regex (évite la dépendance lxml)
    urls = re.findall(r"<loc>(https?://[^<]+)</loc>", resp.text)
    log.info("🗺️  %d URLs extraites du sitemap %s", len(urls), sitemap_url)
    return urls


def urls_from_mdx(project_root: str, filter_pattern: str | None = None) -> list[str]:
    """Génère les URLs depuis les fichiers MDX du projet.

    Lit les fichiers content/blog/*.mdx et content/comparatifs/*.mdx,
    extrait le categorySlug du frontmatter, et construit l'URL canonique.
    """
    content_dir = Path(project_root) / "content"
    urls = []

    for subdir in ["blog", "comparatifs"]:
        mdx_dir = content_dir / subdir
        if not mdx_dir.is_dir():
            continue

        for mdx_file in sorted(mdx_dir.glob("*.mdx")):
            slug = mdx_file.stem
            text = mdx_file.read_text(encoding="utf-8")

            # Extraire categorySlug du frontmatter
            category_match = re.search(r'^categorySlug:\s*["\']?(\S+?)["\']?\s*$', text, re.MULTILINE)
            if category_match:
                category_slug = category_match.group(1)
                url = f"{SITE_URL}/chien/{category_slug}/{slug}"
            else:
                url = f"{SITE_URL}/blog/{slug}"

            if filter_pattern and not re.search(filter_pattern, slug, re.IGNORECASE):
                continue

            urls.append(url)

    log.info("📁 %d URLs générées depuis les fichiers MDX", len(urls))
    return urls


# ─── Rapport CSV ──────────────────────────────────────────────────────────────


def write_csv_report(results: list[dict], output_path: str) -> None:
    """Écrit les résultats dans un fichier CSV."""
    fieldnames = ["timestamp", "url", "action", "status", "response"]
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    log.info("📊 Rapport CSV écrit dans %s", output_path)


# ─── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Google Indexing API — Soumet des URLs à l'indexation.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    # Sources d'URLs (mutuellement exclusives)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--url", help="URL unique à soumettre")
    source.add_argument("--file", help="Fichier texte contenant les URLs (1 par ligne)")
    source.add_argument("--sitemap", help="URL du sitemap XML")
    source.add_argument(
        "--auto",
        action="store_true",
        help="Auto-détection depuis les fichiers MDX du projet",
    )

    parser.add_argument(
        "--action",
        choices=["update", "delete"],
        required=True,
        help="Action: 'update' (URL_UPDATED) ou 'delete' (URL_DELETED)",
    )
    parser.add_argument(
        "--credentials",
        default=os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON"),
        help="Chemin vers le fichier JSON du service account (défaut: env GOOGLE_SERVICE_ACCOUNT_JSON)",
    )
    parser.add_argument(
        "--filter",
        help="Regex pour filtrer les URLs en mode --auto (appliqué sur le slug)",
    )
    parser.add_argument(
        "--output",
        default=f"indexing_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        help="Chemin du fichier CSV de rapport (défaut: indexing_report_YYYYMMDD.csv)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Affiche les URLs sans les soumettre",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=MAX_REQUESTS_PER_DAY,
        help=f"Nombre max d'URLs à soumettre (défaut: {MAX_REQUESTS_PER_DAY})",
    )

    args = parser.parse_args()

    # ── Collecter les URLs ──
    if args.url:
        urls = [args.url]
    elif args.file:
        urls = urls_from_file(args.file)
    elif args.sitemap:
        urls = urls_from_sitemap(args.sitemap)
    elif args.auto:
        project_root = str(Path(__file__).resolve().parent.parent)
        urls = urls_from_mdx(project_root, args.filter)

    if not urls:
        log.warning("Aucune URL à soumettre.")
        sys.exit(0)

    # ── Limiter ──
    if len(urls) > args.limit:
        log.warning(
            "⚠️  %d URLs trouvées, limitées à %d (quota journalier API)",
            len(urls),
            args.limit,
        )
        urls = urls[:args.limit]

    log.info("🚀 %d URL(s) à soumettre en mode '%s'", len(urls), args.action)

    # ── Auth ──
    if not args.dry_run:
        if not args.credentials:
            log.error(
                "Credentials manquantes. Utilisez --credentials ou "
                "la variable d'env GOOGLE_SERVICE_ACCOUNT_JSON"
            )
            sys.exit(1)
        credentials = get_credentials(args.credentials)
        token = get_auth_token(credentials)
    else:
        token = ""

    # ── Soumission ──
    results = []
    success_count = 0
    error_count = 0

    for i, url in enumerate(urls, 1):
        log.info("[%d/%d] %s", i, len(urls), url)
        result = submit_url(url, args.action, token, dry_run=args.dry_run)
        results.append(result)

        if result["status"] == "success" or result["status"] == "dry_run":
            success_count += 1
        else:
            error_count += 1

        # Respecter le rate limiting : ~5 req/sec max
        if not args.dry_run and i < len(urls):
            time.sleep(0.25)

    # ── Rapport ──
    write_csv_report(results, args.output)

    log.info("─" * 50)
    log.info("✅ Succès : %d / %d", success_count, len(urls))
    if error_count:
        log.info("❌ Erreurs : %d / %d", error_count, len(urls))
    log.info("📊 Rapport : %s", args.output)


if __name__ == "__main__":
    main()
