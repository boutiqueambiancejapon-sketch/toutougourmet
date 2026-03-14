# Guide SEO & GEO — Rédaction de contenu web
> Guide générique applicable à tout projet web.
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
[Mot-clé principal] — [Bénéfice ou contexte] | [Nom du site]
```

Règles :
- Max 60 caractères
- Mot-clé principal en tête — jamais au milieu ou à la fin
- Jamais de majuscules inutiles (sentence case)
- Chaque page a un title unique — zéro duplication

```
✅ "Kiné à domicile après AVC : ce qu'il faut savoir | MonSite"
✅ "Rééducation genou à domicile après PTG | MonSite"
❌ "Tout savoir sur la kinésithérapie à domicile pour les patients post-AVC"
❌ "MonSite — Kinésithérapeutes à domicile — AVC"
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
✅ "La rééducation à domicile après prothèse de genou dure 6 à 12 semaines. Trouvez un professionnel agréé qui se déplace chez vous."
❌ "Dans cet article, nous allons vous expliquer tout ce qu'il faut savoir sur la rééducation à domicile."
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
• [Fait clé 1 — chiffre ou durée si possible]
• [Fait clé 2 — condition ou prérequis important]
• [Fait clé 3 — conseil actionnable]
```

---

## 2. Rédaction GEO (Generative Engine Optimization)

Les moteurs IA (ChatGPT, Perplexity, Gemini, Claude) extraient des réponses directes pour les afficher dans leurs résumés. L'objectif : être cité comme source fiable.

### 2.1 Réponse directe dès le premier paragraphe de chaque H2

Chaque section commence par la réponse, pas par le contexte.

```
❌ "La question de la durée de rééducation est complexe et dépend de nombreux facteurs..."
✅ "La rééducation après prothèse de hanche dure en moyenne 3 à 6 mois, à raison de 3 séances par semaine en phase intensive."
```

### 2.2 Chiffres sourcés obligatoires

Tout chiffre ou statistique doit avoir une source explicite.

```
❌ "De nombreuses études montrent que..."
❌ "La majorité des patients récupèrent..."
✅ "Selon [Source] ([Année]), [X]% des patients..."
✅ "D'après [Organisation officielle], la durée moyenne est de [X]..."
```

Sources acceptables par ordre de crédibilité :
1. Organismes officiels (gouvernement, agences nationales)
2. Publications peer-reviewed (PubMed, Cochrane)
3. Organisations professionnelles reconnues
4. Études sectorielles datées

Si aucune source disponible : formuler en conditionnel ou mentionner le consensus clinique/professionnel.

### 2.3 Définir les termes techniques

Chaque terme technique ou acronyme est défini à sa première apparition.

```
✅ "La PTH (prothèse totale de hanche) est posée en cas d'arthrose sévère..."
✅ "Le SEO (Search Engine Optimization, référencement naturel) désigne..."
✅ "L'INR (International Normalized Ratio) mesure la coagulation sanguine..."
```

### 2.4 Format extractible pour les IA

Structurer le contenu pour qu'une IA puisse en extraire des réponses propres :

- **Listes à puces** pour les étapes, critères, avantages/inconvénients
- **Tableaux** pour les comparaisons et données chiffrées
- **Paragraphes courts** — 3 à 4 phrases maximum par bloc
- **Questions/réponses explicites** — le H2 pose la question, le premier paragraphe répond

```
✅ Exemple de structure extractible :
## Combien de temps dure une [action] ?
[Réponse directe en 1-2 phrases avec chiffres].
[Contexte ou nuance en 1-2 phrases].
[Condition ou exception importante].
```

### 2.5 Entités nommées — signaux de crédibilité

Citer des entités reconnues dans le domaine renforce la confiance des moteurs IA :
- Noms d'organisations officielles
- Noms de standards ou nomenclatures reconnues
- Références légales ou réglementaires applicables
- Auteurs ou experts cités (avec leur titre)

### 2.6 Fraîcheur du contenu

- `<time datetime="YYYY-MM-DD">Mis à jour le [date lisible]</time>` sur chaque page
- Date de dernière mise à jour visible pour l'utilisateur
- Réviser le contenu factuel tous les 12 mois minimum
- Indiquer l'année dans les titres quand la temporalité est un signal de recherche ("Guide 2026")

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
✅ "Comment choisir un [professionnel] pour [besoin] ?"
✅ "Quelle est la durée de [traitement/processus] ?"
✅ "Quels sont les critères pour [décision] ?"
✅ "Pourquoi faire appel à un [professionnel/service] ?"
✅ "[Action] : combien ça coûte ?"
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
| Définition | "Qu'est-ce que [X] ?" | "Qu'est-ce que la kinésithérapie vestibulaire ?" |
| Processus | "Comment [faire X] ?" | "Comment se déroule une séance à domicile ?" |
| Durée | "Combien de temps [X] ?" | "Combien de séances après une PTH ?" |
| Coût | "Combien coûte [X] ?" | "Quel est le tarif d'un kiné conventionné ?" |
| Remboursement | "[X] est-il remboursé ?" | "La kiné à domicile est-elle remboursée ?" |
| Critères | "Comment choisir [X] ?" | "Comment choisir un kiné à domicile ?" |
| Comparaison | "[X] ou [Y] ?" | "Kiné à domicile ou en cabinet : quelle différence ?" |
| Prérequis | "Faut-il [condition] pour [X] ?" | "Faut-il une prescription pour un kiné à domicile ?" |
| Fréquence | "À quelle fréquence [X] ?" | "À quelle fréquence faire ses séances ?" |
| Risques | "Quels sont les risques de [X] ?" | "Quels sont les risques d'une mauvaise rééducation ?" |

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
| Page cluster | 4–6 liens (hubs connexes + profils/fiches) |
| Page pilier | 6–10 liens vers pages enfants |
| Page produit/fiche | 2–3 liens contextuels |

### 5.2 Qualité des ancres

```
❌ "cliquez ici" · "en savoir plus" · "ce lien" · "ici" · "page"
✅ Ancre descriptive = [mot-clé de la page de destination]
✅ "kinésithérapeute neurologique à Liège"
✅ "guide complet de la rééducation après PTH"
✅ "comparatif des logiciels de gestion kiné"
```

### 5.3 Logique de maillage

- Chaque page enfant remonte vers sa page parent (breadcrumb + lien contextuel)
- Les pages de même niveau se lient entre elles quand le sujet est connexe
- Jamais de lien vers une page `noindex` ou `visible: false`
- Prioriser les liens en haut de page (plus de poids SEO)

### 5.4 CTA contextuel en fin de contenu

Chaque page se termine par un CTA lié au sujet traité — jamais générique.

```
✅ "Trouver un kiné spécialisé après AVC près de chez vous →"
✅ "Voir tous les kinésithérapeutes à Liège →"
❌ "Retour à l'accueil"
❌ "En savoir plus"
```

---

## 6. Contenu des pages cluster

### 6.1 Règle anti-duplication absolue

Deux pages cluster sur des sujets proches ne peuvent pas avoir le même paragraphe d'introduction. Chaque page doit avoir un **angle éditorial unique**.

| Page | Angle |
|---|---|
| /ville/paris/ | Contexte local, quartiers, spécificités urbaines |
| /ville/lyon/ | Contexte local différent, caractéristiques propres |
| /specialite/neurologique/ | Définition, pathologies traitées, ce que fait le professionnel |
| /specialite/orthopedique/ | Angle différent — post-op, rééducation motrice |
| /pathologie/apres-avc/ | Parcours patient, étapes, ce qu'on attend du professionnel |
| /pathologie/parkinson/ | Spécificités de la pathologie, approche thérapeutique |

### 6.2 Template introduction géo

```
[Ville/Zone] compte [N] [professionnels] référencés sur [Site],
couvrant [zones principales]. [Phrase sur le contexte local ou la demande].
[Phrase sur le service : intervention à domicile, agréé, remboursé, etc.].
```

Variables à injecter dynamiquement : label · code postal · count · communes principales.

### 6.3 Template introduction thématique (spécialité / pathologie / service)

```
La [spécialité/pathologie/service] concerne [public cible].
[Professionnel] intervient pour [objectif principal], sur prescription de [prescripteur].
[Phrase sur le remboursement ou la prise en charge si applicable].
[N] professionnels référencés sur [Site] proposent cette prise en charge.
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
- [ ] Tous les chiffres ont une source
- [ ] Termes techniques définis à leur première apparition
- [ ] FAQ : 6 questions minimum, types variés (cf. §4.2)
- [ ] Zéro duplication avec une autre page du site
- [ ] Maillage interne : liens contextuels + CTA final
- [ ] Ancres de liens descriptives (zéro "cliquez ici")
- [ ] `prefers-reduced-motion` respecté sur animations éventuelles

### GEO

- [ ] Structure question/réponse sur les H2 principaux
- [ ] Entités nommées citées (organisations, standards)
- [ ] Paragraphes courts (≤ 4 phrases)
- [ ] Listes et tableaux pour les données comparatives
- [ ] Date de mise à jour visible

---

## 8. Erreurs fréquentes à éviter

| Erreur | Pourquoi c'est problématique | Correction |
|---|---|---|
| Intro narrative ("Dans cet article, nous allons...") | Google et les IA veulent la réponse, pas l'annonce | Commencer par la réponse directe |
| Keyword stuffing | Pénalité Google, lecture dégradée | 1 occurrence du mot-clé exact dans H1, 2-3 dans le corps |
| Contenu dupliqué entre pages | Cannibalisation SEO | Angle unique par page, cf. §6.1 |
| FAQ générique | Pas de valeur ajoutée, pas de Featured Snippet | Questions tirées des vraies recherches (Google Autocomplete, People Also Ask) |
| Images sans alt | Accessibilité + SEO images | Alt descriptif : "[sujet de l'image] — [contexte]" |
| Liens avec ancre "ici" | Signal SEO nul | Ancre = mot-clé de la destination |
| Chiffres sans source | Crédibilité GEO nulle | Source entre parenthèses ou note de bas de page |
| Tout le contenu en JS | Non indexable par Google, non extractible par les IA | Rendu serveur obligatoire pour tout contenu textuel |
| Meta title identique sur plusieurs pages | Google choisit lui-même — souvent mal | Title unique par page, toujours |
| H2 utilisés comme mise en forme | Confusion hiérarchique | H2 = structure sémantique uniquement |

---

*Guide SEO & GEO — Version générique · Applicable à tout projet web · À placer dans /docs/ de chaque projet*
