# V2 Toutou Gourmet — plan par lots

Branche de travail : `v2` (créée depuis `claude/toutou-gourmet-setup-3mRbP`).
La V1 reste en production pendant toute la construction. Chaque push sur `v2` donne une preview Vercel.
Référence visuelle : prototype navigable https://claude.ai/artifact/JP6w3gr8vX4UGCQrZDkj8D

## Principes d'infra (previews Vercel, prod sur VPS one.com — voir deploy/README.md)

> Mise à jour 2026-11-01 : la base de prod sera le PostgreSQL du VPS (Neon abandonné). Kit de déploiement dans `deploy/`.

- Previews : Vercel, branche `v2`, jusqu'à la bascule.
- Prod : VPS one.com, Caddy + systemd + PostgreSQL local + cron (`deploy/`).
- Base : PostgreSQL du VPS. Accès via Drizzle uniquement.
- Auth : Better Auth, mots de passe hachés dans notre base. Aucun fournisseur d'auth tiers.
- Photos : stockage objet compatible S3 en UE (R2 ou Object Storage). Compression sharp côté serveur.
- Mails : Brevo SMTP.
- Tâches récurrentes : cron sur le VPS.
- Interdit : Vercel KV, Vercel Blob, Edge Config, Vercel Cron, Supabase ou tout service propre à un hébergeur.

## Lot 0 — Fondations

- [ ] Brancher la preview Vercel sur `v2`
- [ ] Mettre `CLAUDE.md` à jour pour la V2 (multilingue, Vercel puis VPS, règles de push)
- [ ] Tokens de design V2 dans `globals.css` (palette V1 épurée, emojis conservés)
- [ ] Structure multilingue : FR à la racine (URLs actuelles inchangées), EN sous `/en`. Choisir la lib (next-intl) et documenter dans DECISIONS.md
- [ ] Vérifier qu'aucune URL V1 indexée ne change (export sitemap V1 vs V2)

## Lot 1 — DA et gabarits qui portent le SEO

- [ ] Header, footer, navigation mobile façon app (barre d'onglets en bas sur mobile)
- [ ] Gabarit article : TL;DR, StatRow, tableau par gabarit avec races (composant `SizeTable`), « Que faire si… », FAQ + JSON-LD, liens d'entités
- [ ] Gabarit hub race (section « Que peut manger un [race] ? »)
- [ ] Home V2
- [ ] Images OG dynamiques façon miniature (next/og) : article, race, outil

## Lot 2 — Outils sans compte

- [ ] Calculateur de ration (RER × facteur d'activité × 0,9 si castré ; chiot 2,5 ou 3,0 avant 4 mois)
- [ ] Âge humain (formule UCSD 16·ln(âge)+31) + carte partageable
- [ ] « Il a mangé quoi ? » : niveau de risque + renvoi vers l'article et les centres antipoison
- [ ] Fiche de garde, version sans compte (générée, partageable par lien, non stockée)

## Lot 3 — Hubs et maillage

- [ ] 8 piliers + hub Outils
- [ ] Maillage par entités (aliment, race, problème de santé) automatique entre articles
- [ ] Pilote SEO : 10 pages enrichies, hub Chiot, 1 hub race, groupe témoin Search Console

## Lot 4 — Comptes

- [ ] Neon UE + Drizzle (schéma user, session, dog, weight_log)
- [ ] Better Auth (mail + mot de passe, vérification mail, mot de passe oublié via Brevo)
- [ ] Profil chien (race, âge, poids, activité, castration) qui personnalise articles et outils
- [ ] CTA création de compte aux points de friction (CRO)

## Lot 5 — Photos

- [ ] Upload → sharp (WebP, 1600 px max) → R2 UE
- [ ] Photos de garde temporaires (durée affichée à l'upload) + purge Vercel Cron
- [ ] Album croissance durable

## Lot 6 — IA (compte obligatoire, quotas)

- [ ] Scanner d'étiquette : l'IA lit l'étiquette, notre algorithme calcule le score ; cache par EAN
- [ ] Assistant : mention claire qu'il s'agit d'une IA (AI Act)
- [ ] Quotas : gratuit 5 analyses + 20 messages/mois ; Premium 50 analyses + 300 messages (30/jour)
- [ ] Pages croquettes indexables générées depuis les analyses en cache

## Lot 7 — Premium et monétisation

- [ ] Paiement (Premium 3,99 €/mois ou 29,99 €/an)
- [ ] Cartes d'offres partenaires contextuelles (affiliation)

## Lot 8 — International

- [ ] EN : pages piliers, outils, hubs race prioritaires
- [ ] hreflang, sitemap par langue

## Lot 9 — Bascule

- [ ] Recette complète sur la preview `v2`
- [ ] Merge `v2` → production, contrôle des redirections et de Search Console
- [x] VPS one.com prêt (Caddy 2.6.2, Node 22, PostgreSQL 18, ufw 22/80/443)
- [ ] `setup-server.sh`, deploy key, premier build sur le VPS
- [ ] Mettre Caddy à jour (dépôt officiel) avant la bascule
- [ ] Bascule DNS + secrets GitHub + `VPS_DEPLOY=true`
