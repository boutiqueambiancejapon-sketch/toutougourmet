Tâche quotidienne : convertir 2 fiches races du site Toutou Gourmet (www.toutou-gourmet.com) au comparatif de marques `<BreedBrandCompare>`. Tu tournes sur le serveur, dans une copie de travail de la branche `v2` (le site en production). Tu ne touches JAMAIS à une autre branche.

## Avant d'écrire
1. Lire `CLAUDE.md`, le skill `boileau` (`.claude/skills/boileau/SKILL.md`) et l'entrée du 2026-11-03 de `DECISIONS.md` sur le comparatif des fiches races (règle des pastilles).
2. Modèle à suivre : `content/blog/nourriture-carlin.mdx`, section « Quelles marques pour un Carlin ? ». Composant : `components/race/BreedBrandCompare.tsx` et ses voisins (props acceptées par `BrandGroup` et `BrandRow` : lis `components/race/compare-data.ts`).
3. Offres et marques : uniquement celles de `data/brands.ts` et `lib/account-offers.ts` (`CONFIRMED_DISCOUNTS`). Petty Well interdit. Aucune autre remise, aucun prix inventé.

## Choisir les fiches
Les fichiers `content/blog/*.mdx` avec `categorySlug: "race"` qui ne contiennent pas encore `<BreedBrandCompare`. Prends les 2 premiers par ordre alphabétique de nom de fichier, en excluant ceux dont `updatedAt` est la date du jour ou la veille. S'il n'en reste aucun, écris « Toutes les fiches races ont leur comparatif » et arrête-toi sans commit.

## Pour chaque fiche
- Repère la section qui recommande des marques (souvent « Nos recommandations de marques pour … » ou un tableau de marques). Remplace-la par un H2 question naturelle (« Quelles marques pour un {race} ? ») suivi de `<BreedBrandCompare breed="…" weight="…">` avec un ou deux `<BrandGroup>` par profil et un `<BrandRow>` par marque citée.
- Tout le contenu du comparatif vient de la fiche elle-même : raison (une phrase courte), mise en garde éventuelle, prix par jour seulement s'il est écrit dans la fiche, poids de référence de la fiche. Rien d'inventé. Pastilles selon la règle de DECISIONS.md : « tres-adapte » sans réserve, « adapte » avec une condition ou une mise en garde, « correct » quand la fiche dit « correct » ou « à vérifier ». `pick` sur la première marque recommandée par la fiche.
- Supprime les paragraphes, listes et tableaux qui faisaient doublon avec le comparatif, et tout lien partenaire en dehors du comparatif. Garde le reste de l'article intact (conseils, FAQ, sources), sans réécrire le ton.
- NE PAS toucher : slug, `categorySlug`, `category`, `date`, doses, chiffres sourcés. `updatedAt` = date du jour.

## Vérifications (une seule construction du site)
- Après les 2 fiches : `npm run build > /tmp/race-build.log 2>&1`. Si elle échoue à cause d'une fiche, corrige-la ; si impossible, annule cette fiche (`git checkout -- fichier`) et relance une fois.
- Pour chaque fiche : un seul `<BreedBrandCompare>`, aucune URL d'affiliation hors du composant (`grep -c "c3po.link\|tidd.ly\|dogchef.com/fr/code" fichier` doit trouver 0 hors du composant), aucune marque absente de `data/brands.ts`.

## Commit
- Un commit Conventional Commits en anglais, ex. `content(races): brand comparison for {race1}, {race2}`, terminé par une ligne vide puis :
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- NE PAS pousser : le script qui t'a lancé s'en charge.

## Compte rendu
3 lignes maximum : les 2 fiches converties, le nombre de fiches restantes, état du build.
