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
toutou-alerts.timer ──► alertes ntfy toutes les 10 min · toutou-weekly.timer ──► résumé du lundi (non installés)
toutou-opff-import.timer ──► copie Open Pet Food Facts, dimanche 1 h 10 (non installé)
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

## Scanner (lot 6)

Tables `app.food_analysis`, `app.scan_history`, `app.scan_usage`, `app.scan_report` : migration `db/migrations/0001_scanner.sql`, appliquée par la même commande `npx drizzle-kit migrate` que ci-dessus.

| Variable | Valeur |
| --- | --- |
| `GEMINI_API_KEY` | clé de l'API Gemini (offre payante). Sans elle, l'analyse répond « indisponible ». |
| `GEMINI_SCANNER_MODEL` | facultatif, défaut `gemini-3.1-flash-lite`. |
| `SCANNER_PROVIDER` | facultatif, défaut `gemini` (seul fournisseur branché). |
| `SCANNER_FREE_MONTHLY` | facultatif, analyses par mois et par compte, défaut 5. |
| `SCANNER_TIMEOUT_MS` | facultatif, délai d'attente de la lecture, défaut 30000. |
| `SCANNER_RECENT_MIN` | facultatif, produits distincts avant d'afficher « Derniers scans », défaut 5. |

Scanner v2 (code-barres, Open Pet Food Facts, fiches de partage) : migration `db/migrations/0002_scanner_source.sql` (colonne `food_analysis.source`), même commande `npx drizzle-kit migrate`. Le serveur doit pouvoir joindre `world.openpetfoodfacts.org` en HTTPS (sortie). Le décodeur de code-barres `public/vendor/zxing/zxing_reader-3.1.6.wasm` est servi par le site : si `barcode-detector` change de version dans `package.json`, recopier le fichier depuis `node_modules/zxing-wasm/dist/reader/` et mettre à jour `ZXING_WASM_URL` (`lib/scanner/barcode-client.ts`). `/scanner` autorise la caméra (`Permissions-Policy: camera=(self)`, `next.config.ts`) : ne pas réécrire cet en-tête dans Caddy. Le jeton de session de scan est signé avec `BETTER_AUTH_SECRET`.

Relecture des fiches (tableau de bord, section « Fiches à relire ») : migration `db/migrations/0003_scan_report_handled.sql` (colonne `scan_report.handled_at`), même commande `npx drizzle-kit migrate`, à passer avant de servir ce code (sinon l'envoi d'un signalement échoue).

| Variable | Valeur |
| --- | --- |
| `OPFF_DISABLED` | facultatif, `1` coupe l'appel à Open Pet Food Facts (le code-barres inconnu passe directement aux photos). |
| `OPFF_TIMEOUT_MS` | facultatif, délai d'attente d'Open Pet Food Facts, défaut 4000. |
| `OPFF_API_URL` | facultatif, défaut `https://world.openpetfoodfacts.org/api/v2/product`. |

Relire une fiche (la rendre indexable et l'ajouter à `/croquettes/sitemap.xml`) : `UPDATE app.food_analysis SET reviewed = true WHERE slug = '…';`. Signalements : `SELECT * FROM app.scan_report ORDER BY created_at DESC;`.

Purge des comptes non confirmés (promise par la politique de confidentialité : 30 jours). Le script supprime aussi les jetons de vérification et les sessions expirés. Aucune minuterie n'est installée : lancer à la main, ou créer plus tard un timer systemd quotidien sur le modèle de `toutou-ingest.timer`.

```bash
cd /srv/toutou/current
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs --dry   # compte sans supprimer
sudo -u toutou env DATABASE_URL='postgresql:///toutou?host=/var/run/postgresql' node scripts/purge-unverified.mjs
```

Base de développement : `toutou_accounts_dev` (rôle `administrator`), jamais `toutou`.

## Copie Open Pet Food Facts (préparée, non installée)

Chaque dimanche à 1 h 10 (heure de Paris, hors de la plage 02:30-05:00 de la tâche de nuit, de la sauvegarde et de la purge), `scripts/opff-import.ts` télécharge l'export officiel `https://static.openpetfoodfacts.org/data/openpetfoodfacts-products.jsonl.gz` (19 Mo compressé, 165 Mo décompressé, mis à jour chaque nuit par Open Pet Food Facts), le lit ligne à ligne, garde les aliments pour chien dans `app.opff_product` et pré-note avec le barème les fiches complètes (`food_analysis`, `source = 'openpetfoodfacts'`, `scan_count = 0`). Seules les fiches dont le contenu a changé sont retraitées ; si l'export n'a pas changé depuis le dernier import réussi (`Last-Modified`), rien n'est relu. Le fichier téléchargé est supprimé à la fin. Mesuré en dev le 2026-11-03 : 16 s, 250 Mo de mémoire au plus.

Migration `db/migrations/0005_opff_import.sql` (tables `app.opff_product`, `app.opff_import_run`, et source `openfoodfacts` acceptée dans `food_analysis`) : même commande `npx drizzle-kit migrate`, à passer avant de servir ce code (sans elle, le scan par code-barres saute simplement la copie locale).

| Variable | Valeur |
| --- | --- |
| `OPFF_INDEX_POLICY` | facultatif, `off` par défaut : seules les fiches relues sont indexées. `complete` : les fiches Open Pet Food Facts non relues qui ont marque, nom, composition et 5 constituants sur 7 deviennent indexables et entrent dans le sitemap, le classement et les pages marque. |
| `OPFF_EXPORT_URL` | facultatif, adresse de l'export (défaut ci-dessus). |
| `OFF_DISABLED` | facultatif, `1` coupe le dernier recours Open Food Facts du scan par code-barres. |
| `OFF_API_URL` | facultatif, défaut `https://world.openfoodfacts.org/api/v2/product`. |

Ordre du scan par code-barres : fiche déjà notée (`food_analysis`) → copie locale → API Open Pet Food Facts → API Open Food Facts (seulement un aliment pour animaux). Le serveur doit pouvoir joindre `static.openpetfoodfacts.org` et `world.openfoodfacts.org` en HTTPS.

```bash
cd /srv/toutou/current
# Essai sans écriture sur 2 000 lignes, puis import complet à la main
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; nice -n 15 node_modules/.bin/tsx scripts/opff-import.ts --dry --limit=2000'
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; nice -n 15 node_modules/.bin/tsx scripts/opff-import.ts'
# Installation de la minuterie
systemd-analyze calendar "Sun *-*-* 01:10:00 Europe/Paris"   # Next elapse : dimanche 00:10 UTC en hiver
sudo cp deploy/toutou-opff-import.service deploy/toutou-opff-import.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now toutou-opff-import.timer
journalctl -u toutou-opff-import -n 60 --no-pager    # compteurs du dernier passage
```

Autres options : `--file=/chemin.jsonl.gz` (export déjà téléchargé, gardé), `--all` (retraite aussi les fiches inchangées), `--force` (relit un export inchangé). Suivi : tableau de bord, onglet Contenu, « Copie Open Pet Food Facts » ; alerte ntfy si le dernier passage a échoué, est bloqué depuis 2 heures, ou si aucun passage n'a réussi depuis 8 jours. Le service tourne durci comme les alertes, avec `Nice=10`, entrées-sorties en priorité basse et `MemoryMax=700M`.

Arrêt : `sudo systemctl disable --now toutou-opff-import.timer`. Les données restent en base ; `TRUNCATE app.opff_product` vide la copie (les fiches déjà créées restent).

## Lettre et e-mails de la newsletter

Code : `lib/emails/` (gabarits, fonctions pures), `lib/server/newsletter.ts` et `lib/server/brevo-newsletter.ts` (appels Brevo), aperçus dans le tableau de bord (`/tableau-de-bord/emails/bienvenue`, `/tableau-de-bord/emails/suite/j2`… et `/tableau-de-bord/emails/lettre`). Tests des gabarits : `npx tsx scripts/test-emails.ts`.

Variables à ajouter dans `/srv/toutou/shared/.env` :

| Variable | Valeur |
| --- | --- |
| `NEWSLETTER_SECRET` | clé des liens de désinscription signés : `openssl rand -base64 32`. Sans elle, aucun e-mail de la lettre ne part. La changer invalide les liens déjà envoyés (la page renvoie alors vers le formulaire de contact). |
| `NEWSLETTER_TEST_EMAIL` | adresse qui reçoit les tests (bouton « M'envoyer un test » du tableau de bord, test de la campagne mensuelle). Jamais dans le code. |
| `NEWSLETTER_STATE_FILE` | facultatif, défaut `/srv/toutou/shared/newsletter-state.json` : identifiants des campagnes créées, un par mois (le script ne recrée pas une campagne déjà notée). |
| `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` | déjà présentes. La liste de la lettre est `BREVO_LIST_ID` (5). |

E-mail de bienvenue : envoyé après une inscription réussie par `/api/contact`, après la réponse (jamais bloquant), une fois par adresse. La trace est l'attribut Brevo booléen `WELCOME_SENT`, posé avant l'envoi. Le site crée l'attribut s'il manque (idempotent) au premier envoi ; pour le créer à la main :

```bash
curl -s -X POST https://api.brevo.com/v3/contacts/attributes/normal/WELCOME_SENT \
  -H "api-key: $BREVO_API_KEY" -H 'content-type: application/json' -d '{"type":"boolean"}'
```

Pas d'e-mail de bienvenue si `BREVO_DOI_TEMPLATE_ID` est posé (double opt-in : Brevo envoie déjà sa confirmation, l'adresse n'est pas encore confirmée), ni sans `BREVO_SENDER_EMAIL` ou `NEWSLETTER_SECRET`.

Désinscription : lien signé `/newsletter/desinscription?e=…&t=…` (HMAC-SHA256, `NEWSLETTER_SECRET`) dans les e-mails transactionnels, plus l'en-tête `List-Unsubscribe`. La page demande un clic sur « Me désinscrire » (les antivirus de messagerie ouvrent les liens) puis retire l'adresse de la liste 5. La lettre mensuelle, envoyée en campagne Brevo, utilise la balise `{{ unsubscribe }}` de Brevo.

### Lettre mensuelle (préparée, non activée)

`scripts/newsletter-monthly.ts` tourne chaque jour à 9 h et n'agit que la veille du premier mardi du mois : il crée la campagne Brevo (liste 5, programmée le lendemain à 18 h, heure de Paris), envoie un test à `NEWSLETTER_TEST_EMAIL` et note l'identifiant dans `NEWSLETTER_STATE_FILE`. Pour annuler un envoi programmé : tableau de bord, `/tableau-de-bord/emails/lettre`, bouton « Annuler l'envoi » (la campagne est suspendue dans Brevo).

Essai sans rien envoyer (aucun appel à Brevo, HTML écrit dans `/tmp/newsletter-AAAA-MM.html`) :

```bash
cd /srv/toutou/current
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; node_modules/.bin/tsx scripts/newsletter-monthly.ts --dry --force'
```

Installation, le jour où le propriétaire valide l'envoi à la liste. Les fichiers visent `/srv/toutou/current` et l'utilisateur `toutou` : tant que le site tourne depuis la préversion, adapter `User=` et `WorkingDirectory=` comme dans `toutou-ingest.service`.

```bash
sudo cp deploy/toutou-newsletter.service deploy/toutou-newsletter.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now toutou-newsletter.timer
systemctl list-timers toutou-newsletter.timer       # prochain passage
journalctl -u toutou-newsletter -n 50 --no-pager    # ce qu'il a fait
```

Arrêt : `sudo systemctl disable --now toutou-newsletter.timer`.

### Suite de bienvenue (préparée, non activée)

Trois e-mails après celui du jour 0 : J2 « Calcule la ration de ton chien », J7 l'offre partenaire du mois (code interne `j5`, gardé pour les lignes déjà écrites, les liens et les étiquettes ; même carte et même rotation que la lettre mensuelle, remise de `data/partner-discounts.ts`, lien vers `/codes-promo/{marque}`), J10 le scanner. Gabarits : `lib/emails/welcome-sequence.ts` ; logique : `lib/server/welcome-sequence.ts` ; aperçus et tests : `/tableau-de-bord/emails/suite/j2`, `/j5`, `/j10`.

**Rappels de compte (activés le 2026-11-04, textes validés)** : `compte-j4` (inscrit sans compte, sauté s'il en a un), `chien-j1` et `chien-j4` (compte confirmé sans chien, sautés dès qu'un chien est ajouté, puis plus rien). Gabarits : `lib/emails/account-reminders.ts` ; aperçus : `/tableau-de-bord/emails/relances/compte-j4`, `/chien-j1`, `/chien-j4`. Rien ne part sans `ACCOUNT_REMINDERS_ENABLED=1`, en plus des deux variables ci-dessous ; la mention de `/compte/inscription` change alors toute seule.

Un compte hors liste ne reçoit pas J2, J7 ni J10 : l'inscription au compte n'a pas de case pour la lettre, il ne reçoit que les rappels de son compte. Un inscrit à la liste qui ouvre ensuite un compte garde la suite (décision du propriétaire, 2026-11-04). Un compte dont l'adresse n'est pas confirmée ne reçoit aucun rappel : il ne peut pas se connecter (`requireEmailVerification`).

`scripts/welcome-sequence.ts` tourne chaque jour à 10 h 17 (heure de Paris). Il lit les contacts de la liste `BREVO_LIST_ID` et leur date de création dans Brevo (jour d'inscription, à Paris), puis envoie à chacun l'étape due :

- seulement aux contacts inscrits le jour `WELCOME_SEQUENCE_START` ou après (les abonnés plus anciens ne reçoivent rien, une réinscription garde la date du premier contact) ;
- une fois par étape et par adresse : trace dans `analytics.welcome_sends` (empreinte HMAC de l'adresse avec `NEWSLETTER_SECRET`, jamais l'adresse), posée avant l'envoi, retirée si Brevo refuse ;
- une étape manquée peut partir jusqu'à 3 jours en retard ; jamais une étape plus ancienne qu'une étape déjà envoyée ; un seul e-mail par adresse et par jour, y compris après un guide, une bienvenue ou un résultat d'outil déjà partis ce jour-là (reporté au lendemain) ; rien le premier mardi du mois, jour de la lettre (la suite reprend le lendemain). Un J0 demandé après 10 h 17 peut encore tomber le même jour qu'une étape : il répond à une demande, il n'est pas retenu ;
- adresse désinscrite exclue : liste Brevo (liste noire ou `listUnsubscribed`), `analytics.email_optouts` (notre lien, y compris pour un compte hors liste), et lecture du contact Brevo juste avant chaque rappel `chien-*` ;
- au plus 300 envois par jour ; contacts en liste noire Brevo ignorés ; journal sans adresse (repère `#empreinte`).

### Journal du scanner

`app/api/scanner/route.ts` et `app/api/scanner/code/route.ts` écrivent une ligne par scan dans `analytics.scanner_events` (date, type, résultat en liste fermée, compte et fiche quand il y en a), en arrière-plan : table absente ou base lente, la réponse ne change pas et le journal du service garde seulement `[scanner-events] écriture impossible, code …`. Écran : `/tableau-de-bord/scanner`. Purge à 90 jours par `toutou-purge`. Rien n'est écrit pour une photo envoyée sans compte, ni pour un code invalide ou un dépassement de débit sur la route ouverte `code` : un robot ne peut pas remplir la table.

```bash
sudo -u postgres psql -d toutou -f db/analytics.sql
```

### Journal des envois

Chaque e-mail individuel passant par `lib/server/mailer.ts` (guide, bienvenue, suite, rappels, résultat d'outil, compte, tests, résumé hebdomadaire) écrit une ligne dans `analytics.email_log` : empreinte HMAC, type, sujet, état (`sent`, `failed`, `simulated` avec `MAIL_LOG_ONLY`), date. L'écriture part en arrière-plan : table absente ou base lente ne bloquent aucun envoi, l'erreur va au journal avec son code seul. Vue : Conversions, « Voir les adresses inscrites », onglet Envois (recherche et export CSV). La lettre mensuelle part en campagne Brevo : pas de ligne par adresse. Conservation : `toutou-purge` retire `email_log`, `guide_sends` et `welcome_sends` après 24 mois ; `email_optouts` reste.

Pas de double envoi avec le jour 0 : l'inscription par le guide reçoit l'e-mail du guide **à la place** de la bienvenue (`app/api/contact/route.ts` s'arrête après le guide), la suite commence au jour 2 et ses traces sont à part (`welcome_sends`, pas `guide_sends` ni `WELCOME_SENT`). Un lecteur qui se désinscrit sort de la liste 5 : le script ne le voit plus.

Avant d'installer : appliquer la table (idempotent) :

```bash
sudo -u postgres psql -d toutou -f db/analytics.sql
```

Variables à poser dans `/srv/toutou/shared/.env` (le propriétaire, le jour où il active) :

| Variable | Valeur |
| --- | --- |
| `WELCOME_EMAIL_ENABLED` | `1` : active la bienvenue du jour 0 (déjà en place) et la suite. Sans elle, le script ne fait rien. |
| `WELCOME_SEQUENCE_START` | date de départ `AAAA-MM-JJ`, en pratique le jour de l'activation (ex. `2026-11-10`). Vide ou absente : rien n'est envoyé. |
| `NEWSLETTER_SECRET`, `BREVO_API_KEY`, `BREVO_LIST_ID`, `BREVO_SENDER_EMAIL` | déjà présentes. |

Essai sans rien envoyer ni écrire (plan par étape, aperçus HTML dans `/tmp/welcome-j2.html`, etc.) :

```bash
cd /srv/toutou/current
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; WELCOME_SEQUENCE_START=2026-11-01 node_modules/.bin/tsx scripts/welcome-sequence.ts --dry'
# contacts fictifs au lieu de la liste Brevo : ajouter BREVO_DRY_RUN=1 ; simuler un autre jour : --today=2026-11-20
```

Installation :

```bash
sudo cp deploy/toutou-welcome.service deploy/toutou-welcome.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now toutou-welcome.timer
systemctl list-timers toutou-welcome.timer        # prochain passage
journalctl -u toutou-welcome -n 50 --no-pager     # ce qu'il a fait
```

Arrêt : `sudo systemctl disable --now toutou-welcome.timer` (ou retirer `WELCOME_SEQUENCE_START`).

## Le guide de la gamelle (PDF offert contre l'inscription)

Page publique : `/guide-alimentation`. Fichier servi en direct : `public/guides/guide-de-la-gamelle.pdf`, avec trois aperçus `public/guides/apercu-*.webp` (vraies pages du PDF, affichées sur la page du guide). Les quatre fichiers sont dans git : un déploiement ne les reconstruit pas.

Le contenu vient du site : verdicts et notes du frontmatter des articles (`verdict`, `verdictNote`, classement par famille dans `data/guide-foods.ts`), ration de `lib/calculators.ts`, numéros de `data/poison-centers.ts`, recettes reprises dans `data/guide-recipes.ts`. Le livre est la route privée `/guide-alimentation/livre` (noindex, hors sitemap), imprimée en A4 par `scripts/build-guide.mjs`.

Régénérer le PDF après une modification de contenu (article, recette, numéro) : construire le site, le lancer, puis une commande.

```bash
nice npm run build
npx next start -p 3098 &                            # un port libre
GUIDE_BASE_URL=http://127.0.0.1:3098 npm run guide:pdf
# option : --shots /tmp/guide pour une capture PNG de chaque page
git add public/guides && git commit -m "chore(guide): rebuild PDF"
```

Le script refuse d'écrire le PDF si une page déborde, si une page est presque vide, si un numéro de page est faux ou si le PDF n'a pas autant de pages que le plan (`--force` pour passer outre). Il signale un nouvel article à verdict non classé dans `data/guide-foods.ts` (« aliment non classé »). Poids actuel : environ 1,5 Mo pour 18 pages (images recompressées en JPEG, polices du site embarquées). Playwright n'est pas une dépendance du site : le script le cherche dans le projet, puis dans `PLAYWRIGHT_DIR`, puis dans `~/tools/pw`.

Inscription : formulaire → `/api/contact` avec `source: "guide"` (adresses jetables refusées comme ailleurs). Après succès, l'e-mail du guide (`lib/emails/guide.ts`, lien direct vers le PDF) part aussitôt, même si `WELCOME_EMAIL_ENABLED` est coupé et même en double opt-in, à la place de l'e-mail de bienvenue. Une seule fois par adresse : empreinte HMAC dans la table `analytics.guide_sends` (ajoutée à `db/analytics.sql`, à appliquer avant de servir ce code : `sudo -u postgres psql -d toutou -f db/analytics.sql`, idempotent). Limite : 3 e-mails du guide par adresse réseau et par jour, 60 par heure et 300 par jour pour tout le site.

Tests sans toucher à la vraie liste : `BREVO_DRY_RUN=1` (inscription journalisée, aucun appel à Brevo) et `MAIL_LOG_ONLY=1` (e-mail écrit dans le journal). Ne jamais poser `BREVO_DRY_RUN` en production.

Mesure : événements `Guide Signup` (propriété `place` : `page-guide`, `article-aliment`, `article-recette`, `fiche-frigo`) et `Guide Download` (bouton « Télécharger le PDF » du site ; le lien de l'e-mail n'est pas compté). Tableau de bord, section Lecteurs : « Inscriptions newsletter par source » (lignes `guide · …`) et « Le guide de la gamelle ».

## Alertes et résumé hebdomadaire (préparés, non installés)

Deux minuteries, sous l'utilisateur `toutou`, depuis `/srv/toutou/current` :

| Unité | Rythme | Script |
| --- | --- | --- |
| `toutou-alerts.timer` | toutes les 10 minutes | `scripts/alerts.ts` : notification ntfy sur le téléphone |
| `toutou-weekly.timer` | lundi 8 h 40, heure de Paris | `scripts/weekly-digest.ts` : e-mail de la semaine à `OWNER_EMAIL` |

Variables (déjà dans `/srv/toutou/shared/.env`) : `NTFY_SERVER` (https://ntfy.sh), `NTFY_TOPIC` (canal privé : c'est un secret, il ne doit apparaître ni dans git ni dans un journal), `OWNER_EMAIL`, plus `DATABASE_URL`, `BREVO_API_KEY` et `BREVO_SENDER_EMAIL` déjà présentes. Facultatif : `ALERTS_STATE_FILE` (défaut `/srv/toutou/shared/alerts-state.json`).

### Contrôles des alertes

- Le site ne répond pas 200 sur `http://127.0.0.1:3000/` en 10 s, deux essais à 30 s d'écart (priorité haute).
- Le site tourne mais `https://www.toutou-gourmet.com/` ne répond pas 200 : Caddy, DNS ou certificat (priorité haute).
- Une unité `toutou-*` en échec (`systemctl show`, sans sudo).
- Tâche de nuit : à partir de 7 h (heure de Paris), le compte rendu du jour dans `/var/lib/toutou-seo-logs` manque, s'arrête avant la fin, ou contient « ✗ » ou « a terminé avec une erreur ». Avant 7 h, c'est la nuit précédente qui compte.
- Disque libre sous 10 %, mémoire disponible sous 10 %, charge sur 15 minutes au-dessus de 150 % des cœurs.
- Sauvegarde absente ou plus vieille que 36 heures (`/srv/toutou/backups`).
- Nouveau signalement d'erreur non traité sur une fiche croquette (`app.scan_report`) depuis le passage précédent.
- Import Open Pet Food Facts en échec, bloqué depuis 2 heures, ou sans passage réussi depuis 8 jours (une fois la migration 0005 appliquée).

Une notification par incident, puis une autre quand il est réglé ; plusieurs changements dans le même passage partent dans un seul message. L'état tient dans `ALERTS_STATE_FILE`. Les messages ne contiennent aucune donnée personnelle et ouvrent le tableau de bord au toucher. Si ntfy refuse l'envoi, l'état n'est pas mis à jour : le passage suivant renvoie le même message.

### Essais

```bash
cd /srv/toutou/current
# Ce que ferait un passage, sans rien envoyer (état dans /tmp)
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; node_modules/.bin/tsx scripts/alerts.ts --dry'
# Une notification de test sur le téléphone
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; node_modules/.bin/tsx scripts/alerts.ts --test'
# Résumé de la semaine passée, HTML dans /tmp/weekly-digest-AAAA-MM-JJ.html, sans envoi
sudo -u toutou bash -c 'set -a; . /srv/toutou/shared/.env; set +a; node_modules/.bin/tsx scripts/weekly-digest.ts --dry'
```

`alerts.ts --now=2026-11-02T07:05:00+01:00` simule l'heure, `weekly-digest.ts --week=2026-10-26` choisit la semaine (un lundi). Aperçu du résumé et bouton de test : tableau de bord, `/tableau-de-bord/emails/hebdo`.

### Installation

Vérifier d'abord que systemd accepte le fuseau dans `OnCalendar` (systemd 259 sur le serveur : oui) :

```bash
systemd-analyze calendar "Mon *-*-* 08:40:00 Europe/Paris"   # Next elapse : lundi 07:40 UTC en hiver
sudo cp deploy/toutou-alerts.service deploy/toutou-alerts.timer deploy/toutou-weekly.service deploy/toutou-weekly.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now toutou-alerts.timer toutou-weekly.timer
systemctl list-timers 'toutou-*'                  # prochains passages
journalctl -u toutou-alerts -n 50 --no-pager      # ce qu'a vu le dernier passage
```

Les deux services tournent durcis (`NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`) ; seul `/srv/toutou/shared` est accessible en écriture, pour le fichier d'état. Tant que le site tourne depuis la préversion, adapter `User=` et `WorkingDirectory=` comme dans `toutou-ingest.service`.

Arrêt : `sudo systemctl disable --now toutou-alerts.timer toutou-weekly.timer`.
