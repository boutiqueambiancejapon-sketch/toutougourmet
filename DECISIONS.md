# Décisions — Toutou Gourmet

## Tranchées

- [x] Framework : Next.js 16.4.4 (depuis le 2026-11-02, avant 16.1.6) — jamais downgrader · mise à jour via PR dédiée uniquement
- [x] React : 19.2.3
- [x] Langage : TypeScript strict — jamais de `any`
- [x] Déploiement : Vercel · région auto · GitHub Actions CI (à configurer)
- [x] Styling : Tailwind v4 + variables CSS obligatoires — coexistence `@theme inline` + `:root`
- [x] Dark mode : non implémenté — V2 · next-themes prévu si décidé
- [x] Langue : français à la racine, anglais sous `/en` (V2, voir « V2 — structure multilingue »)
- [x] Budget JS : objectif 80kb First Load gzippé (à surveiller avec `next build`)
- [x] CSP : `unsafe-eval` activé dans script-src — voir exception ci-dessous
- [x] Analytics : tableau de bord maison (`analytics.*` dans PostgreSQL, `/tableau-de-bord`) + GA4 · Plausible et Vercel Analytics abandonnés (voir « V2 — sortie des services tiers hérités de Vercel »)
- [x] Sitemap : route handlers maison, un sitemap par type de page sous l'index `/sitemap.xml` (2026-11-03, remplace next-sitemap, voir « Sitemaps par type de page »)
- [x] MDX : @next/mdx + next-mdx-remote + gray-matter + rehype-pretty-code
- [x] Icons : lucide-react — SVG uniquement, pas d'icon font
- [x] Animations : framer-motion 12 — wrappers décoratifs uniquement
- [x] Forms : react-hook-form + zod
- [x] UI primitives : @radix-ui (accordion, dialog, slot)
- [x] Polices : Fraunces (titres, 700+900) + DM_Sans (corps, 400+500+600) — voir exception ci-dessous. Déclarées dans `lib/fonts.ts` ; `adjustFontFallback: true` y est écrit explicitement (c'est déjà la valeur par défaut de next/font/google : la « dette » notée n'en était pas une)
- [x] Google Indexing API : soumission automatique via `/api/indexing` (Vercel) + `scripts/submit-indexing.mjs` (Node zéro-dep) + `.github/workflows/indexing.yml` (trigger push sur `content/**.mdx`) — URLs canoniques construites depuis le frontmatter `categorySlug` pour éviter les mismatches · quota Google 200/jour respecté côté route
- [x] **Redesign V2 — direction visuelle (2026-04-24)** : style "photo réaliste + illustration peinte par-dessus" (refs Oatly, Liquid Death, Partake Foods). Base photo lifestyle cream + couche décorative hand-drawn (contour noir `#1A1109`, aplats pill colors). 6 éléments signatures figés : confetti géométrique, chapeau de fête, gamelle dessinée, os stylisé, étoile scintillante, empreinte de patte. Prompt système unique `docs/prompts/gemini-image-system.md`, évolution par PR dédiée avec regénération complète.
- [x] **Redesign V2 — génération images (2026-04-24)** : Gemini 2.5 Flash Image (Nano Banana) via `@google/generative-ai`, 25 slots définis dans `data/images-manifest.ts`, 3 variantes par slot lors du premier run (choix humain), export WebP 1600w + 800w via `sharp` (objectif < 200 Ko pour PSI). Tons alignés aux pill colors existantes du design system (rose `#FFD6E3`, bleu `#C8DCFF`, ambre `#FFE8B5`, vert `#C2F0D5`).
- [x] **Redesign V2 — marques partenaires (2026-04-24, màj 2026-05-25)** : les 4 cartes marques (Franklin, Elmut, Ultra Premium Direct, Dog Chef) n'imitent **pas** les packshots réels. Chaque image évoque la catégorie (croquettes mono-protéine / repas frais cuisinés / croquettes vente directe / repas frais sur-mesure) via une scène moodboard neutre, sans logo ni packaging reconnaissable. Décision pour éviter tout risque légal/ayants droit. Les vrais visuels marques pourront arriver en V2+ sur les fiches produits via accord affilié formel. **Note màj 2026-05-25** : Petty Well a été remplacé par Ultra Premium Direct (nouveau partenariat affilié, cf. commit a6eb6cf).
- [x] **Redesign V2 — tone par catégorie de contenu (2026-04-24)** : Nutrition → ambre, Santé → vert, Alimentation → rose, Comportement → bleu, Enquêtes → ambre + accent orange, Urgences → rose + sparkle orange, Avis marques → bleu, Par race → ambre. Le ton guide Gemini à la génération **et** le composant `<IllustratedImage>` (overlay runtime) au rendu.

- [x] **SEO V2 — une page par question, fan-out IA (2026-10-28)** : pas de migration d'URL, les articles existants sont enrichis sur place. Chaque page couvre les sous-questions du fan-out (chien, aliment, quantité, situation, pourquoi, alternatives) avec un tableau par gabarit qui nomme des races. Pas de pages « [race] peut-il manger [X] » en masse (risque scaled content abuse + cannibalisation) : page dédiée seulement si facteur de race documenté et demande mesurée. Réécriture de 2 articles existants par jour via tâche planifiée, file `docs/seo-rewrite-queue.md`.

- [x] **V2 — infra (2026-11-01)** : V2 construite sur la branche `v2`, hébergée sur Vercel (plan Pro) avec Neon Postgres UE, Better Auth, Cloudflare R2 UE, Brevo, Vercel Cron. Aucun service propre à Vercel (KV, Blob, Edge Config) pour pouvoir migrer plus tard vers VPS OVH + Coolify en changeant seulement les variables d'environnement. Le VPS est reporté. Plan détaillé : `tasks/todo.md`.

- [x] **V2 — mode de travail (2026-11-01, remplace le déploiement par GitHub Action)** : même infra que le boulot. Le serveur de Toutou est la source du code : Claude Code tourne sur le VPS, piloté depuis l'iPhone par Remote Control (`claude remote-control` lancé comme service dans le dossier de travail) ou depuis VS Code en SSH. On construit et on relance sur place, GitHub garde une copie (push depuis le serveur). La tâche des 2 articles par jour passe sur le serveur (minuterie systemd), comme les sites EMD. Raison : travailler depuis l'iPhone avec un Claude qui agit directement sur le serveur, sans pont GitHub → VPS. Conséquences : la GitHub Action `deploy-vps.yml` est retirée ; une fois le dépôt de travail en place sur le serveur, plus aucune session cloud (ni la tâche planifiée cloud) ne pousse sur ce dépôt, sinon les deux sources divergent.

- [x] **V2 — structure multilingue (2026-11-01)** : sans bibliothèque i18n ni proxy (middleware). Les routes françaises sont dans le groupe `app/(fr)`, qui n'apparaît pas dans l'URL : aucune adresse V1 ne change (contrôle sur 788 adresses, voir PROGRESS). L'anglais vit dans `app/(en)/en`. Le layout racine `app/layout.tsx` est neutre (pas de `<html>`) et garde les métadonnées par défaut de la V1 ; chaque langue a son layout qui rend `<html lang>` via `components/layout/SiteDocument.tsx`. Textes d'interface partagés dans `lib/i18n/dictionaries.ts` (typé, chaque langue fournit toutes les clés) ; le texte propre à une page reste dans la page. Pourquoi pas next-intl : avec le français sans préfixe, il faut un proxy sur chaque requête et déplacer toutes les routes sous `[locale]`, avec un risque de rendu dynamique sur les 356 articles ; les groupes de routes gardent le rendu statique et permettent des slugs anglais (`/en/dog/...`) sans table de correspondance. next-intl reste possible au lot 8 si les messages ICU (pluriels) deviennent utiles. Changer de langue recharge la page (lien `<a>` : deux layouts `<html>` distincts). `/en` est en `noindex` et hors sitemap jusqu'au lot 8 ; une adresse `/en/*` inconnue affiche la 404 française globale (une 404 dynamique sous `/en` sortait sans HTML côté serveur avec Next 16.1.6). Coût connu : la 404 globale (`app/not-found.tsx`, document complet avec en-tête et pied de page) est sérialisée dans la charge RSC de chaque page, environ 4 Ko non compressés de plus qu'en V1 (moins de 1 Ko après compression, le pied de page se répète déjà dans la page).

- [x] **V2 — tokens de design (2026-11-01)** : palette V1 épurée du prototype dans `app/globals.css` : crème, encre, orange (fonds de bouton, texte encre dessus) et `--orange-ink` pour le texte orange sur fond clair, quatre tons pastille / fond / texte (ambre, rose, bleu, vert), `--scrim`, rayons `--r-*`, largeurs `--w-page` / `--w-prose`, pas d'ombres. Utilitaires Tailwind mappés dans `@theme inline` (`bg-cream`, `text-ink`, `rounded-card`, `max-w-page`…). Les variables V1 deviennent des alias des tokens V2 quand la valeur est identique ; celles sans équivalent V2 sont marquées « V1 seule ». Les composants V2 portent la classe `v2` : les règles V1 globales (titres, prose MDX) les ignorent grâce à `:where(:not(.v2, .v2 *))`, sans changer la spécificité côté V1.

- [x] **V2 — pas de double travail (2026-11-01)** : aucune modification du site en ligne (branche de prod, Vercel) avant la bascule. Les corrections (marques affiliées, Petty Well retiré, Dogfy et Fidelis ajoutés) se font uniquement sur `v2` ; le nom de domaine passe sur la V2 une fois terminée. La tâche des 2 articles/jour doit écrire dans la V2 (minuterie sur le serveur, passation étape 4).

- [x] **V2 — hébergement cible (2026-11-01, remplace la décision « Vercel + Neon » du même jour pour la prod)** : VPS one.com Cloud Server M (4 vCPU, 8 Go, Ubuntu 26.04). Structure calquée sur l'infra MentionBox : Caddy + systemd + PostgreSQL installé directement + cron. Pas de Coolify (installé puis retiré : l'utilisateur ne le voulait pas). Déploiement par GitHub Action SSH → `deploy/deploy.sh` (build dans `releases/<sha>`, bascule de lien, retour arrière `rollback.sh`). Vercel garde les previews de la branche `v2` jusqu'à la bascule. Neon abandonné : la base sera le Postgres du VPS. Mise à jour du même jour : le déploiement par GitHub Action est abandonné au profit du mode de travail « serveur source » (voir « V2 — mode de travail »).

- [x] **V2 — sortie des services tiers hérités de Vercel (2026-11-02)** : Plausible, Formspree et l'API d'indexation Google sont abandonnés (réinstallables plus tard). Les messages du formulaire de contact vont dans `analytics.contact_messages` (route `/api/contact`, validation serveur, limite de débit en mémoire, champ piège) et se lisent dans la section « Messages » du tableau de bord ; sans base, la route répond 503. Les inscriptions (e-mail seul) vont dans Brevo (`lib/server/brevo.ts`), 503 si Brevo n'est pas configuré. Le compteur « bilans réalisés » du sticky CTA lit `analytics.events` (`Tool Result`, `tool = bien-nourri`) via `/api/bien-nourri-count`, sans cache. Le script Plausible, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `PLAUSIBLE_API_KEY` et `FORMSPREE_ID` disparaissent ; `plausible.io` sort de la CSP. Les routes `/api/indexing` et `/api/search-console` restent mais répondent 501 sans leurs variables. Raison : un seul serveur, une seule base, aucun compte tiers à garder pour quitter Vercel.

- [x] **V2 lot 4 — comptes (2026-11-02, branche `feat/accounts`)** : Better Auth 1.7 + Drizzle 0.45 sur le Postgres du VPS (driver `pg` existant), schéma `app` à part de `analytics`, migrations drizzle-kit dans `db/migrations/` (table de suivi `app.__drizzle_migrations`). E-mail + mot de passe uniquement, haché (scrypt) dans `app.account` ; adresse à confirmer avant la première connexion ; e-mails de vérification et de mot de passe oublié via l'API transactionnelle Brevo. Limite de tentatives stockée en base (5 connexions/min, 3 inscriptions/min, 3 demandes de mot de passe/5 min par IP). Pour garder les pages publiques statiques, l'en-tête et `/outils/ration` ne lisent pas la session : un témoin `tg_compte=1` (cookie lisible, sans secret) posé à la connexion et retiré à la déconnexion indique qu'un compte est ouvert ; `/outils/ration` n'appelle `/api/compte/ration` que si ce témoin est présent et que l'URL ne porte aucun paramètre (le pré-remplissage par URL garde la priorité). L'âge du chien est stocké comme date de naissance (estimée quand le maître donne un âge, colonne `birth_date_estimated`), la race comme slug de `data/breeds.ts`, l'activité avec les valeurs de `lib/calculators.ts`.

- [x] **V2 lot 4 — RGPD des comptes (2026-11-02)** : suppression confirmée par le mot de passe (plus sûr que retaper l'e-mail, affiché sur la page), immédiate et sans période de grâce ; limite de 5 essais par compte et par 5 minutes en mémoire (la limite de Better Auth ne couvre pas les appels `auth.api` des actions serveur). Export en GET authentifié, JSON avec les sessions (IP, navigateur) puisqu'elles sont des données personnelles. Comptes non confirmés supprimés après 30 jours par `scripts/purge-unverified.mjs`, sans minuterie tant que le propriétaire n'en a pas décidé. Pas de boîte de réception sur le domaine : expéditeur `bonjour@toutou-gourmet.com`, demandes RGPD et corrections de prénom ou d'adresse par le formulaire de contact (la mention `contact@toutou-gourmet.com` de la politique de confidentialité est remplacée).

## À valider

- [ ] DM_Sans : 3 weights chargés (400, 500, 600) — CDC impose max 2 — supprimer 500 ou 600 ?
- [ ] CI/CD : créer .github/workflows/ci.yml ?
- [ ] Scripts package.json : ajouter type-check, test, audit ?
- [ ] vercel.json : créer avec région et config silent ?
- [ ] .env.example : créer ?
- [ ] Vitest : installer infrastructure de test ?

## Abandonnées

- next-themes → non installé, dark mode reporté en V2
- next-intl → non retenu pour la V2 : groupes de routes `(fr)` / `(en)` à la place (voir « V2 — structure multilingue »)
- `app/[locale]/` → non utilisé : le français reste à la racine sans préfixe
- **Petty Well** → partenariat retiré le 2026-05-25 au profit d'Ultra Premium Direct (commits a6eb6cf + b4de2fc). Slug `/chien/marque/petty-well` redirigé en 308 vers `/chien/marque/ultra-premium-direct` via `next.config.ts`.

## Exceptions documentées

- **2025 → 2026-11-02 — CSP unsafe-eval** : retiré par l'audit de sécurité (branche `sec/audit`), remplacé par `'wasm-unsafe-eval'` pour le lecteur zxing du scanner. Testé sans violation (GA4, scanner, compte, outils). AdSense est abandonné, donc la raison « scripts publicitaires » ne tient plus.
- **2026-11 — couleurs en dur dans les e-mails de compte** (`lib/server/auth-emails.ts`) : les messageries ignorent les variables CSS. Exception limitée au HTML des e-mails.
- **2025 — DM_Sans 3 weights** : chargé avec 400, 500, 600 au lieu du max 2 du CDC. Décision de design (500 utilisé pour UI intermédiaire). DÉCISION À VALIDER pour réduire à 2.


## 2026-11-02 — AdSense retiré, GA4 gardé en mode sans cookie
Décision du propriétaire : on garde Google Analytics 4, on abandonne AdSense. Sans bannière de consentement, GA4 tourne avec le Consent Mode « refusé » par défaut (aucun cookie déposé, mesure modélisée côté Google). CSP réduite à googletagmanager et google-analytics, frame-src 'none'. Une bannière de consentement (CNIL) permettrait de mesurer pleinement les visiteurs qui acceptent : à proposer au propriétaire avant toute mise en place (changement visuel).

## 2026-11-02 — Offres partenaires en cours (confirmées par le propriétaire)
Dog Chef −30 % sur la box d'essai + livraison gratuite ; Dogfy Diet −50 % sur la box d'essai de 14 jours ; Elmut −40 % sur la première commande ; Franklin Pet Food −30 % en abonnement. Maxi Zoo partenaire (liens tidd.ly). Fidelis : bocaux en rupture, ne pas mettre en avant. Petty Well n'est plus partenaire. Toute autre remise affichée est une erreur.
## 2026-11-02 — Scanner d'étiquette : l'IA lit, notre barème note
- La lecture de l'étiquette passe par une interface indépendante du fournisseur (`lib/scanner/extract.ts`, `SCANNER_PROVIDER`, schéma commun `ExtractedLabel` avec une confiance par champ et la liste des passages illisibles). Seul Gemini est branché ; un fournisseur Anthropic s'ajoute dans un fichier `lib/scanner/providers/anthropic.ts` (dépendance non ajoutée).
- Modèle par défaut `gemini-3.1-flash-lite` : `gemini-2.5-flash-lite`, moins cher, refuse les nouveaux comptes (404 le 2026-11-02). Coût mesuré : 1 300 à 2 400 jetons en entrée et ~500 en sortie, soit environ 0,0015 $ par analyse.
- La note vient uniquement de `lib/scanner/score.ts`, barème publié sur `/scanner` et justifié dans `docs/v2/scanner-score.md`. Humidité non déclarée sur un aliment sec : 10 % retenus, hypothèse affichée.
- Quota : il compte les appels au fournisseur. Un produit resservi depuis le cache (code-barres tapé ou lu, ou EAN lu déjà connu) ne compte pas ; une lecture en échec est rendue.
- Aucune photo stockée. Fiches `/croquettes/*` en `noindex` et hors sitemap tant que `reviewed = false` (relecture manuelle en base pour l'instant).

## 2026-11-02 — Scanner v2 : code-barres d'abord, Open Pet Food Facts, fiches de partage
- Parcours : code-barres (caméra, chiffres ou photo de la galerie) → cache → Open Pet Food Facts → photos guidées. Les deux premiers niveaux sont sans compte, sans IA et non décomptés ; seule l'analyse par photos demande un compte.
- Open Pet Food Facts : notre barème note la fiche si ingrédients et constituants sont exploitables et plausibles (`lib/scanner/opff.ts`), enregistrée avec `source = 'openpetfoodfacts'` et la mention ODbL partout où elle s'affiche. Couverture mesurée : 12 % des croquettes chien vendues en France présentes dans la base.
- Lecture du code-barres : API `BarcodeDetector` quand elle lit l'EAN, sinon polyfill `barcode-detector` (zxing-wasm) chargé à la demande. Le `.wasm` (947 Ko, 411 Ko compressé) est servi depuis `public/vendor/zxing` (pas de CDN, CSP inchangée) ; version figée à `barcode-detector@3.2.3`. `/scanner` est la seule page qui autorise la caméra (`Permissions-Policy: camera=(self)`).
- QR code des images de partage : `qrcode-generator` (sans dépendance) plutôt que `qrcode` (tire `yargs` et `pngjs`).
- Mauvaises photos : refus non décomptés (pas une étiquette, floue, chat, friandise). Une lecture marquée floue avec la liste ou 3 chiffres douteux est refusée : au test réel, Gemini a « lu » une photo illisible en marquant tout douteux. Partie manquante : session signée de 30 min, la photo manquante n'est pas décomptée.
- Corrections : recalcul de la note dans le navigateur, envoi comme signalement (`scan_report`) ; la fiche publique ne change qu'après relecture.

## 2026-11-02 — Pas de sauvegarde hors du serveur (décision du propriétaire)
La base est sauvegardée chaque nuit sur le VPS (`/srv/toutou/backups`, 7 jours gardés), sans copie externe. Risque accepté : une panne totale ou une perte du VPS emporterait aussi les sauvegardes (comptes, analyses du scanner, statistiques). Le contenu du site (articles, code) reste sur GitHub. À reconsidérer si le nombre de comptes grandit.
## 2026-11-02 — Scanner : référencement et relecture des fiches
- Seules les fiches relues (`reviewed = true`) et notées entrent dans le classement `/croquettes`, les pages marque `/croquettes/marque/[slug]`, les « meilleures notes » de `/scanner` et `/sitemaps/croquettes.xml` (ancienne adresse `/croquettes/sitemap.xml` conservée). Seuils d'indexation (`lib/scanner/seo.ts`) : classement à partir de 5 fiches relues, page marque à partir de 2, bloc de `/scanner` affiché à partir de 3. Pages filtrées du classement en noindex, canonique vers `/croquettes`. `/croquettes` n'apparaît que dans le sitemap des croquettes, quand il est indexable.
- JSON-LD `Product` + `Review` (auteur : l'organisation, note sur 100) seulement sur une fiche relue ; jamais d'`aggregateRating` (aucun avis d'utilisateurs).
- Sous 55/100, la fiche propose deux marques partenaires qui vendent des croquettes (hors rupture, hors marque de la fiche), triées par la note « qualité des ingrédients » de `data/brands.ts`, lien `rel="sponsored noopener"` déclaré.
- Relecture dans le tableau de bord : la correction repasse par `parseExtractedLabel` et la note est recalculée par le barème ; l'adresse de la fiche ne change pas. Chaque action serveur revérifie l'authentification HTTP Basic (le proxy ne protège pas un point d'entrée d'action). Un signalement « traité » est daté (`scan_report.handled_at`, migration 0003), pas supprimé.
- Encart du milieu d'article : le scanner remplace Dog Chef sur les articles d'étiquette, de glucides, d'additifs, de croquettes sans céréales et les « meilleures croquettes » ; il apparaît aussi sur les avis de marques de croquettes non partenaires, qui n'avaient pas d'encart.

## 2026-11-02 — Offres partenaires en cours (confirmées par le propriétaire)
Dog Chef −30 % sur la box d'essai + livraison gratuite ; Dogfy Diet −50 % sur la box d'essai de 14 jours ; Elmut −40 % sur la première commande ; Franklin Pet Food −30 % en abonnement. Maxi Zoo partenaire (liens tidd.ly). Fidelis : bocaux en rupture, ne pas mettre en avant. Petty Well n'est plus partenaire. Toute autre remise affichée est une erreur.
## 2026-11-02 — Premium gratuit pendant le lancement (branche `feat/premium`)
- Formule stockée dans `app.membership` (une ligne par compte au plus, pas de ligne = gratuit, `source = 'launch-free'`). Aucun moyen de paiement enregistré : rien ne peut être prélevé ; si Premium devient payant, on prévient avant.
- Activation par le titulaire depuis `/compte`, à deux conditions vérifiées côté serveur : adresse confirmée et au moins un chien (les alertes et les offres partent de son profil).
- Premium : 10 analyses par photo par mois (décision du propriétaire, 2026-11-02 ; prévu 50 au départ) (5 en gratuit, `PREMIUM_MONTHLY_SCANS`), alertes de poids, historique complet des scans (20 derniers en gratuit), alternative partenaire sous une croquette notée moins de 55 ouverte à tous les comptes (décision du 2026-11-02, pour l'affiliation). La courbe de poids, les offres du compte et le pré-remplissage des outils restent ouverts à tous les comptes.
- Alerte de poids : plus de 5 % d'écart entre les deux dernières pesées, à moins de 61 jours d'intervalle (`lib/weight-trend.ts`).
- Offres du compte : remises confirmées le 2026-11-02 seulement (table `CONFIRMED_DISCOUNTS` de `lib/account-offers.ts`, Ultra Premium Direct sans remise affichée même si `data/brands.ts` porte encore « −20 % ») ; raisons reprises de `data/brands.ts`. Fidelis (rupture) et Petty Well jamais proposés ; Dogfy écarté pour un chien qui prend du poids (menu bœuf riche, d'après sa fiche) et au-delà de 40 kg.
- Invitations à créer un compte : une seule par page, masquée quand le témoin `tg_compte` est présent (rendue côté navigateur, pages statiques). Après l'inscription, `?retour=` mène au formulaire du chien pré-rempli (race depuis une page race, poids depuis le quiz).


## 2026-11-02 — Ultra Premium Direct : −20 % confirmé
Offre confirmée par le propriétaire : −20 % sur la première commande en abonnement. Elle rejoint la liste des remises autorisées.

## 2026-11-02 — E-mails de la lettre (branche `feat/emails`)
- Bienvenue : une fois par adresse, trace dans l'attribut Brevo `WELCOME_SENT` (pas de table en base), posé avant l'envoi (au pire aucun e-mail, jamais deux). Pas de bienvenue en double opt-in.
- Désinscription : lien signé HMAC (`NEWSLETTER_SECRET`), retrait de la liste au clic sur « Me désinscrire » et non à l'ouverture du lien (les antivirus de messagerie ouvrent les liens). La campagne mensuelle utilise la balise Brevo `{{ unsubscribe }}`.
- Lettre mensuelle : premier mardi du mois, 18 h à Paris ; campagne créée la veille par `scripts/newsletter-monthly.ts` (minuterie non installée, aucun envoi à la liste sans validation du propriétaire). Offre en rotation parmi les 5 remises confirmées, Fidelis exclu.
- Couleurs écrites en dur dans les gabarits d'e-mails (`lib/emails/layout.ts`), comme `auth-emails.ts` : les messageries ignorent les variables CSS. Couverture en WebP (pas d'URL stable en JPEG) : Outlook de bureau ne l'affiche pas, le texte alternatif reste.

## 2026-11-03 — Envoi des e-mails reporté
Bienvenue automatique (`WELCOME_EMAIL_ENABLED`) et lettre mensuelle (`toutou-newsletter.timer`) prêtes mais non activées : le propriétaire démarrera quand la liste aura des abonnés. Aperçus et tests disponibles dans le tableau de bord, section « E-mails ».

## 2026-11-02 — Audit de sécurité (branche `sec/audit`)
Rapport : `docs/v2/securite-2026-11.md`. Décisions : aucune IP en base, ni pour les sessions (`ip_address` vidée) ni pour les compteurs de Better Auth (stockage `memory` au lieu de `database` ; remise à zéro à chaque redémarrage, acceptable pour des fenêtres de 1 à 5 min). Le tableau de bord revérifie l'authentification dans chaque page, route et action (Next 16.1.6 a des contournements connus du proxy). Optimiseur d'images en WebP seul. Next et sharp restent à monter dans une branche dédiée.

## 2026-11-02 — Next.js 16.4.4 et sharp 0.35.5 (branche `chore/next-16.4`)
Mise à jour approuvée par le propriétaire pour fermer les avis de sécurité restants de l'audit : 5 avis critiques sur `next` 16.1.6 (exécution de code via l'optimiseur d'images SVG/AVIF et `use cache`, contournements du proxy) et l'avis élevé sur `sharp` 0.34.5. `next`, `eslint-config-next` et `@next/mdx` passent en 16.4.4 (on reste en 16.x), `sharp` en 0.35.5 en dépendance directe ; Next 16.4.4 déclare lui-même `sharp ^0.35.5`, aucun `overrides` n'est nécessaire. L'`overrides` de `postcss` est gardé (Next 16.4.4 fige encore `postcss` 8.5.23). Seul changement de code : `experimental.turbopackUseSystemTlsCerts` retiré de `next.config.ts` (option supprimée en 16.2, elle ne servait qu'à next/font/google et les polices sont locales). L'optimiseur reste en WebP seul. Les vérifications d'authentification dans chaque page du tableau de bord restent en place, même si le proxy est corrigé.

## 2026-11-03 — Guide PDF et appel à l'action de fin d'article (branche `feat/guide`)
- Un seul appel à l'action principal en fin d'article (carte des conversions `docs/v2/cro-carte.md`) : aliments « oui » ou « modération » et recettes → l'offre du guide (`GuideOffer`, ex-`BonusFiche`) ; l'encart compte n'y est plus posé (`lib/article-signup.ts`). Urgences et aliments « danger » → rien dans le corps, un lien discret « Fiche frigo à imprimer » après la FAQ. Autres articles des rubriques aliments (guides d'alimentation quotidienne) : l'encart compte du sujet seul, plus d'encart lettre ni de fiche bonus. Encart du milieu inchangé.
- Le livre reprend le contenu existant sans rien générer : verdicts et notes du frontmatter (une note sans information, chocolat, remplacée par une phrase de son TL;DR), recettes copiées des articles (étapes mises à l'impératif en « tu »), aucune image payante. Le PDF et ses aperçus sont versionnés dans git (le déploiement ne les reconstruit pas).
- E-mail du guide : part même si la bienvenue est coupée et même en double opt-in (le lecteur a demandé ce fichier), à la place de la bienvenue, une fois par adresse (empreinte HMAC en base, jamais l'adresse), 3 par adresse réseau et par jour, 60 par heure et 300 par jour pour le site.
- `BREVO_DRY_RUN=1` : mode à blanc de l'inscription Brevo pour les tests, jamais en production.
## 2026-11-03 — Carte des conversions appliquée (branche `feat/cro-carte`)
- Type de page unique (`lib/page-type.ts`), déduit du chemin : encart du milieu, bandeau collant, événements du navigateur (`pageType` ajouté par `track`, sauf `Pageview`) et tableau de bord s'en servent.
- Encart du milieu : aucun sur urgences, aliment « danger », « mon chien a mangé… » et aliments « peut-il manger » (l'offre Dogfy du milieu est retirée) ; santé : outil poids (l'encart de fin demande déjà le compte) ; fiches races avec comparatif : aucun ; marques, avis, nutrition : inchangé (scanner ou Dog Chef).
- Bandeau noir collé en bas : seulement sur les pages nutrition, croquettes, marques et avis sans autre offre visible (carte `BrandCTA`, comparatif, encart du milieu partenaire). Fermeture mémorisée 7 jours (localStorage). `StickyCtaDogChef`, jamais affiché, est supprimé.
- Fiches races : comparatif `BreedBrandCompare` (maquette A, « Notre choix » en carte sur mobile) dans les 25 fiches qui avaient « Quelles marques pour un … ? ». Pastilles résumées du texte de chaque article : « Très adapté » sans réserve, « Adapté » avec condition ou mise en garde, « Correct » quand l'article écrit « correct » ou « à vérifier ». « Notre choix » : la première marque citée par l'article. Prix par jour seulement là où l'article le chiffrait (5 fiches).
- Tableau de bord : section « Conversions par type de page ». Un compte créé est rattaché par son emplacement d'origine ; bouton du haut et inscriptions directes restent non attribués.

## 2026-11-03 — Sitemaps par type de page (branche `feat/sitemaps`)
- next-sitemap n'est plus appelé (postbuild retiré) : il donnait la date du build à toutes les URL, ce qui rend `lastmod` inutile pour Google. Le paquet reste dans `package.json` (retrait = PR de dépendances dédiée).
- Index `/sitemap.xml` + un sitemap par type sous `/sitemaps/{type}.xml` (aliments, urgences, santé et nutrition, races, marques, recettes, pages principales, croquettes), route handlers revalidés toutes les heures. Classement dérivé de `lib/page-type.ts` : « nutrition-marques » coupé en deux (alimentation au quotidien avec la santé, marques et avis à part), hubs de rubrique avec les pages principales.
- `lastmod` réel : frontmatter des articles, dernier article pour un hub, mise à jour de l'analyse pour une fiche croquettes, `data/page-dates.ts` (tenu à la main) pour les autres pages. Pas de `priority` ni de `changefreq`.
- Même périmètre que l'ancien sitemap (401 URL au 2026-11-03), `robots.txt` par `app/robots.ts` avec une seule ligne `Sitemap:`. Détails : `docs/06-seo.md`, « Sitemaps ».

## 2026-11-03 — Copie hebdomadaire d'Open Pet Food Facts (branche `feat/opff-import`)
- Le propriétaire a validé une copie locale de la base Open Pet Food Facts, une fois par semaine (`scripts/opff-import.ts`, minuterie `toutou-opff-import.timer` dimanche 1 h 10, non installée). Source : l'export officiel `https://static.openpetfoodfacts.org/data/openpetfoodfacts-products.jsonl.gz` (19 Mo, refait chaque nuit). L'export CSV (3 Mo) est écarté : daté du 21 octobre au 3 novembre et sans les constituants des aliments pour animaux.
- L'export JSONL laisse `nutriments` vide depuis le nouveau format d'Open Food Facts : les valeurs sont lues dans `nutrition.aggregated_set.nutrients` et ramenées à l'ancien format (`flattenNutrition`, % gardés, g/kg divisés par 10, valeurs par portion ignorées). Si l'API change de la même façon, `lib/scanner/opff.ts` devra suivre.
- Licence ODbL : `app.opff_product` est une base dérivée (aliments pour chien seulement, champs réduits, code-barres normalisé, note de notre barème). Elle reste interne ; si elle était un jour redistribuée (téléchargement, API), elle devrait l'être sous ODbL. Les fiches produites (`/croquettes/[slug]`) sont un « produit » au sens de l'ODbL : la mention « Données : Open Pet Food Facts, licence ODbL » avec lien vers la base et la licence y figure (page, fiche A4, image de partage), comme pour un scan. Les images restent sur les serveurs d'Open Pet Food Facts (seule l'adresse est gardée, rien n'est affiché).
- Notation : mêmes règles qu'un scan par code-barres (`opffLabel` + `opffUnusableReason`, puis `classifyExtraction` et `scoreLabel`), pas de logique dupliquée. Les friandises sont gardées dans la table (`kind = 'treat'`) mais pas notées tant que le barème friandise n'est pas fusionné.
- Indexation : rien ne change par défaut (`OPFF_INDEX_POLICY=off`, seules les fiches relues sont indexées). Règle proposée, activable par `OPFF_INDEX_POLICY=complete` : fiche Open Pet Food Facts non relue avec marque, nom, composition (3 ingrédients) et 5 constituants sur 7. Les fiches importées jamais scannées (`scan_count = 0`) restent hors de « Fiches à relire » pour ne pas noyer les vrais scans ; elles y entrent dès leur premier scan.
- Scan par code-barres : fiche déjà notée → copie locale → API Open Pet Food Facts → API Open Food Facts (nouveau dernier recours, seulement si la fiche est un aliment pour animaux ; source `openfoodfacts`, mention « Données : Open Food Facts, licence ODbL »).

## 2026-11-03 — Intégration scanner : friandises importées, pâtées, fiches écartées (branche `feat/scanner-integration`)
- `feat/scanner-treats` et `feat/opff-import` réunies sur `feat/scanner-integration` (issue de `v2`). Une seule détection du type d'une fiche Open Pet Food Facts, pour le scan comme pour l'import : `opffImageType(catégories, nom)` (chat, friandise, aliment complet) ; `opffFoodKind` en dérive.
- L'import note les friandises avec le barème friandise (`analyseLabel`, `details.kind = 'treat'`), comme un scan. La règle d'indexation proposée (`OPFF_INDEX_POLICY=complete`, toujours `off`) reste la même pour les deux : 3 ingrédients et 5 constituants.
- Mot du produit dans les textes d'une fiche (`lib/scanner/food-noun.ts`) : « pâtée » si `typeAliment = 'humide'` ou humidité ≥ 60 %, « croquettes » si sec, « aliment » si le type est inconnu, « friandise » pour le barème friandise. Pour une fiche importée, `typeAliment` vient de l'humidité déclarée (≥ 60 % humide, ≤ 14 % sec), puis des catégories, puis du nom ; sans indice : « inconnu » (la note le traite comme un sec, comme avant). L'adresse `/croquettes/[slug]` ne change pas.
- Composition importée : le bloc « Additifs » et les constituants analytiques sont coupés de la liste d'ingrédients avant le découpage (`splitAdditivesBlock`, `lib/scanner/ingredient-text.ts`), même collés au dernier ingrédient ; vitamines et oligo-éléments listés à l'américaine passent aussi dans les additifs.
- Relecture des fiches importées : « Valider » = relue (indexable comme aujourd'hui), « Écarter » = nouvelle colonne `food_analysis.discarded` (migration `0006_scanner_discard`, à appliquer en production avant le déploiement) : fiche gardée pour le scanner, jamais publiée, hors « Fiches à relire », et le ré-import la met à jour sans effacer le drapeau. Une validation ultérieure l'efface. Colonne plutôt que `details` : `details` est réécrit à chaque recalcul du barème et à chaque ré-import.

## 2026-11-03 — Fiche de garde (branche `feat/fiche-garde`)

- Le gardien n'a pas de compte et rien n'est stocké sur lui. Le lien privé (jeton de 144 bits) expire le lendemain du retour (minuit, heure de Paris) ; supprimer la fiche le coupe aussitôt.
- La page du gardien vit dans son propre groupe de routes (`app/(garde)`) : sans GA ni `/api/e`, `referrer: no-referrer`, pour que le jeton de l'adresse ne parte ni dans la mesure ni dans un Referer.
- Sans compte, la saisie reste dans le navigateur (localStorage) jusqu'à la confirmation de l'inscription. Si le lien de confirmation est ouvert dans un autre navigateur, la saisie est perdue : le visiteur repart du profil de son chien.
- Le profil chien n'a ni croquettes ni allergies : la première fiche les apprend, les suivantes les reprennent (`lib/garde/prefill.ts`).

## 2026-11-03 — Classement des friandises à son adresse propre (branche `feat/scanner-seo`)
- Le classement des friandises quitte l'onglet `/croquettes?type=friandises` (noindex) pour `/croquettes/friandises`, indexable dès 5 fiches publiées, dans `/sitemaps/croquettes.xml`. Raison : la requête « meilleures friandises chien » est une intention distincte des croquettes, et les premiers résultats n'offrent aucun classement fondé sur la composition (comparatifs éditoriaux, fiches de boutiques). Sous `/croquettes/` plutôt qu'une nouvelle racine : les fiches friandise y vivent déjà (`/croquettes/{slug}`), même sitemap, même fil d'Ariane. L'ancienne adresse redirige (308) en gardant les filtres.
- Textes des classements neutres vis-à-vis d'`OPFF_INDEX_POLICY` : « fiche publiée » et règle affichée selon la politique en vigueur, plus « relue par la rédaction » quand ce n'est pas vrai.

## 2026-11-03 — Premium payant (Stripe)

- Prix : **5,99 € par mois sans engagement** ou **29,99 € par an**, TTC.
- Premium comprendra un **assistant (chat)** qui répond aux questions sur l'alimentation du chien : à développer (lot 6), mention claire qu'il s'agit d'une IA.
- Les comptes passés Premium gratuitement pendant le lancement **passent au payant** (prévenus par e-mail avant la fin de la gratuité).
- L'entreprise est **assujettie à la TVA belge** : siège en Belgique, Stripe Tax avec enregistrement Belgique ; ventes aux particuliers des autres pays de l'UE (France surtout) au taux belge jusqu'à 10 000 € par an de ventes transfrontalières, puis TVA du pays du client via le guichet OSS. Régime et code de taxe à confirmer avec le comptable.
- Plan technique : `docs/v2/stripe-plan.md`.
## 2026-11-03 — Remises partenaires : une seule table
- `data/partner-discounts.ts` (`CONFIRMED_DISCOUNTS`) est la seule source des remises affichées : fiches marque (`data/brands.ts` en dérive), offres du compte (`lib/account-offers.ts` la réexporte), boutons `BrandCTA` des articles (la remise du partenaire remplace celle écrite dans `offer`), outils, encarts du milieu et bandeaux collants. Franklin : « −30 % en abonnement » (ni « permanent », ni « première commande »).
- Les MDX gardent du texte écrit à la main, aligné sur la table et en typographie française (« −30 % », « 1re »).
- Carte des conversions appliquée : plus de bloc lettre seul (articles, accueil, `/blog`), plus de ligne e-mail sous un outil qui a sa carte compte, plus d'e-mail au résultat du quiz.
## 2026-11-03 — Pages « code promo » et suite de bienvenue (branche `feat/promo-welcome`)
- `/codes-promo` et `/codes-promo/{dog-chef,dogfy-diet,elmut,franklin,ultra-premium-direct}` : une offre par partenaire, tirée de `CONFIRMED_DISCOUNTS`. Seul Dog Chef a un code (WZU7090) ; les autres remises passent par le lien, aucun code inventé. Conditions, prix et livraison repris de `data/brands.ts` (`data/promo-codes.ts`). Date affichée : vérification du 2026-11-02. JSON-LD BreadcrumbList + FAQPage, pas d'`Offer`. Type de page `nutrition-marques` (sitemap « marques »), clic mesuré `Affiliate Click` avec `place: promo-page`. Fidelis et Maxi Zoo sans page.
- Suite de bienvenue J2 (ration), J5 (offre du mois, même rotation que la lettre), J10 (scanner) : `scripts/welcome-sequence.ts`, trace par étape dans `analytics.welcome_sends` (empreinte HMAC). Envoyée seulement avec `WELCOME_EMAIL_ENABLED=1` et aux contacts créés dans Brevo depuis `WELCOME_SEQUENCE_START` ; 300 envois par jour au plus ; une étape manquée part jusqu'à 3 jours en retard, jamais en arrière. Minuterie `toutou-welcome.timer` (10 h 17) non installée.

## 2026-11-04 : articles Toutou plus courts, plus vivants, moins chiffrés
Décision du propriétaire : les lecteurs veulent la réponse vite et se divertir. Priorité au langage courant et aux conseils pratiques (règle en tête de `docs/09-seo-geo-guide.md`, du skill boileau et des consignes de nuit). Exception : sécurité, urgence et maladie restent exactes et sérieuses. Effet à surveiller : moins de chiffres peut réduire les reprises par les moteurs d'IA, à regarder dans Search Console.
## 2026-11-04 — Suivi des e-mails et calendrier (branche `feat/email-tracking`)
- `analytics.email_log` garde empreinte HMAC, type, sujet, état et date de chaque e-mail individuel, jamais l'adresse. Résolution à l'affichage en calculant le HMAC des adresses connues. Écriture en arrière-plan depuis `lib/server/mailer.ts`, pour qu'elle ne retarde aucun envoi. Conservation 24 mois (`toutou-purge`, avec `guide_sends` et `welcome_sends`).
- La lettre mensuelle part en campagne Brevo : pas de ligne par adresse, la vue le dit.
- L'offre passe de J5 à J7 en gardant le code `j5` : les lignes écrites restent valables, sans réécriture ni double envoi.
- Trois rappels (`compte-j4`, `chien-j1`, `chien-j4`) coupés par défaut, `ACCOUNT_REMINDERS_ENABLED=1` après validation des textes par le propriétaire.
- L'inscription au compte n'a aucune case pour la lettre : un compte confirmé ne reçoit que les rappels de son compte, même s'il figure aussi sur la liste. Il garde la lettre mensuelle tant qu'il reste sur la liste Brevo.
- `analytics.email_optouts` note chaque clic sur « Se désinscrire » : un compte hors liste Brevo n'y serait sinon pas exclu. Empreinte gardée sans limite de durée. Une réinscription par formulaire rend la lettre, pas la suite ni les rappels.
- Pas de suite le premier mardi du mois, jour de la lettre : plafond d'un e-mail par jour.

Précision du propriétaire (2026-11-04) sur le ton des articles : informatif, intéressant, légèrement scientifique et divertissant, sans allure d'étude scientifique. Les références vont en fin d'article. Lot de nuit : 10 articles par nuit pour déplacer les références (`deploy/citations-prompt.md`), à retirer de `deploy/seo-rewrite.sh` quand il n'en reste plus.

## 2026-11-04 — Exclusion du propriétaire et barre collante d'une marque (branche `feat/stats-sticky-formules`)
- Exclusion par cookie signé et empreinte d'adresse plutôt qu'une liste d'IP : l'iPhone du propriétaire change d'adresse. Caddy masque les cookies dans ses journaux, l'ingestion ne peut lire que l'empreinte, que `/api/e` met à jour dès qu'il voit le cookie.
- Empreinte SHA-256 salée ligne par ligne, sel en base : aucune nouvelle variable pour le service d'ingestion. Elle ne protège pas d'une lecture de la base par force brute sur une IPv4, mais la table ne contient que les adresses du propriétaire, 12 h.
- Effet connu : une IPv4 partagée (4G, Wi-Fi d'hôtel) masque aussi les autres visiteurs de cette adresse pendant 12 h au plus. Le cookie reste réservé au propriétaire : la politique de confidentialité ne change pas pour les visiteurs.
- La barre d'une marque lève, à la demande du propriétaire, l'interdit « races » et « offre déjà sur la page » de la carte des conversions : elle s'efface dès que le bloc d'offre arrive, jamais deux demandes à l'écran. Urgences, aliments, santé et maladies restent exclus.
- Fiche race : la barre suit toujours la marque `pick`, même en rupture (décision du propriétaire, audit annulé) ; la ligne dit alors la rupture. Duels à deux marques nommées : pas de marque principale, barre à deux boutons inchangée.

## 2026-11-04 : Dog Chef devant Elmut
Décision du propriétaire : Dog Chef paie plus vite. Repas frais, Dog Chef d'abord, Elmut ensuite ; croquettes, Franklin d'abord. Appliqué au `pick` des fiches races (17 pages), au test, aux offres du compte, à l'ordre des marques et aux consignes de nuit. La rotation des offres reste. Point signalé : la page À propos affirme que les avis ne dépendent d'aucune relation commerciale.

## Fiche d'un compte et journal du scanner (2026-11-04)

- [x] L'URL de la fiche porte l'identifiant du compte, jamais l'e-mail (Caddy journalise les URL).
- [x] Fiches de garde dans le tableau de bord : chien, dates, lien actif ou non. `data` et `token` ne sont pas lus par la requête SQL. Le masquage ne se joue donc pas à l'affichage.
- [x] `analytics.scanner_events` : 90 jours. Suppression d'un compte ou d'une fiche : `ON DELETE SET NULL`, la ligne reste comme simple compteur, sans lien vers la personne.
- [x] Route ouverte `/api/scanner/code` : rien n'est écrit avant le contrôle de débit, ni pour un dépassement. Les dépassements sur cette route ne sont donc pas comptés.
- [ ] À trancher par le propriétaire : `signup_sources` est vidée à la confirmation. Afficher la source d'un compte confirmé, comme sur la maquette, demande de garder cette ligne et de le dire dans la politique de confidentialité.
