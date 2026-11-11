# Instructions Claude Code — Toutou Gourmet

Lis PROGRESS.md avant chaque session (sections récentes en bas).
Lis le fichier /docs/ correspondant à ta tâche.
Pour tâche transversale : lis docs/CDC.md uniquement.
**Rédaction de contenu (article, page pilier, page cluster) : lis docs/09-seo-geo-guide.md en entier avant d'écrire la première ligne.**
**Toute rédaction française (article MDX, page, FAQ, méta, copy, scheduled task de génération) : charger le skill `boileau` (`.claude/skills/boileau/SKILL.md`) AVANT d'écrire — règles préventives à appliquer dès le premier jet, pas une correction post-rédaction.**

## Vision : où on veut arriver

Toutou Gourmet passe d'un site de contenu et d'affiliation à **la plateforme qui aide les propriétaires à bien nourrir leur chien** : comprendre ce qu'il mange, choisir un aliment adapté, suivre son alimentation au même endroit. On reste centré sur la nutrition canine, jamais un assistant généraliste.

Objectif économique : 5 000 €/mois de revenus en premier palier, 10 000 €/mois ensuite, avec un actif rentable et autonome.

Parcours visé : Google → article, outil, scanner ou Milo → compte gratuit → profil du chien → usage personnalisé → retour régulier → revenus (affiliation, puis Premium). Le parcours d'aujourd'hui (Google → article → clic partenaire, sans retour) est le problème à résoudre.

Les piliers, dans l'ordre où ils servent ce parcours :
1. **Contenu SEO et GEO** : articles automatisés (créneaux 7 h et 20 h), pages piliers, pages mères « Avis + marque », classements `/meilleures-…`, fiches produits indexées par lots (`app.fiche_index`, bascule dans le tableau de bord).
2. **Base produits et notes** : fiches importées de Maxi Zoo et lues sur étiquette, quatre barèmes déterministes (croquettes et pâtées, friandises, compléments, huiles), fiabilité affichée.
3. **Scanner** : code-barres et photo d'étiquette. L'IA lit, notre algorithme note. Il reste simple.
4. **Milo, l'assistant** (le Shiba des e-mails) : compte obligatoire, CGU acceptées, 5 questions par jour, nos articles d'abord, questions de contexte, renvoi au vétérinaire sur les sujets sensibles, conseils d'achat en liens partenaires seulement.
5. **Compte et « Mon chien »** : profils, pesées, rations, aliments gardés, historique des compositions, rappels. Le compte gratuit doit déjà valoir le coup.
6. **Revenus** : affiliation aujourd'hui (Maxi Zoo, Dog Chef, Franklin, Elmut, Dogfy Diet, Ultra Premium Direct). Premium prévu (3,99 €/mois ou 29,99 €/an, `tasks/todo.md` lot 7), CGV à écrire avant de vendre.
7. **International** plus tard : EN sous `/en`.

Ce qu'on ne fait jamais, même pour aller plus vite :
- ajuster une note ou un classement pour un partenaire ;
- écrire « notre test », « testé par nous », un faux vétérinaire relecteur ou une promesse de soin ;
- donner un diagnostic ou une dose de médicament : on renvoie vers le vétérinaire ;
- raconter des histoires de santé tirées d'avis clients sur les pages partenaires ;
- refaire le menu ou le design global sans préversion validée ;
- multiplier les appels payants (IA, images) sans accord du propriétaire.

## Le propriétaire

Il n'est pas technique, parle français, suit souvent depuis son iPhone et veut des réponses courtes. Il veut avancer vite, en prod directement, sans maquette sauf pour un changement de design global. Demander avant toute action destructive ou toute dépense. Ne jamais lui demander de coller un secret.

## Projet

Domaine : www.toutou-gourmet.com · tableau de bord : dashboard.toutou-gourmet.com (liens vers le site public toujours en absolu)
Stack : Next.js 16.4.4 + React 19 + TypeScript strict + Tailwind v4 + MDX + PostgreSQL (Drizzle pour le schéma `app`, SQL à la main pour `analytics` dans `db/analytics.sql`)
Next.js : 16.4.4 — ne jamais changer sans PR dédiée
Langue défaut : français à la racine (groupe `app/(fr)`), EN prévu sous `/en`
Hébergement : VPS one.com (Caddy + systemd + PostgreSQL, voir `deploy/README.md`). Plus de Vercel depuis la bascule du 2026-11-02.
Domaine : registrar Vercel, DNS chez Cloudflare depuis le 2026-11-11 (serveurs damon et joyce.ns.cloudflare.com), tous les enregistrements en « DNS only ». Le compte Vercel a été bloqué pour dépassement d'usage (offre Hobby) le même jour.
Branche de prod : `v2` (`toutou-deploy.service`, `DEPLOY_BRANCH=v2`). L'ancienne branche `claude/toutou-gourmet-setup-3mRbP` n'est plus déployée.
Plan : `tasks/todo.md` · décisions : `DECISIONS.md` · éditeur : Toutou Gourmet (Mathias Cetani), Merchtem, Belgique, BCE BE 0683.927.006, bonjour@toutou-gourmet.com
Mode de travail : le code vit sur le VPS, Claude Code y tourne (Remote Control depuis l'iPhone ou VS Code en SSH), on construit et on déploie sur place, GitHub garde une copie publique. **Une seule source** : aucune session cloud ne pousse sur ce dépôt.

### Déployer

1. Branche depuis `v2`, modifs, `npx tsc --noEmit`, lint des fichiers touchés.
2. `NODE_OPTIONS=--max-old-space-size=4096 nice -n 10 npm run build` (un seul build à la fois).
3. Commit, `git checkout v2 && git pull origin v2`, `git merge --no-ff <branche>`, `git push -u origin v2`.
4. `sudo systemctl start toutou-deploy.service`, puis vérifier que `readlink -f /srv/toutou/current` finit par le hash de `HEAD`.
5. Changement de schéma Drizzle : `sudo /usr/local/sbin/toutou-migrate` après le push. Table `analytics` : la créer à la main (propriétaire `toutou`) et l'ajouter à `db/analytics.sql`.

Lancer un script avec l'environnement de prod : `sudo -n -u toutou bash -c 'cd /srv/toutou/current && set -a && . /srv/toutou/shared/.env && set +a && node_modules/.bin/tsx scripts/X.ts'`. Base : `sudo -n -u postgres psql -d toutou`.

Tâches planifiées (systemd, fichiers dans `deploy/`) : articles 7 h et 20 h, réécriture SEO et ton la nuit, import Maxi Zoo, IndexNow, garde anti-referer, rappel de confirmation, résumé du matin (ntfy), purge, e-mails de bienvenue, alertes, déploiement.

## Comportement agent

- Tâche non-triviale (3+ étapes) → plan dans tasks/todo.md avant exécution
- Blocage → STOP + re-plan, jamais de pushing
- Correction reçue → mettre à jour tasks/lessons.md immédiatement
- Tâche terminée → prouver que ça marche avant de marquer done (page servie, capture mobile 390 px, script lancé)
- Bug report → fix autonome, zéro questions, pointer logs + tests
- Sous-agents → décharger recherche, exploration, analyse parallèle · au plus 2 chantiers lourds en même temps

## Filtre qualité — vérifier avant chaque commit

- [ ] TypeScript : zéro `any`, zéro erreur `tsc --noEmit`
- [ ] Lint : zéro erreur ESLint sur les fichiers touchés
- [ ] next/image : jamais de `<img>` natif · width+height sur toutes les images · priority sur LCP uniquement
- [ ] Variables CSS : jamais de valeur hardcodée
- [ ] Composants : aucun > 150 lignes
- [ ] Boutons : jamais sur deux lignes (`whitespace-nowrap`)
- [ ] TODO : aucun sans numéro d'issue GitHub
- [ ] Secrets : aucun dans le code ni dans un commit (dépôt public) · tout dans `/srv/toutou/shared/.env` · jamais affichés dans un terminal
- [ ] Portabilité : aucun service propre à Vercel (KV, Blob, Edge Config, Cron)
- [ ] Bots : `curl -s https://www.toutou-gourmet.com/[page]` retourne H1 + premier paragraphe sans JS
- [ ] CSP : unsafe-eval présent → exception documentée dans DECISIONS.md (Plausible Analytics)
- [ ] Polices : zéro requête fonts.googleapis.com · max 2 familles · DM_Sans 3 weights (exception documentée DECISIONS.md)
- [ ] Above-fold : aucun import Framer Motion sur composants visibles sans scroll
- [ ] Dette technique : adjustFontFallback absent sur Fraunces + DM_Sans — ajouter si on touche layout.tsx
- [ ] **Article MDX : `frontmatter.category` aligné avec le mapping de `components/blog/blog-categories.ts` — sinon cover + OG tombent sur le fallback `cat-nutrition`**

## Règles Git absolues

- Toute modification passe par une branche tirée de `v2`, fusionnée en `--no-ff` dans `v2` une fois `npm run build` passé
- Changement risqué (dépendances, config Next, montée de version) : branche dédiée + PR, pas de fusion directe
- Conventional Commits en anglais, terminés par la ligne `Co-Authored-By` demandée
- Jamais de force-push sur `v2`
- Un script shell de déploiement s'écrit dans un fichier et se lance avec `bash -euo pipefail`

## Règles absolues code

- TypeScript strict, jamais de `any`
- Variables CSS uniquement, jamais de valeur hardcodée
- next/image obligatoire, jamais de `<img>` natif
- next/image : width + height obligatoires sur toutes les images
- next/image : priority uniquement sur l'image LCP (above-fold) — une seule par page
- HTML sémantique, jamais de `<div>` inutile
- prefers-reduced-motion respecté (déjà dans globals.css)
- Polices : next/font uniquement · jamais de `<link>` Google Fonts
- Jamais de `'use client'` sur un fichier page.tsx — isoler dans un sous-composant
- Contenu textuel indexable (H1, H2, p, li) → rendu serveur obligatoire
- Fetch → toujours spécifier `{ next: { revalidate: X } }` ou `{ cache: 'no-store' }` explicitement
- Remises partenaires : seulement depuis `data/partner-discounts.ts`
- Pas d'explication de ce que tu vas faire — fais-le
- Un seul doute bloquant à la fois

## Images & covers article

Chaque page a une cover illustrée dérivée automatiquement. **Jamais** imposer
un chemin d'image en dur dans un composant ou un frontmatter : passer par le
composant `<Illustration slot="..." />` qui résout le fichier via le manifest.

- **Source de vérité** : `data/images-manifest.ts` (1 entrée par slot : id, group, ratio, tone, decorations, `imageReady`)
- **Mapping catégorie → slot** : `components/blog/blog-categories.ts` (`getCategoryVisual(label)`)
- **Résolution runtime** : `<Illustration>` lit `slot.imageReady` → sert `/public/images/{group}/{id}.webp` si `true`, sinon rend le placeholder SVG + overlay décoratif
- **Open Graph** : l'image social d'un article est dérivée **automatiquement** de `frontmatter.category` dans `generateMetadata` (voir `app/(fr)/chien/[category]/[slug]/page.tsx` et `app/(fr)/blog/[slug]/page.tsx`) — ne pas la hardcoder
- **Une image par slot** : générer une seule image, en demander plus seulement avec l'accord du propriétaire (appels payants)

### Ajouter une nouvelle catégorie d'article

1. Ajouter l'entrée dans `CATEGORY_TABLE` de `blog-categories.ts` (slot, pillVar, emoji)
2. Déclarer le slot correspondant dans `data/images-manifest.ts` (`imageReady: false` initialement)
3. Générer le WebP via Gemini en suivant `docs/prompts/gemini-image-system.md` (ratio 3:2, tone aligné pill color)
4. Déposer le fichier dans `/public/images/articles/{slot}.webp`, faire tourner `node scripts/compress-images.mjs` (target < 150 KB)
5. Flipper `imageReady: true` sur le slot du manifest
6. Commit : `feat(images): add cover for {category}`

### Écrire un nouvel article MDX

- `frontmatter.category` **doit** matcher une clé existante de `CATEGORY_TABLE` (sinon fallback silencieux sur `cat-nutrition` — bug visuel)
- `frontmatter.categorySlug` pilote la route finale (`/chien/{categorySlug}/{slug}`)
- Aucune image de cover à ajouter dans le MDX : la cover est résolue automatiquement depuis la catégorie
- Ton : réponse rapide, vivant, un peu scientifique sans être une étude, au plus 2 noms d'organismes hors « Sources » (skill `boileau`, règles 35 à 49) · sécurité et urgences toujours exactes · un produit se décrit à partir de sa page officielle

## Annotation dans le code

```
// @cdc [section] — [règle courte]
```

## Fin de session

1. Mettre à jour PROGRESS.md
2. Mettre à jour DECISIONS.md si nouvelle décision
3. `git add PROGRESS.md DECISIONS.md && git commit -m "docs: update PROGRESS and DECISIONS"`
4. Pusher `v2` (et déployer si du code a changé)
