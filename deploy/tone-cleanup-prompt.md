Tâche quotidienne : nettoyer le ton de 4 articles existants du site Toutou Gourmet (www.toutou-gourmet.com). Tu tournes sur le serveur, dans une copie de travail de la branche `v2` (le site en production). Tu ne touches JAMAIS à une autre branche.

## Avant d'écrire
1. Lire `CLAUDE.md` et le skill `boileau` en entier (`.claude/skills/boileau/SKILL.md`), surtout « LA VOIX, EXEMPLES CONCRETS », les règles 26 à 34 et la règle des tirets cadratins (2 au plus par article, zéro dans title, H2, puces, FAQ).
2. Article de référence pour la voix : `content/blog/chien-mange-raisin-urgence.mdx`.
3. `DECISIONS.md` pour les offres partenaires confirmées (Dog Chef −30 % sur la box d'essai, Dogfy Diet −50 % sur la box d'essai, Elmut −40 % sur la première commande, Franklin −30 % en abonnement, Ultra Premium Direct −20 % sur la première commande en abonnement, Maxi Zoo : garder les liens tidd.ly). Petty Well interdit. Aucune autre remise.

## Choisir les articles
Compte les tirets cadratins (—) de chaque fichier `content/blog/*.mdx` et prends les 4 qui en ont le plus, en excluant ceux dont `updatedAt` est la date du jour ou la veille (déjà traités par la réécriture SEO de la nuit).

## Pour chaque article (nettoyage du ton, pas de réécriture SEO)
- Tirets cadratins ≤ 2 (zéro dans title, H2, puces, FAQ). Zéro emoji. Retirer `emoji=`/`icon=`, les `<StatRow>` faits d'emojis ou de notes x/5 sans méthode, le `<Verdict>` final s'il répète l'article.
- Phrases-chutes et formules creuses supprimées ; tics boileau corrigés ; H2 en questions naturelles (sauf recettes) ; tutoiement ; title ≤ 60 caractères sans tiret cadratin ; description entre 110 et 155.
- NE PAS toucher : slug, `categorySlug`, `category`, `date`, `verdict`, doses, chiffres sourcés, études, numéros, structure des composants. Aucun chiffre changé sans source vérifiée. Une dose de complément qui paraît élevée : la signaler dans le compte rendu, ne pas l'inventer.
- `updatedAt` = date du jour.

## Vérifications (une seule construction du site, à la fin, pour ménager la mémoire du serveur)
- Après les 4 articles : `npm run build > /tmp/tone-build.log 2>&1`. S'il échoue à cause d'un article, corrige-le ; si impossible, annule les changements de cet article (`git checkout -- fichier`) et relance une fois.
- Pour chaque article : tirets ≤ 2, emojis = 0, aucun nombre modifié (compare avant/après).
- Restaure `public/sitemap*.xml` si seul le postbuild les a modifiés.

## Commit
- Un commit Conventional Commits en anglais, ex. `content(tone): clean up 4 articles (slug1, slug2, …)`, terminé par une ligne vide puis :
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- NE PAS pousser : le script qui t'a lancé s'en charge.

## Compte rendu
3 lignes maximum : les 4 slugs avec tirets avant → après, chiffres suspects éventuels, état du build.
