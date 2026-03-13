# Fonctionnalités — Toutou Gourmet

## TL;DR

- Quiz personnalisé → recommandation marque
- 4 calculateurs : budget · coût · poids · ration
- Comparateur interactif marques
- Blog MDX : articles chien par catégorie + fiches marques

---

## 6.1 Quiz personnalisé

- Fichier : `data/quiz.ts` + composants `components/quiz/`
- Inputs : type chien · âge · poids · activité · budget · préférences alimentaires
- Output : recommandation marque(s) + score de compatibilité
- Logique : `lib/quiz.ts`
- Rendu : SSG (page serveur) + composant client isolé pour interactivité
- V1 : quiz complet · scoring · recommandation · CTA vers fiche marque

---

## 6.2 Calculateur budget mensuel (/outils/budget)

- Inputs : poids chien · fréquence repas · marque sélectionnée
- Output : coût mensuel estimé
- Logique : `lib/calculators.ts`
- V1 : calcul simple · résultat instantané côté client

---

## 6.3 Comparateur coût par kg (/outils/cout)

- Inputs : marques à comparer · format (sacs/boîtes) · poids
- Output : tableau comparatif coût/kg + classement
- V1 : données statiques depuis `data/brands.ts`

---

## 6.4 Calculateur poids / ration (/outils/poids et /outils/ration)

- Inputs : poids chien · âge · niveau d'activité · marque
- Output : ration journalière recommandée en grammes
- Logique : `lib/calculators.ts`
- V1 : calcul selon grilles constructeurs

---

## 6.5 Comparateur marques (/comparateur)

- Données : `data/brands.ts` — Franklin, Elmut, Petty Well, Dog Chef
- Critères : composition · prix · disponibilité · note globale
- V1 : tableau comparatif statique + filtres côté client
- Composant client isolé pour tri/filtres

---

## 6.6 Blog MDX — Articles chien (/chien/[category]/[slug])

- Source : `/content/[category]/[slug].mdx`
- Métadonnées : gray-matter (frontmatter : title, description, date, category, slug)
- Lecture : `lib/mdx.ts`
- Rendu : ISR 1800s · JSON-LD Article + BreadcrumbList
- Catégories : alimentation-quotidienne · comportement-alimentaire · fruit · légume · viande · santé
- Syntax highlighting : rehype-pretty-code

---

## 6.7 Fiches marques (/chien/marque/[slug])

- Données : `data/brands.ts`
- Marques V1 : Franklin · Elmut · Petty Well · Dog Chef
- Contenu : composition · prix · avantages · inconvénients · note · JSON-LD Product

---

## 6.8 Affiliés

- Logique : `lib/affiliate.ts`
- V1 : liens affiliés sur CTA marques + tracking Plausible
