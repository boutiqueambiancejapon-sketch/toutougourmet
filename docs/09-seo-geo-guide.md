# Guide SEO & GEO — Rédaction de contenu web
> Spécifique à Toutou Gourmet — comparateur pet food premium FR.
> Lire en entier avant de rédiger tout article de blog, page pilier, page cluster ou page de contenu.

---

## TL;DR — 10 règles non négociables

- **Avant tout : parcourir les 3 premiers résultats Google sur le mot-clé — max 3 URLs, 10 minutes (§0)**
- Réponse directe dans les 2 premières phrases — jamais d'intro narrative
- Mot-clé principal dans H1, premier paragraphe, meta title, meta description
- Structure H2/H3 en questions quand naturel
- Chiffres sourcés obligatoires — jamais d'affirmation vague
- TL;DR en haut si contenu > 600 mots
- FAQ 6 questions minimum + JSON-LD FAQPage sur toute page indexée
- `<time datetime="...">` sur chaque page datée
- Zéro duplication entre pages — chaque page a un angle unique
- Définir tout terme technique à sa première apparition
- Longueur cible : 600–900 mots page cluster · 800–1200 mots article blog

---

## 0. Avant de rédiger — Analyse rapide des concurrents

**Étape obligatoire avant d'écrire la première ligne.** Durée : 10 minutes max.

### 0.1 Processus

1. Rechercher le mot-clé principal sur Google
2. Ouvrir les **3 premiers résultats organiques** (hors annonces, hors Wikipedia)
3. Parcourir chaque page avec `web_fetch` — lire en diagonale, pas en détail
4. Noter les éléments ci-dessous, puis fermer — ne pas s'y attarder

### 0.2 Ce qu'on cherche sur chaque URL

| Signal | Question à se poser |
|---|---|
| Structure | Quels H2 utilisent-ils ? Dans quel ordre ? |
| Angle | Quel est leur positionnement éditorial ? (conseils, définition, comparatif…) |
| Longueur | Article court (~500 mots) ou long (~1500 mots) ? |
| FAQ | Ont-ils une FAQ ? Quelles questions couvrent-ils ? |
| Manques | Qu'est-ce qu'ils n'ont pas dit et qui serait utile ? |
| Chiffres | Citent-ils des sources ou des statistiques ? Lesquelles ? |

### 0.3 Règles strictes

- **Max 3 URLs** — au-delà c'est de la procrastination, pas de la recherche
- **Jamais copier** un titre, une phrase ou une structure — inspiration uniquement
- **Jamais citer** un concurrent dans le contenu final
- Si les 3 premiers résultats couvrent tous le même angle → **prendre l'angle opposé** (différenciation)
- Si les 3 premiers résultats sont des pages très courtes et pauvres → **opportunité** : aller plus loin, plus sourcé, plus structuré

### 0.4 Output attendu avant de commencer

Avant d'écrire, formuler mentalement (ou dans un commentaire de code) :

```
Mot-clé : [mot-clé principal]
Angle concurrent dominant : [ce que tout le monde fait]
Mon angle différenciant : [ce que je vais faire différemment]
Questions FAQ non couvertes par les concurrents : [liste courte]
Chiffres ou sources à trouver : [liste courte]
```

---

## 1. Anatomie d'une page optimisée

### 1.1 Meta title

```
[Mot-clé principal] — [Bénéfice ou contexte] | Toutou Gourmet
```

Règles :
- Max 60 caractères
- Mot-clé principal en tête — jamais au milieu ou à la fin
- Jamais de majuscules inutiles (sentence case)
- Chaque page a un title unique — zéro duplication

```
✅ "Croquettes sans céréales pour chien : notre comparatif | Toutou Gourmet"
✅ "Alimentation BARF pour chiot : guide complet | Toutou Gourmet"
❌ "Tout savoir sur les meilleures croquettes premium sans céréales pour votre chien"
❌ "Toutou Gourmet — Croquettes — Sans céréales — Comparatif"
```

### 1.2 Meta description

```
[Réponse directe à l'intention de recherche]. [Détail ou chiffre]. [CTA implicite].
```

Règles :
- Max 155 caractères
- Contient le mot-clé principal une fois, naturellement
- Ne pas répéter le title mot pour mot
- Formule active, jamais passive

```
✅ "Les croquettes sans céréales conviennent aux chiens intolérants au gluten. Comparez 12 marques premium notées par nos experts vétérinaires."
❌ "Dans cet article, nous allons vous expliquer tout ce qu'il faut savoir sur les croquettes sans céréales pour chien."
```

### 1.3 H1

- Un seul H1 par page — jamais deux
- Identique ou très proche du meta title (sans la marque)
- Contient le mot-clé principal
- Max 70 caractères
- Rendu côté serveur — jamais injecté en JS

### 1.4 Structure de contenu

```
[H1]
[TL;DR si > 600 mots — 3 bullet points max]
[Paragraphe d'accroche — réponse directe, 2-3 phrases, contient le mot-clé]
[H2 — sous-thème 1, idéalement formulé en question]
  [Paragraphe 150-200 mots]
  [Liste ou tableau si comparaison]
[H2 — sous-thème 2]
  [Paragraphe 150-200 mots]
[H2 — sous-thème 3]
  [Paragraphe 150-200 mots]
[H2 — FAQ (6 questions minimum)]
  [Accordéon accessible + JSON-LD FAQPage]
[CTA contextuel — lié au sujet de la page]
```

### 1.5 TL;DR

- Position : après le H1, avant le premier paragraphe
- Format : 3 bullet points, chacun < 20 mots
- Contient les 3 informations les plus importantes
- Jamais de reformulation de l'intro — informations complémentaires

```
En résumé :
• [Fait clé 1 — chiffre ou critère si possible]
• [Fait clé 2 — condition ou prérequis important]
• [Fait clé 3 — conseil actionnable]
```

---

## 2. Rédaction GEO (Generative Engine Optimization)

Les moteurs IA (ChatGPT, Perplexity, Gemini, Claude) extraient des réponses directes pour les afficher dans leurs résumés. L'objectif : être cité comme source fiable sur le pet food.

### 2.1 Réponse directe dès le premier paragraphe de chaque H2

Chaque section commence par la réponse, pas par le contexte.

```
❌ "La question des protéines dans l'alimentation du chien est complexe et dépend de nombreux facteurs..."
✅ "Un chien adulte a besoin d'un minimum de 18 % de protéines brutes dans sa ration, selon les recommandations FEDIAF 2023."
```

### 2.2 Chiffres sourcés obligatoires

Tout chiffre ou statistique doit avoir une source explicite.

```
❌ "De nombreuses études montrent que les croquettes premium sont meilleures..."
❌ "La plupart des chiens préfèrent..."
✅ "Selon FEDIAF (2023), les besoins en protéines d'un chien adulte sont de 18 g/100 g MS minimum."
✅ "D'après l'enquête FACCO/KANTAR 2023, 50 % des foyers français possèdent un animal de compagnie."
```

Sources acceptables par ordre de crédibilité :
1. FEDIAF (normes européennes nutrition animale)
2. Publications vétérinaires peer-reviewed (JSAP, JAVMA, EJCN)
3. Organisations professionnelles (SNVEL, FACCO, CNVSPA)
4. Études sectorielles datées (GfK, Kantar, Nielsen pour le marché)

Si aucune source disponible : formuler en conditionnel ou mentionner le consensus vétérinaire.

### 2.3 Définir les termes techniques

Chaque terme technique ou acronyme est défini à sa première apparition.

```
✅ "Le BARF (Biologically Appropriate Raw Food) désigne une alimentation à base de viande crue..."
✅ "La MS (matière sèche) est la base de comparaison nutritionnelle entre aliments humides et secs..."
✅ "L'AAFCO (Association of American Feed Control Officials) fixe les standards nutritionnels minimaux..."
```

### 2.4 Format extractible pour les IA

Structurer le contenu pour qu'une IA puisse en extraire des réponses propres :

- **Listes à puces** pour les étapes, critères, avantages/inconvénients
- **Tableaux** pour les comparaisons nutritionnelles et les avis marques
- **Paragraphes courts** — 3 à 4 phrases maximum par bloc
- **Questions/réponses explicites** — le H2 pose la question, le premier paragraphe répond

```
✅ Exemple de structure extractible :
## Quelle quantité de croquettes donner à un chien de [X] kg ?
[Réponse directe en 1-2 phrases avec chiffres].
[Contexte ou nuance — âge, activité, castration].
[Conseil pratique — pesée, fractionnement des repas].
```

### 2.5 Entités nommées — signaux de crédibilité

Citer des entités reconnues dans le domaine pet food renforce la confiance des moteurs IA :
- FEDIAF, AAFCO, FACCO (organismes de référence)
- SNVEL, CNVSPA (organisations vétérinaires françaises)
- Noms de nutriments officiels (taurine, acides gras oméga-3 EPA/DHA…)
- Réglementations applicables (Règlement CE 767/2009 sur l'étiquetage)

### 2.6 Fraîcheur du contenu

- `<time datetime="YYYY-MM-DD">Mis à jour le [date lisible]</time>` sur chaque page
- Date de dernière mise à jour visible pour l'utilisateur
- Réviser les comparatifs et notes de marques tous les 12 mois minimum
- Indiquer l'année dans les titres quand la temporalité est un signal de recherche ("Comparatif croquettes 2026")

---

## 3. Hiérarchie des titres

### 3.1 Règles strictes

```
H1 — Un seul par page. Mot-clé principal.
  H2 — Sous-thèmes majeurs. Idéalement en questions.
    H3 — Sous-points d'un H2. Jamais sans H2 parent.
      H4 — Rare. Uniquement si la hiérarchie le justifie vraiment.
```

- Jamais de saut de niveau (H1 → H3 sans H2)
- Jamais de H2 utilisé pour styler du texte — sémantique uniquement
- Les H2/H3 doivent être cohérents avec le meta title (même champ lexical)

### 3.2 Formulation des H2 en questions

Les questions dans les titres captent les recherches vocales et les extraits enrichis.

```
✅ "Comment choisir des croquettes adaptées à la race de mon chien ?"
✅ "Quelle est la différence entre alimentation humide et sèche ?"
✅ "Quels ingrédients éviter dans les croquettes pour chien ?"
✅ "Pourquoi passer à une alimentation sans céréales ?"
✅ "Croquettes premium : combien ça coûte par mois ?"
❌ "Les avantages" — trop vague
❌ "Introduction" — jamais comme titre
❌ "Conclusion" — jamais comme titre H2
```

---

## 4. FAQ — Structure obligatoire

### 4.1 Règles

- Minimum 6 questions par page indexée
- Questions formulées comme une vraie recherche Google ou question vocale
- Réponse : 2-4 phrases max, directe, sans reformuler la question en début de réponse
- Couvrir le "query fan-out" : plusieurs angles de la même intention

### 4.2 Matrice des types de questions

| Type | Formulation type | Exemple |
|---|---|---|
| Définition | "Qu'est-ce que [X] ?" | "Qu'est-ce que l'alimentation BARF pour chien ?" |
| Composition | "Que contient [X] ?" | "Que contient une croquette premium sans céréales ?" |
| Comparaison | "[X] ou [Y] ?" | "Croquettes ou pâtée : quelle alimentation choisir ?" |
| Quantité | "Quelle quantité de [X] par jour ?" | "Quelle quantité de croquettes pour un Golden de 30 kg ?" |
| Fréquence | "Combien de repas par jour ?" | "Combien de repas par jour pour un chiot ?" |
| Critères | "Comment choisir [X] ?" | "Comment choisir des croquettes pour chien senior ?" |
| Risques | "Quels aliments sont dangereux pour [X] ?" | "Quels aliments sont dangereux pour un chien ?" |
| Budget | "Combien coûte [X] par mois ?" | "Combien coûte une alimentation premium par mois ?" |
| Transition | "Comment passer de [X] à [Y] ?" | "Comment passer des croquettes bas de gamme au premium ?" |
| Santé | "[X] convient-il aux chiens [condition] ?" | "Les croquettes sans céréales conviennent-elles aux chiens allergiques ?" |

### 4.3 JSON-LD FAQPage — template

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question exacte telle qu'affichée sur la page]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Réponse complète en texte brut, sans HTML. 2-4 phrases.]"
      }
    },
    {
      "@type": "Question",
      "name": "[Question 2]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Réponse 2]"
      }
    }
  ]
}
```

Règles d'injection :
- Côté serveur uniquement — jamais via `useEffect`
- Dans le wrapper `<>` avant `<main>`
- Le champ `name` = texte exact du H3 de la FAQ sur la page
- Le champ `text` = texte brut, sans balises HTML

---

## 5. Maillage interne

### 5.1 Volume de liens par page

| Type de page | Liens internes minimum |
|---|---|
| Article blog | 3–5 liens contextuels + 1 CTA |
| Page cluster | 4–6 liens (catégories connexes + fiches marques) |
| Page pilier | 6–10 liens vers pages enfants |
| Fiche marque/produit | 2–3 liens contextuels |

### 5.2 Qualité des ancres

```
❌ "cliquez ici" · "en savoir plus" · "ce lien" · "ici" · "page"
✅ Ancre descriptive = [mot-clé de la page de destination]
✅ "croquettes sans céréales pour chien adulte"
✅ "comparatif alimentation BARF pour chiot"
✅ "guide nutrition chien senior"
```

### 5.3 Logique de maillage

- Chaque page enfant remonte vers sa page parent (breadcrumb + lien contextuel)
- Les pages de même niveau se lient entre elles quand le sujet est connexe
- Jamais de lien vers une page `noindex` ou `visible: false`
- Prioriser les liens en haut de page (plus de poids SEO)

### 5.4 CTA contextuel en fin de contenu

Chaque page se termine par un CTA lié au sujet traité — jamais générique.

```
✅ "Comparer les croquettes sans céréales pour chien adulte →"
✅ "Voir toutes les marques premium pour chiot →"
✅ "Trouver la meilleure alimentation pour chien senior →"
❌ "Retour à l'accueil"
❌ "En savoir plus"
```

---

## 6. Contenu des pages cluster

### 6.1 Règle anti-duplication absolue

Deux pages cluster sur des sujets proches ne peuvent pas avoir le même paragraphe d'introduction. Chaque page doit avoir un **angle éditorial unique**.

| Page | Angle |
|---|---|
| /croquettes/sans-cereales/ | Définition, pourquoi éviter les céréales, ingrédients alternatifs |
| /croquettes/grain-free/ | Distinction grain-free vs sans céréales, marques concernées, controverses |
| /alimentation/barf/ | Définition BARF, ration type, avantages/risques, transition |
| /alimentation/pate/ | Teneur en eau, complémentarité avec les croquettes, cas d'usage |
| /race/golden-retriever/ | Besoins spécifiques à la race, prédispositions santé, marques adaptées |
| /race/bulldog-francais/ | Spécificités morphologiques, sensibilités digestives, format croquettes adapté |
| /profil/chiot/ | Besoins croissance, fréquence repas, transition sevrage |
| /profil/senior/ | Besoins réduits en calories, articulations, protéines digestibles |

### 6.2 Template introduction par profil (race, âge, condition)

```
Les [race/profil] ont des besoins nutritionnels spécifiques liés à [caractéristique].
Une alimentation adaptée doit apporter [nutriments clés], en évitant [points de vigilance].
[N] références premium référencées sur Toutou Gourmet répondent à ces critères.
```

### 6.3 Template introduction par type d'alimentation

```
L'alimentation [type] désigne [définition courte].
Elle convient particulièrement aux chiens [profil cible] et se distingue par [caractéristique principale].
[Avantage principal]. [Point de vigilance ou condition d'usage].
```

---

## 7. Checklist avant publication

### Technique

- [ ] Meta title unique, ≤ 60 chars, mot-clé en tête
- [ ] Meta description unique, ≤ 155 chars
- [ ] H1 unique, ≤ 70 chars, contient le mot-clé
- [ ] Structure H1 > H2 > H3 sans saut de niveau
- [ ] `<time datetime="YYYY-MM-DD">` présent
- [ ] JSON-LD valide (FAQPage + type de page approprié)
- [ ] URL canonique renseignée
- [ ] Images : alt descriptif, width + height, format WebP
- [ ] Contenu textuel rendu côté serveur (vérifié via curl)

### Contenu

- [ ] Réponse directe dans les 2 premières phrases
- [ ] TL;DR présent si > 600 mots
- [ ] Tous les chiffres ont une source (FEDIAF, FACCO, études vétérinaires)
- [ ] Termes techniques définis à leur première apparition (BARF, MS, AAFCO…)
- [ ] FAQ : 6 questions minimum, types variés (cf. §4.2)
- [ ] Zéro duplication avec une autre page du site
- [ ] Maillage interne : liens contextuels + CTA final
- [ ] Ancres de liens descriptives (zéro "cliquez ici")
- [ ] `prefers-reduced-motion` respecté sur animations éventuelles

### GEO

- [ ] Structure question/réponse sur les H2 principaux
- [ ] Entités nommées citées (FEDIAF, FACCO, SNVEL, CNVSPA…)
- [ ] Paragraphes courts (≤ 4 phrases)
- [ ] Listes et tableaux pour les données nutritionnelles et comparatifs
- [ ] Date de mise à jour visible

---

## 8. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est problématique | Correction |
|---|---|---|
| Intro narrative ("Dans cet article, nous allons...") | Google et les IA veulent la réponse, pas l'annonce | Commencer par la réponse directe |
| Keyword stuffing | Pénalité Google, lecture dégradée | 1 occurrence du mot-clé exact dans H1, 2-3 dans le corps |
| Contenu dupliqué entre pages | Cannibalisation SEO | Angle unique par page, cf. §6.1 |
| FAQ générique | Pas de valeur ajoutée, pas de Featured Snippet | Questions tirées des vraies recherches (Google Autocomplete, People Also Ask) |
| Images sans alt | Accessibilité + SEO images | Alt descriptif : "[race] mangeant [type aliment] — [contexte]" |
| Liens avec ancre "ici" | Signal SEO nul | Ancre = mot-clé de la destination |
| Chiffres sans source | Crédibilité GEO nulle | Source FEDIAF, FACCO ou étude vétérinaire entre parenthèses |
| Tout le contenu en JS | Non indexable par Google, non extractible par les IA | Rendu serveur obligatoire pour tout contenu textuel |
| Meta title identique sur plusieurs pages | Google choisit lui-même — souvent mal | Title unique par page, toujours |
| H2 utilisés comme mise en forme | Confusion hiérarchique | H2 = structure sémantique uniquement |
| Affirmations santé sans nuance | Risque médico-légal + perte de crédibilité | Toujours recommander un avis vétérinaire pour les cas spécifiques |

---

*Guide SEO & GEO — Toutou Gourmet · Comparateur pet food premium FR · /docs/09-seo-geo-guide.md*
