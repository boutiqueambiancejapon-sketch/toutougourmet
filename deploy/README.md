# Déploiement sur le VPS (structure « boulot », sans Coolify)

GitHub est la source. À chaque push sur `claude/toutou-gourmet-setup-3mRbP`, la GitHub Action
`deploy-vps.yml` se connecte au VPS en SSH et lance `/srv/toutou/deploy.sh`.
Inactive tant que la variable de repo `VPS_DEPLOY` n'est pas à `true` : d'ici là, la prod reste sur Vercel.

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
3. Remplir `/srv/toutou/shared/.env` (mêmes variables que sur Vercel + `DATABASE_URL=postgresql:///toutou`).
4. Premier build : `sudo -u toutou /srv/toutou/deploy.sh`, vérifier `curl -I http://127.0.0.1:3000`.
5. Jour de la bascule : `deploy/Caddyfile` → `/etc/caddy/Caddyfile`, `systemctl reload caddy`, DNS vers le VPS,
   secrets `VPS_HOST` + `VPS_SSH_KEY` et variable `VPS_DEPLOY=true` dans GitHub.
6. Copie des sauvegardes hors du serveur : configurer un remote rclone nommé `offsite` (stockage objet S3).
