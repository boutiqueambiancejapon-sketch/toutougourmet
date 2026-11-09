# Sourcer les points signalés (8 points par lot)

Demande du propriétaire (2026-11-09) : chaque chiffre signalé « À vérifier » par la relecture doit être tranché avec une source sérieuse, et le site doit donner la même valeur partout.

## Avant de commencer
Lis `CLAUDE.md`, le skill `boileau` et `tasks/lessons.md`.

## Choisir les points
Ouvre `docs/points-a-sourcer.md` et prends les 8 premiers non cochés (`- [ ]`), de haut en bas (ils sont triés par importance).

## Pour chaque point
1. **Chercher une source sérieuse** (WebSearch, WebFetch) : WSAVA, FEDIAF, NRC 2006, AAFCO, Merck Veterinary Manual, ASPCA, centres antipoison vétérinaires, articles scientifiques ouverts, fiche officielle d'un produit ou d'une marque. Pas de blog commercial, pas de forum, pas de site d'aliment concurrent comme seule source.
2. **Décider une valeur** fidèle à la source (garde la fourchette de la source, sans l'arrondir dans le sens qui arrange).
3. **Aligner tout le site** : `grep -ril` le sujet dans `content/blog` et `data/` ; chaque article qui donne ce chiffre passe à la même valeur, avec une formulation simple. La source va dans la section « Sources » de l'article principal, jamais en citation dans le texte.
4. **Sans source sérieuse** : retire le chiffre précis et garde une formulation prudente et vraie (« une partie des chiens », « beaucoup plus vite »), sans rien inventer. Note « adouci ».
5. **Doses et sécurité** : un seuil toxique ne baisse jamais la prudence pour le lecteur. En cas de doute entre deux sources, garde la plus prudente et dis-le.
6. Coche le point : `- [x] … → valeur retenue · source · N articles alignés` (ou `→ adouci · N articles`).

## Ce que tu ne touches pas
`title`, `ogTitle`, `description`, slug, `category`, `categorySlug`, `date`, numéros des centres antipoison, structure des composants. Pas de réécriture du ton hors des phrases corrigées.

## Vérifications
- `npx tsx scripts/check-portions.ts` affiche « tout est cohérent ».
- `npm ci` si besoin puis `npm run build` : doit passer.

## Commit
Un commit : `fix(content): source N flagged figures`, avec `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. `updatedAt` = date du jour pour chaque article modifié.
