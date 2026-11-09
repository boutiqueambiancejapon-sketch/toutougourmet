# Relecture de cohérence (6 articles par nuit)

Demande du propriétaire (2026-11-09) : trouver et corriger les incohérences de fond dans les articles déjà publiés. Les autres tâches de nuit ne touchent pas aux chiffres ; celle-ci est faite pour les vérifier et corriger ceux qui sont faux.

## Avant de commencer
Lis `CLAUDE.md`, le skill `boileau` (`.claude/skills/boileau/SKILL.md`) et `tasks/lessons.md`.

## Choisir les articles
Ouvre `docs/coherence-queue.md` et prends les 6 premiers non cochés (`- [ ]`), de haut en bas.

## Pour chaque article, cherche et corrige
1. **Mêmes quantités partout** : le TL;DR, le texte, les tableaux (`SizeTable`, tableaux Markdown), la FAQ et le mini-calculateur donnent les mêmes portions, les mêmes seuils de poids et les mêmes fréquences.
2. **Conversions** : une cuillère à café ≈ 5 g, une cuillère à soupe ≈ 15 g (aliment humide ou cuit) ; une pièce a un poids plausible et le même partout dans l'article ; les kcal correspondent aux grammes (`kcal100`).
3. **Logique par gabarit** : la portion monte avec le poids, un petit chien ne reçoit jamais plus qu'un gabarit au-dessus, et la portion reste sous 10 % des calories du jour.
4. **Comparaisons à égalité** : cru avec cru, cuit avec cuit, sec avec humide, pour 100 g des deux côtés.
5. **Contradictions avec le reste du site** : pour chaque fait chiffré important (dose toxique, % de chiens touchés, prix, composition), `grep -ril` le même sujet dans `content/blog` ; si deux articles se contredisent, garde la valeur sourcée et aligne l'autre.
6. **Marques partenaires** : prix, remises et compositions conformes à `data/brand-content.ts`, `data/partner-discounts.ts` et aux pages officielles (WebFetch). Rien d'invérifiable : ni « vétérinaire nutritionniste », ni note en étoiles, ni « n° 1 ».
7. **Faits de santé** : un chiffre qui te paraît faux se vérifie (WebSearch, source sérieuse) avant d'être changé. Sans source, tu ne changes pas : tu le notes dans la file.

## Ce que tu ne touches pas
`title`, `ogTitle`, `description` (décision du propriétaire), slug, `category`, `categorySlug`, `date`, numéros des centres antipoison, structure des composants. Pas de réécriture du ton : seulement les phrases à corriger.

## Vérifications
- `npx tsx scripts/check-portions.ts` affiche « tout est cohérent ».
- `npm ci` si besoin puis `npm run build` : doit passer.

## Commit
Un commit pour la nuit : `fix(content): coherence pass for N articles`, avec `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Coche les articles dans `docs/coherence-queue.md` avec le nombre de corrections, et pour chaque correction une ligne courte en dessous (avant → après). `updatedAt` = date du jour seulement pour un article corrigé.
