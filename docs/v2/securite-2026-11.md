# Audit de sécurité, 2 novembre 2026

Branche : `sec/audit` (partie de `origin/v2` au commit 69eeb57). Rien n'a été poussé sur `v2`, et rien n'a été modifié sur le serveur : la partie B ne contient que des propositions.

## Résumé

| Gravité | Constat | État |
|---|---|---|
| Critique | Next 16.1.6 : 38 avis de sécurité, dont 5 critiques (exécution de code à distance par l'optimiseur d'images en SVG ou AVIF, ou par `use cache`) et plusieurs contournements du proxy | Next n'est pas modifié (règle du chantier). Mesures prises en attendant : AVIF retiré, le tableau de bord ne dépend plus du proxy. **Il faut une branche dédiée pour monter Next.** |
| Critique | SSH accepte les mots de passe, `administrator` en a un et dispose de `sudo` sans mot de passe. Environ 500 essais de mots de passe ont échoué en 24 h | Proposition B1 |
| Important | Tableau de bord protégé seulement par `proxy.ts`, alors que la version de Next a des contournements connus du proxy | **Corrigé** : chaque page, route et action revérifie l'authentification |
| Important | Actions du tableau de bord exposées au CSRF : le navigateur renvoie l'authentification Basic d'un site à l'autre, et Next 16.1.6 accepte l'origine `null` | **Corrigé** : une origine identique à l'hôte est exigée |
| Important | Authentification Basic du tableau de bord sans limite d'essais | **Corrigé** : 429 après 10 échecs par adresse en 15 min |
| Important | sharp 0.34.5 (libvips, libheif, librsvg vulnérables) traite les photos envoyées au scanner par les comptes connectés | À faire dans une branche dédiée (0.35 est une version majeure, voir A1) |
| Important | Adresses IP stockées : `app.session.ip_address` et clés `ip\|chemin` dans `app.rate_limit` (Better Auth) | **Corrigé** dans le code. Nettoyage des données existantes : B9 |
| Important | Inscription à la lettre (`/api/contact`) sans limite de débit | **Corrigé** |
| Important | Unités systemd `toutou-*` non durcies (note 9,2 « UNSAFE » pour `toutou-web`) | Proposition B5 |
| Mineur | CSP avec `unsafe-eval` ; pas de `frame-ancestors`, `object-src`, `base-uri`, `form-action` | **Corrigé**, testé sans violation |
| Mineur | `/api/indexing` et `/api/search-console` : secret comparé sans temps constant, pas de limite d'essais, erreurs Google renvoyées telles quelles, paramètres libres | **Corrigé** |
| Mineur | `/api/geo` sans limite ; `/api/bien-nourri-count` lance une requête SQL à chaque appel | **Corrigé** (30 appels/min ; résultat gardé 1 min en mémoire) |
| Mineur | En-tête `X-Powered-By: Next.js` | **Corrigé** |
| Mineur | Caddy 2.6.2 (paquet Ubuntu, ancien) ; `dashboard.` sert tout le site et un robots.txt qui autorise tout | Propositions B6 et B7 |
| Mineur | `X11Forwarding yes` et `PermitRootLogin prohibit-password` dans SSH | B1 |
| Mineur | Sauvegardes : un seul fichier de 1,6 Ko (suspect), droits 664, pas de copie hors du serveur | B8 |
| Mineur | `analytics.hits.ip` : IP gardée seulement pour les robots, pendant 180 jours | Conforme à la règle (aucune IP de visiteur humain). À raccourcir si on le souhaite |

## A. Application : ce qui est corrigé dans `sec/audit`

Commits, du plus ancien au plus récent :

1. `chore(deps): remove unused framer-motion and @vercel/analytics` : aucun import dans `app`, `components` ni `lib` (vérifié avec grep). `framer-motion` est aussi retiré de `optimizePackageImports`.
2. `fix(deps): apply non-breaking npm audit fixes and override next's postcss` : `npm audit fix` sans `--force`, plus un `overrides` qui fait passer la `postcss` 8.4.31 figée par Next à `^8.5.32`, dans la même version majeure.
3. `feat(security): rate-limit newsletter signup and geo lookups`
4. `fix(security): re-check dashboard auth in every page, route and action` (`lib/dashboard/guard.ts`)
5. `feat(security): lock dashboard Basic auth after 10 failures per IP` (`proxy.ts`)
6. `fix(security): harden secret-protected indexing and search-console routes` (`lib/server/api-secret.ts`)
7. `fix(privacy): stop storing IP addresses in auth sessions and rate limits`
8. `fix(security): tighten CSP and drop AVIF from the image optimizer`
9. `fix(security): disable the X-Powered-By header`

### A1. Dépendances (`npm audit`)

Avant : 33 avis (1 critique, 9 élevés, 22 modérés, 1 faible ; le chiffre de 30 venait d'un relevé plus ancien). Après : **21** (1 critique, 1 élevé, 19 modérés).

Avis restants et raison :

| Paquet | Gravité | Utilisé en production ? | Raison |
|---|---|---|---|
| `next` 16.1.6 | critique | oui | Corrigé à partir de 16.4.4 (≥ 16.4.1 pour les avis critiques sur SVG et `use cache`). Changement de Next interdit dans ce chantier : **branche dédiée `chore/next-16.4`**, à tester en préversion. |
| `sharp` 0.34.5 | élevé | oui (scanner, images OG, optimiseur d'images) | Corrigé en 0.35.5, version majeure pour un paquet en 0.x. Next 16.1.6 déclare `sharp ^0.34.4` : il faudra un `overrides` et un test de l'optimiseur. À faire dans la même branche que Next. Ce qui limite le risque aujourd'hui : l'envoi est réservé aux comptes confirmés, le type de fichier est vérifié sur les premiers octets, `limitInputPixels` vaut 50 Mpx et le débit est limité. |
| `eslint`, `eslint-config-next`, `typescript-eslint`, `minimatch`… | modéré | non (outils de développement) | Ils demandent eslint 10 ou une autre version majeure. Aucun impact en production. |
| `drizzle-kit`, `esbuild`, `@esbuild-kit/*` | modéré | non (migrations, développement) | La faille d'esbuild ne touche que son serveur de développement, que nous n'utilisons pas. |

Avis corrigés : `js-yaml` (gray-matter lit le frontmatter), `picomatch`, `brace-expansion`, `nanoid`, `flatted`, `postcss` (y compris celle de Next), `source-map-js`, `yaml`, `browserslist`, `@babel/core`, `@humanfs/node`, `baseline-browser-mapping`.

### A2. Limites de débit (en mémoire, par adresse, adresse jamais écrite)

| Route | Avant | Après |
|---|---|---|
| `/api/contact` (inscription) | aucune | 5 en 10 min, 20 par jour, réponse 429 avec `Retry-After` ; adresse limitée à 254 caractères, `source` à 60 |
| `/api/contact` (message) | 5 en 10 min | inchangée, avec `Retry-After` en plus |
| `/api/e` | 60/min (répond 204) | inchangée |
| `/api/geo` | aucune | 30/min, réponse 429 |
| `/api/bien-nourri-count` | SQL à chaque appel | résultat gardé 60 s en mémoire |
| `/api/scanner` (POST) | 3/min, 20/jour par compte, plus le quota mensuel | inchangée |
| `/api/scanner/code` | 12/min, 200/jour par adresse | inchangée |
| `/api/scanner/signaler` | 10/h par compte | inchangée |
| `/api/auth/*` (Better Auth) | 60/min ; connexion 5/min ; inscription 3/min ; réinitialisation 3 en 5 min, etc. Compteurs en base | mêmes règles, **compteurs en mémoire** (la clé de Better Auth contient l'IP en clair) |
| `/tableau-de-bord` (Basic) | aucune | 429 pendant 15 min après 10 échecs |
| `/api/indexing`, `/api/search-console` | aucune | 429 après 5 mauvais secrets en 15 min |

Pour que ces limites fonctionnent, Caddy doit transmettre l'adresse du client et une seule valeur dans `X-Forwarded-For`. Caddy 2.6 remplace l'en-tête reçu d'un client non approuvé (pas de `trusted_proxies`), donc la condition est remplie. Better Auth ignore la limite quand l'en-tête contient plusieurs valeurs. Si un CDN est un jour placé devant Caddy, il faudra configurer `trusted_proxies` dans Caddy et `advanced.ipAddress` dans Better Auth.

### A3. En-têtes

- CSP : `'unsafe-eval'` est remplacé par `'wasm-unsafe-eval'`, nécessaire au lecteur zxing (.wasm) du scanner. Ajouts : `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-inline'` reste pour les scripts en ligne de Next : les pages sont statiques et n'ont pas de nonce. Pour le retirer, il faudrait des nonces, donc des pages dynamiques, ce qui ne vaut pas le coût.
- Test Playwright à 390 px sur `/`, un article, `/scanner`, `/compte/connexion` et `/outils/bien-nourri` : statut 200, H1 présent, gtag.js chargé, **aucune erreur JS ni violation CSP**. Le `.wasm` zxing se compile sous la nouvelle CSP, et un `eval()` lancé par un script de la page est bien bloqué (violation `script-src eval`).
- Images : `formats: ['image/webp']`. L'encodage AVIF de l'optimiseur est visé par GHSA-2xp9-vwfh-vxw4 et consomme beaucoup de CPU. Le SVG reste non optimisé (`dangerouslyAllowSVG` absent), et aucun `remotePatterns` n'est déclaré : seules les images de `public/` passent par l'optimiseur.
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` : déjà en place.
- `Permissions-Policy` : caméra refusée partout sauf `/scanner` (`camera=(self)`). Déjà en place et vérifié.
- HSTS : envoyé par Caddy (`max-age=31536000; includeSubDomains`), pas par Next. Cela suffit.

### A4. Routes et autorisations

| Point d'entrée | Qui peut l'appeler | Contrôles |
|---|---|---|
| `/api/auth/*` | public | Better Auth : Origin et Fetch Metadata, limites, scrypt, adresse à confirmer |
| `/api/compte/export`, `/profil`, `/ration` | compte connecté | session relue ; seules les données de l'utilisateur ; `no-store` |
| `/api/scanner` GET/POST | compte connecté | session, débit, quota, taille, type lu dans les octets |
| `/api/scanner/code` | public | EAN validé, débit par adresse |
| `/api/scanner/signaler` | compte connecté | UUID validé, message de 1 000 caractères au plus, débit |
| `/api/contact` | public | champ piège, validation serveur, débit (désormais aussi sur l'inscription) |
| `/api/e` | public | origine du même hôte, robots écartés, 2 Ko au plus, débit |
| `/api/geo` | public | débit (ajouté) |
| `/api/bien-nourri-count` | public | lecture seule, résultat gardé en mémoire (ajouté) |
| `/api/indexing`, `/api/search-console` | script avec secret | répondent 501 sans leurs variables. Durcies : temps constant, blocage, URL et paramètres validés, erreurs neutres |
| `/tableau-de-bord/**` (pages et `direct`) | propriétaire (Basic) | proxy, plus **vérification dans chaque page et route** (ajoutée) |
| Actions `tableau-de-bord/emails`, `fiches` | propriétaire | Basic, plus **Origin du même hôte** (ajouté) |
| Actions `/compte/*` | compte connecté | session relue ; propriété du chien vérifiée en base ; cookies `SameSite=Lax` (pas de CSRF possible depuis un autre site) |
| Action `newsletter/desinscription` | public | jeton HMAC comparé en temps constant |

### A5. Secrets et fuites

- Historique Git (`git log -p --all`, 297 000 lignes) : aucune clé Google (`AIza`), Brevo (`xkeysib`, `xsmtpsib`), `sk-`, jeton GitHub, clé privée, ni URL PostgreSQL avec mot de passe. On y trouve seulement l'identifiant GA4 (`G-MDHMHXVJRZ`) et l'identifiant AdSense (`ca-pub-…`), publics par nature. Aucun fichier `.env`, `.pem` ou `.key` suivi par Git.
- `.next/static` après le build : aucune valeur secrète. Le seul résultat est le nom `BETTER_AUTH_SECRET` dans le code client de Better Auth (accesseur générique, sans valeur côté navigateur).
- Aucune variable `NEXT_PUBLIC_` n'est utilisée. Aucun module serveur (`lib/server`) n'est importé par un composant client.
- Messages d'erreur : les routes renvoient des codes neutres. Les deux routes Google renvoyaient le texte des erreurs de l'API : corrigé, le détail ne va plus que dans le journal du serveur.

### A6. Données personnelles

- Export RGPD (`/api/compte/export`) : profil, sessions, chiens, pesées, scans, signalements, formule. Pas de mot de passe haché ni de jeton. Complet.
- Suppression : Better Auth, mot de passe exigé, garde-fou de 5 essais. `ON DELETE CASCADE` couvre session, account, dog, weight_log, membership, scan_history, scan_usage et scan_report. Hors du compte, deux données restent : une éventuelle inscription Brevo à la lettre (désinscription par le lien de chaque lettre) et les messages du formulaire de contact. À mentionner dans la politique de confidentialité si ce n'est pas déjà fait.
- Mots de passe : scrypt (Better Auth), de 8 à 128 caractères.
- Cookies de session : préfixe `tg`, `HttpOnly`, `Secure` (car `BETTER_AUTH_URL` est en https), `SameSite=Lax`. Le témoin `tg_compte` n'a pas `HttpOnly`, c'est voulu : il ne contient aucune valeur secrète.
- IP : `analytics.events` stocke le pays, jamais l'IP. `analytics.hits.ip` reste vide pour les humains et n'est rempli que pour les robots, pendant 180 jours. **Corrigé** : `app.session.ip_address` n'est plus rempli et les compteurs de Better Auth ne vont plus en base. Les lignes existantes sont à nettoyer (B9).

## B. Serveur : propositions à faire valider par le propriétaire

Relevés faits sans aucune écriture. Les commandes ci-dessous **n'ont pas été lancées**.

### B1. SSH (critique)

Constat : `passwordauthentication yes` (effectif, imposé par `/etc/ssh/sshd_config.d/50-cloud-init.conf`), le compte `administrator` a un mot de passe (`passwd -S` : P) et dispose de `sudo NOPASSWD:ALL`. 743 échecs depuis le démarrage de fail2ban, environ 500 en 24 h. Toutes les connexions réussies passent par une clé (`Accepted publickey`, 8 en 24 h). Aussi : `X11Forwarding yes`, `PermitRootLogin prohibit-password`.

```bash
# Garder une session SSH ouverte pendant toute l'opération.
sudo tee /etc/ssh/sshd_config.d/00-toutou-hardening.conf >/dev/null <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
X11Forwarding no
MaxAuthTries 3
EOF
sudo sshd -t && sudo systemctl reload ssh
sudo sshd -T | grep -E '^(passwordauthentication|permitrootlogin|x11forwarding)'
# Tester une NOUVELLE connexion par clé avant de fermer la session en cours.
```

Le fichier commence par `00-` : sshd retient la première valeur lue, donc ce fichier l'emporte sur `50-cloud-init.conf`. Pour aller plus loin, on peut demander un mot de passe pour `sudo`. La mémoire du projet note toutefois que le `sudo` sans mot de passe est gardé volontairement : c'est à décider par le propriétaire.

La clé `github_actions` dans `/srv/toutou/.ssh/authorized_keys` permet une connexion SSH en tant que `toutou`. La mise en ligne passe désormais par le timer local : si GitHub Actions ne s'en sert plus, retirer la clé.

```bash
sudo -u toutou sed -i '/github_actions\|<commentaire de la clé>/d' /srv/toutou/.ssh/authorized_keys   # après vérification du contenu
```

### B2. fail2ban

Actif, une prison `sshd`, 11 adresses bannies, `bantime` 1 h, `maxretry` 5, `findtime` 10 min. Quand les mots de passe seront refusés (B1), ce réglage suffit. Option : bannissements plus longs pour les récidivistes.

```bash
sudo tee /etc/fail2ban/jail.d/recidive.local >/dev/null <<'EOF'
[recidive]
enabled = true
bantime = 1w
findtime = 1d
maxretry = 3
EOF
sudo systemctl reload fail2ban
```

### B3. Pare-feu et ports

ufw est actif, avec refus par défaut en entrée. Seuls 22, 80 et 443 sont ouverts. PostgreSQL (5432), l'API d'administration de Caddy (2019), Next (3000) et la préversion (3001) n'écoutent que sur `127.0.0.1`. Des serveurs de test (`next-server` sur `*:3093` et `*:3199`, lancés par `administrator`) écoutent sur toutes les interfaces : ufw les bloque, mais ils n'ont rien à faire là. Les arrêter quand les sessions qui les ont lancés sont terminées, et lancer les tests avec `-H 127.0.0.1`.

### B4. PostgreSQL

`listen_addresses` est par défaut (localhost) et `ssl = on`. `pg_hba` : `peer` en local, `scram-sha-256` sur 127.0.0.1 et ::1. Rien à changer.

### B5. Droits des fichiers et unités systemd

- `/srv/toutou` est en 750, `/srv/toutou/shared/.env` en 600 (toutou) : bien. `~/.config/toutou/*.env` sont en 600 ; le dossier est en 775, mais `/home/administrator` est en 750, donc personne d'autre n'y accède. Pour faire propre : `chmod 700 ~/.config/toutou`.
- `/var/lib/toutou-geo` et `/var/lib/toutou-seo-logs` sont en 2750 (administrator:toutou) : bien.
- sudoers de `toutou` : seulement `systemctl restart toutou-web`. Bien.
- `toutou` a pour shell `/bin/bash`. Si personne ne se connecte en `toutou`, mettre `nologin` après B1 (`sudo usermod -s /usr/sbin/nologin toutou` ; les services et `sudo -u toutou` continuent de fonctionner).
- Note `systemd-analyze security` : `toutou-web`, `toutou-deploy`, `toutou-purge`, `toutou-seo-rewrite` et `toutou-preview` sont à 9,2 (UNSAFE) ; `toutou-ingest` et `toutou-geoip` à 8,4. Proposition pour `toutou-web`, à tester avant de l'étendre aux autres :

```bash
sudo systemctl edit toutou-web   # ajoute un override, ne touche pas l'unité
# contenu :
[Service]
NoNewPrivileges=true
PrivateTmp=true
PrivateDevices=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/srv/toutou/current/.next/cache
ReadOnlyPaths=/var/lib/toutou-geo
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectKernelLogs=true
ProtectControlGroups=true
ProtectClock=true
ProtectHostname=true
RestrictSUIDSGID=true
RestrictRealtime=true
RestrictNamespaces=true
LockPersonality=true
SystemCallArchitectures=native
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
CapabilityBoundingSet=
AmbientCapabilities=
UMask=0027
# puis :
sudo systemctl daemon-reload && sudo systemctl restart toutou-web
systemd-analyze security toutou-web | tail -1
curl -sI https://www.toutou-gourmet.com/ | head -1
```

Ne pas mettre `MemoryDenyWriteExecute=true` : V8 (le moteur JavaScript de Node) a besoin de mémoire à la fois inscriptible et exécutable. Vérifier aussi que le cache d'images de Next (`.next/cache`) reste inscriptible : la mise en ligne crée une nouvelle release, il faut donc vérifier où pointe `current`.

### B6. Mises à jour

`unattended-upgrades` est actif (`Update-Package-Lists 1`, `Unattended-Upgrade 1`). Aucune mise à jour de sécurité en attente, aucun redémarrage requis. Rien à faire.

Caddy 2.6.2 vient du paquet Ubuntu et date de 2022. Passer au dépôt officiel de Caddy (2.10 ou plus récent) pour les correctifs :

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
caddy version && sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

### B7. Caddy et tableau de bord

Constats : HSTS, nosniff et Referrer-Policy sont envoyés et `Server` est retiré. La préversion `toutou.85-190-127-13.sslip.io` est protégée par Basic (bcrypt, coût 14) avec `noindex`. `dashboard.toutou-gourmet.com` répond 401 sans identifiants, avec `X-Robots-Tag: noindex`. En revanche, il sert aussi tout le site public, et son `robots.txt` autorise tout. `www` sert `/tableau-de-bord` (401 également).

Proposition : sur `www`, ne plus servir `/tableau-de-bord` ; sur `dashboard.`, ne servir que le tableau de bord et ses ressources, avec un robots.txt qui interdit tout.

```caddy
www.toutou-gourmet.com {
	# … configuration actuelle …
	@admin path /tableau-de-bord /tableau-de-bord/*
	respond @admin 404
}

dashboard.toutou-gourmet.com {
	# … configuration actuelle …
	handle /robots.txt {
		respond "User-agent: *
Disallow: /" 200
	}
	@allowed path /tableau-de-bord /tableau-de-bord/* /_next/* /icon.svg /fonts/*
	handle @allowed {
		reverse_proxy 127.0.0.1:3000
	}
	handle {
		redir /tableau-de-bord
	}
}
```

Puis `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`, et reporter la modification dans `deploy/Caddyfile`.

### B8. Sauvegardes

`/srv/toutou/backups` ne contient qu'un seul fichier, `toutou-2026-11-02.dump`, de **1,6 Ko** : c'est presque vide pour une base qui contient des comptes et des statistiques. Il faut vérifier que `pg_dump`, lancé en `toutou`, lit bien tous les schémas (`app`, `analytics`). Les fichiers sont en 664 et aucune copie ne part hors du serveur (`rclone` absent).

```bash
sudo -u toutou pg_restore -l /srv/toutou/backups/toutou-$(date +%F).dump | grep -c 'TABLE DATA'
sudo -u toutou bash -c 'umask 077; /srv/toutou/backup-db.sh'
sudo chmod 600 /srv/toutou/backups/*.dump
```

Prévoir ensuite une destination hors du serveur (`rclone` avec un remote `offsite`) : le script la gère déjà.

### B9. Nettoyage des IP déjà stockées (après la mise en ligne de `sec/audit`)

```bash
sudo -u postgres psql toutou -c "UPDATE app.session SET ip_address = NULL WHERE ip_address IS NOT NULL;"
sudo -u postgres psql toutou -c "TRUNCATE app.rate_limit;"
```

## Suite proposée

1. Valider puis fusionner `sec/audit` dans `v2`.
2. B1 (SSH) dès que possible.
3. Branche `chore/next-16.4` : Next 16.4.4 ou plus récent, plus sharp 0.35.5 via `overrides`, testés en préversion (build, scanner, images OG, optimiseur d'images). Cette branche fermera les 5 avis critiques et l'avis élevé restants.
4. B5, B7 et B8 ensuite, un par un, avec une vérification du site après chaque étape.
