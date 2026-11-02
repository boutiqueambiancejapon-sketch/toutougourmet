# Déploiement sur le VPS (structure « boulot », sans Coolify)

> Mode de travail décidé le 2026-11-01 : le serveur est la source du code, comme l'infra du boulot
> (Claude Code sur le VPS, Remote Control depuis l'iPhone). La GitHub Action de déploiement est retirée.
> `deploy.sh` construit encore depuis `origin/$BRANCH` : à adapter pour construire depuis le dépôt de
> travail du serveur. La clé `/srv/toutou/.ssh/github_actions` ne sert plus : retirer sa ligne de
> `authorized_keys`. La clé `/srv/toutou/.ssh/id_ed25519` (deploy key en lecture seule) ne permet pas
> de pousser : le dépôt de travail a besoin d'un accès en écriture.

## Ce qui tourne sur le serveur

```
Internet ── 80/443 ──► Caddy (service système, HTTPS automatique)
                        └─ www.toutou-gourmet.com ──► Next.js 127.0.0.1:3000 (systemd : toutou-web)
                                                        └─ PostgreSQL local, base « toutou »
cron (utilisateur toutou) ──► backup-db.sh chaque nuit à 3 h 15
```

## Dossiers

| Chemin | Rôle |
|---|---|
| `/srv/toutou/repo` | Clone git, mis à jour par `deploy.sh` (clé de déploiement en lecture seule) |
| `/srv/toutou/releases/<sha>` | Une version construite par dossier, 3 gardées |
| `/srv/toutou/current` | Lien vers la version servie |
| `/srv/toutou/shared/.env` | Variables d'environnement (jamais dans git) |
| `/srv/toutou/backups` | 7 sauvegardes locales de la base |

## Commandes utiles (Termius)

- Déployer à la main : `sudo -u toutou /srv/toutou/deploy.sh` (ajouter `FORCE=1` pour reconstruire la même version)
- Revenir à la version précédente : `sudo -u toutou /srv/toutou/rollback.sh`
- Logs du site : `journalctl -u toutou-web -n 100 --no-pager`
- État : `systemctl status toutou-web`

## Pièges

- Le build se fait dans un dossier neuf : la version en ligne n'est jamais touchée pendant `npm ci` ou `next build`.
- `deploy.sh` est protégé par un verrou : deux pushes rapprochés ne lancent pas deux builds en même temps.
- L'utilisateur `toutou` ne peut lancer qu'une commande en sudo : `systemctl restart toutou-web`.

## Mise en place (une seule fois)

1. Copier le dossier `deploy/` sur le serveur puis `sudo bash setup-server.sh`.
2. Ajouter la clé publique affichée comme *deploy key* (lecture seule) du repo, puis cloner dans `/srv/toutou/repo`.
3. Remplir `/srv/toutou/shared/.env` (mêmes variables que sur Vercel + `DATABASE_URL=postgresql:///toutou?host=/var/run/postgresql`).
4. Premier build : `sudo -u toutou /srv/toutou/deploy.sh`, vérifier `curl -I http://127.0.0.1:3000`.
5. Jour de la bascule : `deploy/Caddyfile` → `/etc/caddy/Caddyfile`, `systemctl reload caddy`, DNS vers le VPS.
6. Copie des sauvegardes hors du serveur : configurer un remote rclone nommé `offsite` (stockage objet S3).

## Comptes (lot 4)

Les comptes vivent dans la base `toutou`, schéma Postgres `app` (tables Better Auth `user`, `session`, `account`, `verification`, `rate_limit`, plus `dog` et `weight_log`). Mots de passe hachés (scrypt) dans `app.account`, aucun service d'authentification extérieur.

Variables à ajouter dans `/srv/toutou/shared/.env` :

| Variable | Valeur |
| --- | --- |
| `BETTER_AUTH_SECRET` | 32 octets aléatoires : `openssl rand -base64 32`. Ne jamais le changer après la mise en ligne (toutes les sessions sauteraient). |
| `BETTER_AUTH_URL` | `https://www.toutou-gourmet.com` (adresse publique : sert aux liens des e-mails, à la vérification d'origine CSRF et aux cookies `Secure`). Préversion : son adresse à elle. |
| `BREVO_API_KEY` | déjà présente (newsletter), réutilisée pour les e-mails transactionnels. |
| `BREVO_SENDER_EMAIL` | `bonjour@toutou-gourmet.com` (expéditeur actif chez Brevo). Sans lui, les e-mails de compte ne partent pas (erreur journalisée). Pas de boîte de réception sur ce domaine : chaque e-mail renvoie vers le formulaire de contact. |
| `BREVO_SENDER_NAME` | `Toutou Gourmet` (valeur par défaut si absente). |
| `MAIL_LOG_ONLY` | à laisser vide en production. `1` = e-mails écrits dans le journal au lieu d'être envoyés (tests). |

Migration (à lancer avant le redémarrage, avec le compte propriétaire de la base) :

```bash
cd /srv/toutou/releases/<nouvelle-version>    # ou le dépôt, après npm ci
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' npx drizzle-kit migrate
sudo -u postgres psql -d toutou -c '\dt app.*'  # vérifier
```

`drizzle-kit migrate` est idempotent : il note les migrations appliquées dans `app.__drizzle_migrations` et ne rejoue que les nouvelles (fichiers `db/migrations/`). Une nouvelle migration se génère après un changement de `db/schema/` avec `npx drizzle-kit generate --name <sujet>`. Si la préversion tourne sous `administrator`, lui donner les droits : `GRANT USAGE ON SCHEMA app TO administrator; GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO administrator;`.

RGPD, déjà en place dans le code : export JSON des données (`/api/compte/export`, bouton « Télécharger mes données » sur `/compte`), suppression du compte avec mot de passe (`/compte/supprimer`, cascade sur sessions, comptes, chiens et pesées, e-mail de confirmation), section « Ton compte » de la politique de confidentialité.

Purge des comptes non confirmés (promise par la politique de confidentialité : 30 jours). Le script supprime aussi les jetons de vérification et les sessions expirés. Aucune minuterie n'est installée : lancer à la main, ou créer plus tard un timer systemd quotidien sur le modèle de `toutou-ingest.timer`.

```bash
cd /srv/toutou/current
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs --dry   # compte sans supprimer
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs
```

Base de développement : `toutou_accounts_dev` (rôle `administrator`), jamais `toutou`.
