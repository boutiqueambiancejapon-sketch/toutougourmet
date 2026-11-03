# V2 Toutou Gourmet — plan par lots

Point au 2026-11-03 : voir la section « Reste à faire » en bas. Les cases cochées ce jour l'ont été après vérification sur le site en ligne (ou sur `release/scanner-garde` pour le scanner et la fiche de garde).

Branche de travail : `v2` (créée depuis `claude/toutou-gourmet-setup-3mRbP`).
La V1 reste en production pendant toute la construction. Préversion sur le VPS : https://toutou.85-190-127-13.sslip.io (`deploy/preview.sh`).
Référence visuelle : prototype navigable https://claude.ai/artifact/JP6w3gr8vX4UGCQrZDkj8D

## Principes d'infra (previews Vercel, prod sur VPS one.com — voir deploy/README.md)

> Mise à jour 2026-11-01 : la base de prod sera le PostgreSQL du VPS (Neon abandonné). Kit de déploiement dans `deploy/`.

- Mode de travail : le serveur est la source (Claude Code sur le VPS, Remote Control depuis l'iPhone), GitHub garde une copie. Voir DECISIONS.md.
- Previews : adresse de préversion publique sur le VPS (protégée, `noindex`) ; Vercel continue de construire les branches poussées sur GitHub, en option.
- Prod : VPS one.com, Caddy + systemd + PostgreSQL local + cron (`deploy/`).
- Base : PostgreSQL du VPS. Accès via Drizzle uniquement.
- Auth : Better Auth, mots de passe hachés dans notre base. Aucun fournisseur d'auth tiers.
- Photos : stockage objet compatible S3 en UE (R2 ou Object Storage). Compression sharp côté serveur.
- Mails : Brevo SMTP.
- Tâches récurrentes : cron sur le VPS.
- Interdit : Vercel KV, Vercel Blob, Edge Config, Vercel Cron, Supabase ou tout service propre à un hébergeur.

## Lot 0 — Fondations

- [x] Brancher la preview Vercel sur `v2` (automatique, URL stable : toutougourmet-git-v2-boutiqueambiancejapon-sketchs-projects.vercel.app)
- [x] Mettre `CLAUDE.md` à jour pour la V2 (multilingue, Vercel puis VPS, règles de push)
- [x] Tokens de design V2 dans `globals.css` (palette V1 épurée, emojis conservés) — 2026-11-01, voir `docs/01-branding.md`
- [x] Structure multilingue : FR à la racine (URLs actuelles inchangées), EN sous `/en` — 2026-11-01 : groupes de routes `app/(fr)` et `app/(en)`, sans next-intl ni proxy (raisons dans DECISIONS.md). `/en` en noindex jusqu'au lot 8
- [x] Vérifier qu'aucune URL V1 indexée ne change (export sitemap V1 vs V2)

## Lot 1 — SEO et gabarits (réordonné le 2026-11-01 : le maillage du lot 3 remonte ici)

Règles : aucune URL existante ne change (788 adresses) ; les pages race existantes sont enrichies sur place, pas de pages « [race] peut-il manger [X] » (guide SEO §6.4). Le design (header, footer, barre d'onglets mobile) se construit avec les gabarits, façon prototype.

- [ ] Miniatures de partage façon YouTube (next/og, 1200×630) : article, race, catégorie, outil, accueil.
  - [x] Articles (modèle A1, 2026-11-01) : `app/(fr)/chien/[category]/[slug]/opengraph-image.tsx` + `lib/og/`, JPEG ~65 Ko, champs frontmatter `ogTitle`, `verdict` (oui / moderation / danger), `verdictNote` ; pilotes : poires, chocolat
  - [ ] Remplir `ogTitle` / `verdict` / `verdictNote` sur les articles (consigne à ajouter à la tâche des 2 articles/jour) ; alt par article (`generateImageMetadata`) ; miniatures race, catégorie, outil, accueil Titre court en Fraunces, badge verdict (oui / attention / danger), ton de la catégorie, illustration du manifest, logo. 3 modèles sur `chien-peut-manger-poires`, choix du propriétaire, puis généralisation (corrige au passage l'OG cassé de l'accueil)
- [x] Gabarit article : TL;DR, StatRow, tableau par gabarit avec races (composant `SizeTable`), « Que faire si… », FAQ + JSON-LD, liens d'entités
  - [x] `SizeTable` / `SizeRow`, `WhatToDo` / `Step`, `PoisonCenters`, FAQ V2, TL;DR V2, JSON-LD FAQ nettoyé (2 157 questions, 356 articles) — 2026-11-01, pilote : `chien-peut-manger-poires`
  - [ ] StatRow V2, liens d'entités, en-tête d'article (catégorie, date, relecture) et sommaire façon prototype
  - [ ] Migrer les articles déjà réécrits (`CompareTable` → `SizeTable`) par lots
- [x] Gabarit race appliqué aux 58 pages `/chien/race/*` existantes (section « Que peut manger un [race] et que doit-il éviter ? ») + hub `/chien/race`
- [ ] Pages catégories `/chien/[category]` transformées en pages piliers (8 piliers) + hub Outils
- [x] Pages outils en V2 (2026-11-02) : gabarit commun `components/outils/ToolPage.tsx` (fil d'Ariane, H1, outil au-dessus de la ligne de flottaison, « Comment on calcule » sourcé, FAQ, autres outils en lignes) ; calculateurs au style `RationQuick` ; après chaque résultat « Garder ce résultat » (e-mail → `/api/contact`), suite logique, au plus un lien partenaire justifié ; ration et mini-outil d'accueil sur la même fonction `computeRation` ; hub `/outils` en liste de questions
- [ ] Maillage par entités (aliment, race, problème de santé) automatique entre articles
- [x] Header, footer, navigation mobile façon app (barre d'onglets en bas sur mobile)
- [x] Home V2
- [x] Technique : robots en double sur la 404 (`noindex` + `index, follow`), `robots.txt` à nettoyer, description de l'accueil (Petty Well remplacé par Ultra Premium Direct, « chien & chat »)
- [ ] À décider avec le propriétaire : doublon de catégories `alimentation` (8 articles) / `alimentation-quotidienne` (124) — fusion = redirections 301, risque SEO
- [ ] Pilote SEO : 10 pages enrichies, hub Chiot, 1 hub race, groupe témoin Search Console

## Lot 2 — Outils sans compte

- [x] Calculateur de ration (RER × facteur d'activité × 0,9 si castré ; chiot 2,5 ou 3,0 avant 4 mois)
- [x] Âge humain (formule UCSD 16·ln(âge)+31) + carte partageable
- [ ] « Il a mangé quoi ? » : niveau de risque + renvoi vers l'article et les centres antipoison
- [x] Fiche de garde, version sans compte (générée, partageable par lien, non stockée)

## Lot 3 — Hubs et maillage

- Remonté dans le lot 1 (2026-11-01).

## Lot 4 — Comptes

- [x] PostgreSQL du VPS + Drizzle (schéma user, session, dog, weight_log)
- [x] Better Auth (mail + mot de passe, vérification mail, mot de passe oublié via Brevo)
- [x] Profil chien (race, âge, poids, activité, castration) qui personnalise articles et outils
- [x] CTA création de compte aux points de friction (CRO)

Fondations (branche `feat/accounts`, non fusionnée tant que le lot n'est pas validé) :
1. Dépendances `drizzle-orm`, `drizzle-kit`, `better-auth` ; schéma Postgres `app` ; migrations `db/migrations/`
2. Better Auth : e-mail + mot de passe, vérification et mot de passe oublié par Brevo transactionnel, limite de tentatives en base
3. Pages `/compte/*` (noindex, hors sitemap) : inscription, connexion, mot de passe oublié, tableau de bord, chien (ajout, édition, pesées)
4. `/outils/ration` pré-rempli avec le premier chien du compte (sans toucher au pré-remplissage par URL)
5. Points d'entrée : lien compte dans l'en-tête V2, lien sous `KeepResult`
6. `deploy/README.md` : variables et migration
7. [x] RGPD : suppression du compte (mot de passe, cascade, e-mail de confirmation), export JSON, section « Ton compte » de la politique de confidentialité
8. [x] Purge des comptes non confirmés après 30 jours : `scripts/purge-unverified.mjs` (sans minuterie pour l'instant)
9. [x] Expéditeur `bonjour@toutou-gourmet.com`, pied d'e-mail vers le formulaire de contact
10. [ ] Avant la mise en ligne : variables dans `/srv/toutou/shared/.env`, migration sur `toutou`, test d'un vrai envoi Brevo, décider d'une minuterie pour la purge
11. [ ] Plus tard : changement de prénom et d'adresse e-mail depuis `/compte` (aujourd'hui par le formulaire de contact)

## Lot 5 — Photos

- [ ] Upload → sharp (WebP, 1600 px max) → stockage objet S3 en UE
- [ ] Photos de garde temporaires (durée affichée à l'upload) + purge par cron sur le VPS
- [ ] Album croissance durable

## Lot 6 — IA (compte obligatoire, quotas)

- [x] Scanner d'étiquette : l'IA lit l'étiquette, notre algorithme calcule le score ; cache par EAN (branche `feat/scanner`, 2026-11-02)
- [x] Scanner : outil de relecture des fiches (`reviewed`) et des signalements, relance des lectures douteuses sur un modèle plus fort
- [ ] Assistant : mention claire qu'il s'agit d'une IA (AI Act)
- [ ] Quotas : gratuit 5 analyses + 20 messages/mois ; Premium 10 analyses (décision 2026-11-02) + 300 messages (30/jour)
- [x] Pages croquettes indexables générées depuis les analyses en cache (pages et sitemap faits, indexées seulement une fois relues)

## Lot 7 — Premium et monétisation

- [ ] Paiement (Premium 3,99 €/mois ou 29,99 €/an)
- [x] Cartes d'offres partenaires contextuelles (affiliation)

## Lot 8 — International

- [ ] EN : pages piliers, outils, hubs race prioritaires
- [ ] hreflang, sitemap par langue

## Tableau de bord maison (feu vert 2026-11-02)

Objectif : `dashboard.toutou-gourmet.com`, nos chiffres à nous (actions des visiteurs, robots d'IA, Brevo, tâche de nuit), visites lues dans Plausible.

- [x] 1. Actions des visiteurs : schéma `analytics` dans la base `toutou`, route `POST /api/e` (sans cookie, sans IP stockée, no-op sans `DATABASE_URL`), `track()` envoie aussi à `/api/e`
- [x] 2. Journaux Caddy en JSON vers journald ; `scripts/ingest-caddy-logs.mjs` (timer 15 min) classe robots IA (entraînement, recherche, lecture en direct), moteurs, outils SEO, humains, visiteurs envoyés par une IA ; IP gardée pour les robots seulement (détection des faux robots) ; rétention 180 j
- [x] 3. Page tableau de bord protégée (sous-domaine, DNS à ajouter chez le registraire)
- [x] 4. Brevo, tâche de nuit, Plausible Stats API, alertes

## Lot 9 — Bascule

- [ ] Recette complète sur la preview `v2`
- [ ] Merge `v2` → production, contrôle des redirections et de Search Console
- [x] VPS one.com prêt (Caddy 2.6.2, Node 22, PostgreSQL 18, ufw 22/80/443)
- [x] `setup-server.sh`, deploy key, premier build sur le VPS (2026-11-01, branche v2, HTTP 200 en local)
- [x] Mettre Caddy à jour (dépôt officiel) avant la bascule
- [x] Mode « serveur source » : Claude Code + `claude remote-control` en service sur le VPS, dépôt de travail avec droit d'écriture sur GitHub, adresse de préversion (étapes : `PROGRESS.md`, passation)
- [x] Tâche des 2 articles par jour déplacée sur le serveur, puis tâche planifiée cloud désactivée le même jour
- [x] Bascule DNS

## Reste à faire (point du 2026-11-03)

- [x] Mettre en ligne `release/scanner-garde` (friandises, copie Open Pet Food Facts, fiche de garde, SEO scanner) : 3 tables à créer par le propriétaire (journal du 2026-11-03).
- [ ] « Il a mangé quoi ? » (lot 2) : outil niveau de risque + renvoi article et centres antipoison. Pas commencé.
- [ ] Miniatures de partage par type de page (lot 1) : article, race, outil existent ; catégorie et accueil à vérifier.
- [ ] Maillage par entités automatique (lot 1) : articles liés en place ; encarts outils ajoutés la nuit ; liens aliment ↔ race ↔ santé à automatiser.
- [ ] Doublon de catégories `alimentation` / `alimentation-quotidienne` : décision du propriétaire (redirections 301).
- [ ] Pilote SEO et groupe témoin Search Console (lot 1).
- [ ] Photos (lot 5) : album croissance, photos de garde. Pas commencé (« plus tard » selon le propriétaire).
- [ ] Assistant IA (lot 6) et relance des lectures douteuses du scanner sur un modèle plus fort. Pas commencé.
- [ ] Paiement Premium (lot 7) : en attente, pas de Stripe pour l'instant (Premium gratuit).
- [ ] Anglais (lot 8) : en attente (« pas d'anglais pour le moment »).
- [ ] Bascule, fin (lot 9) : fusionner `v2` dans la branche de prod GitHub (385 commits d'écart au 2026-11-03), repasser `DEPLOY_BRANCH`, fermer le projet Vercel (domaines à retirer par le propriétaire), racine `toutou-gourmet.com` vers le VPS.

## Fiche de garde (2026-11-03, `feat/fiche-garde`)

- [x] Page outil `/outils/fiche-de-garde`, formulaire sans compte, modèle vierge A4
- [x] Espace compte : fiches par chien, table `app.sitter_sheet`, export RGPD
- [x] Page du gardien `/garde/[jeton]` + PDF A4
- [x] Article `faire-garder-son-chien-vacances-alimentation`
- [ ] Fusion dans `v2`, migration en production (numéro à harmoniser avec `0005_opff_import`)
