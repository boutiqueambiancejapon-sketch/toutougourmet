# Todo — Optimisation BOFU cluster "croquettes-chien-[cas]"

## Contexte
240+ articles publiés, trafic atone. Diagnostic : sur-investissement informationnel (intention basse,
cannibalisé par les AI Overviews) vs sous-exploitation du BOFU (intention d'achat = revenus affiliés).
Décision utilisateur : pivot BOFU. Sous-tâche validée : capter la requête "meilleures croquettes pour
chien [cas]" sur le cluster existant, **titres/H1/meta inchangés** (zéro risque ranking), **corps enrichi**.

## Constat audit
- 34 articles `croquettes-chien-[cas]` ont DÉJÀ leurs marques affiliées (2-4 BrandCTA + liens c3po + Verdict).
- 33 d'entre eux titrent leur section de reco `## Nos recommandations` → H2 mort, capte aucune requête.
- 1 seul (`sterilise`) utilise déjà le bon pattern : `## Nos recommandations : les meilleures croquettes pour chien stérilisé`.

## Plan
- [ ] Reframer le H2 `## Nos recommandations` → `## Les meilleures croquettes pour chien [cas] en 2026`
      sur les 33 articles, avec une formulation [cas] naturelle (= requête réelle) par article.
- [ ] Garder le contenu marques/affiliés intact (pas de duplication, pas de nouvelle section).
- [ ] Vérifier : 0 doublon de H2, build/lint OK, occurrence "meilleures croquettes" présente.
- [ ] Commit sur branche claude/great-knuth-up63o + push.

## Hors scope (passes ultérieures possibles)
- Méta-descriptions (seulement 2/34 contiennent "meilleur").
- Page pilier "Meilleures croquettes pour chien 2026" (hub du cluster).
- Maillage interne renforcé info → cluster BOFU.
