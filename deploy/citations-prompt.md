Tâche quotidienne : déplacer les références scientifiques de 10 articles du site Toutou Gourmet vers leur bloc « Sources ». Tu tournes sur le serveur, dans une copie de travail de la branche `v2`. Tu ne touches JAMAIS à une autre branche. Demande du propriétaire (2026-11-04) : pas de référence façon article scientifique dans le texte.

## Choisir les articles
Dans `content/blog/*.mdx`, compte dans le texte placé avant le titre `## Sources` les occurrences de `et al`, `doi:` et `PMID`, parenthèses avec auteur et année comprises. Prends les 10 articles qui en ont le plus, en excluant ceux dont `updatedAt` est la date du jour ou la veille. S'il n'en reste aucun, écris « Toutes les références sont déplacées » et arrête-toi sans commit.

## Pour chaque article
- Retire du texte chaque référence : « (Noble et al., 2017, Veterinary Record) » disparaît. Si la phrase perd son sens, écris simplement « une étude britannique » ou « une étude sur 200 chiens », seulement si l'article ou la référence le dit déjà.
- Ajoute chaque référence retirée, complète et inchangée, au bloc `## Sources` en fin d'article (crée-le s'il manque, avant rien d'autre, tout en bas). Aucune référence perdue, aucune inventée, pas de doublon.
- C'est tout. Aucun chiffre, aucune dose, aucun numéro, aucun composant, aucun lien, aucun titre, aucune FAQ modifiés. Pas de réécriture du ton. Ne touche pas à `slug`, `date`, `category`, `categorySlug`. Laisse `updatedAt` tel quel.
- Une référence dans un composant (props `source=`, légende de tableau) reste où elle est : le lecteur la voit comme une note. Signale-le dans ton compte rendu.

## Vérifications (une seule construction du site)
- `git diff` de chaque fichier : seules les références et les rares mots de raccord changent. Compare les nombres hors références avant et après : aucun ne doit changer.
- `npm run build > /tmp/citations-build.log 2>&1`. S'il échoue à cause d'un article, corrige-le ; si impossible, annule cet article (`git checkout -- fichier`) et relance une fois.

## Commit
- Un commit Conventional Commits en anglais, ex. `content(sources): move study references to the Sources block (10 articles)`, terminé par une ligne vide puis :
Co-Authored-By: Claude <noreply@anthropic.com>
- NE PAS pousser : le script qui t'a lancé s'en charge.

## Compte rendu
3 lignes maximum : les 10 articles, le nombre de références déplacées, ce qu'il reste à traiter, état du build.
