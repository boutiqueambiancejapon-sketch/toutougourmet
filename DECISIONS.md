# Décisions — Toutou Gourmet

## Tranchées

- [x] Framework : Next.js 16.1.6 — jamais downgrader · mise à jour via PR dédiée uniquement
- [x] React : 19.2.3
- [x] Langage : TypeScript strict — jamais de `any`
- [x] Déploiement : Vercel · région auto · GitHub Actions CI (à configurer)
- [x] Styling : Tailwind v4 + variables CSS obligatoires — coexistence `@theme inline` + `:root`
- [x] Dark mode : non implémenté — V2 · next-themes prévu si décidé
- [x] Langue : français à la racine, anglais sous `/en` (V2, voir « V2 — structure multilingue »)
- [x] Budget JS : objectif 80kb First Load gzippé (à surveiller avec `next build`)
- [x] CSP : `unsafe-eval` activé dans script-src — voir exception ci-dessous
- [x] Analytics : tableau de bord maison (`analytics.*` dans PostgreSQL, `/tableau-de-bord`) + GA4 · Plausible et Vercel Analytics abandonnés (voir « V2 — sortie des services tiers hérités de Vercel »)
- [x] Sitemap : next-sitemap (postbuild)
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

- **2025 — CSP unsafe-eval** : activé dans `next.config.ts` script-src. Raison d'origine (script Plausible) disparue le 2026-11-02 avec l'abandon de Plausible. Conservé par prudence : Google Tag Manager (variables JavaScript personnalisées) et les scripts publicitaires Google (AdSense, Funding Choices) peuvent recourir à `eval`. À retirer après un test en préversion sans `unsafe-eval` (console du navigateur sans erreur CSP sur GA4, annonces et bandeau de consentement).
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
