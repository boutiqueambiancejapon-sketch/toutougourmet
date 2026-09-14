---
name: boileau-nl
version: 0.1.0
description: Règles de rédaction néerlandaise de Belgique (nl-BE) pour le miroir NL de Toutou Gourmet. À CHARGER AVANT DE TRADUIRE OU D'ÉCRIRE — pas après. Se déclenche dès qu'une tâche produit du texte néerlandais destiné au site : traduction d'un article MDX FR vers content/nl/blog/, page NL, FAQ NL, méta-description NL, copy NL, scheduled task de traduction quotidienne. Couvre la localisation belge (FAVV, Antigifcentrum, prix, marques disponibles en BE), le lexique NL-BE vs NL-NL, la typographie néerlandaise et les tics d'IA en néerlandais. Complète le skill `boileau` (FR) sans le remplacer.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - WebSearch
  - AskUserQuestion
---

# Boileau NL : rédiger en néerlandais de Belgique pour Toutou Gourmet

Tu écris pour un baasje belge néerlandophone. Il vit en Flandre ou à Bruxelles, il achète chez Maxi Zoo ou Tom&Co, il va chez un `dierenarts`, et la loi qui le concerne est belge — pas française, pas néerlandaise.

**Règle d'or** : l'article FR est un **brief**, pas un texte à calquer. Tu réécris en néerlandais, tu ne transposes pas mot à mot. Une phrase française traduite littéralement se repère immédiatement.

---

## 1. Ce qu'il est interdit de traduire tel quel

Un article FR de Toutou Gourmet est écrit pour un lecteur français. Ces éléments **doivent** changer, pas être traduits :

| Dans le texte FR | Dans le texte NL-BE |
|---|---|
| CNITV, CAPAE-Ouest (centres antipoison FR) | **Antigifcentrum** — numéro belge, 24 h/24 |
| ANSES | **FAVV** (Federaal Agentschap voor de Veiligheid van de Voedselketen) |
| AFSCA | **FAVV** — `AFSCA` est l'acronyme **français** de la même agence. En néerlandais on écrit FAVV. |
| NVWA | ❌ jamais — c'est l'agence **néerlandaise**, pas belge |
| « en France », « le marché français » | « in België », « de Belgische markt » |
| Prix et disponibilité produits FR | Vérifier que la marque livre en Belgique avant de la citer |
| Numéros de téléphone français | Numéros belges, ou aucun numéro |

**Vérifie le numéro de l'Antigifcentrum sur le site officiel avant de l'écrire dans un article de la catégorie `urgences`.** Un numéro faux dans un article d'intoxication est le pire bug possible du site. Si tu ne peux pas vérifier, tu écris « bel het Antigifcentrum » sans numéro et tu renvoies vers le site officiel.

La réglementation européenne (Règlement UE 2017/893, FEDIAF, CE 767/2009) s'applique identiquement en Belgique : elle se traduit normalement, elle ne se remplace pas.

---

## 2. Ce qui doit traverser la traduction intact

Tu ne reformules jamais, tu ne réarrondis jamais :

- **Les doses** : `0,1 g/kg`, `15-20 mg/kg/j`, `2 mg/kg IV`. Virgule décimale en néerlandais aussi.
- **Les citations d'études** : auteur, année, journal, DOI/PMID. `Hart 2018, Vet Med Sci` reste `Hart 2018, Vet Med Sci`.
- **Les molécules** : `theobromine`, `xylitol`, `persine`, `6-gingerol`, `taurine`. Orthographe néerlandaise si elle existe (`theobromine`, pas `théobromine`), jamais de traduction approximative.
- **Les noms de races** : `Labrador retriever`, `Duitse herder`, `Franse bulldog`, `Berner sennenhond`. Les races ont un nom néerlandais officiel, utilise-le — mais ne traduis pas un nom que tu n'as pas vérifié.
- **Les noms de marques** : Dog Chef, Elmut, Franklin, Royal Canin. Jamais traduits, jamais fléchis.

Si un chiffre du texte FR te paraît faux, tu ne le corriges pas en silence dans la version NL : tu le signales. Les deux versions doivent rester cohérentes.

---

## 3. Lexique NL-BE — le vocabulaire qui trahit une traduction néerlandaise

Le néerlandais de Belgique et celui des Pays-Bas divergent surtout sur le lexique courant. Un lecteur flamand repère un texte « hollandais » en trois phrases.

| Écris (BE) | Pas (NL-NL) | Contexte |
|---|---|---|
| `brokken` | `brokjes` | croquettes |
| `stoelgang` | `ontlasting` | selles |
| `dierenarts` | `dierenarts` ✓ | identique, ok |
| `baasje` | `eigenaar` | maître du chien — `baasje` est plus chaud et très BE |
| `frigo` | `koelkast` | acceptable en registre familier BE |
| `croissant`, `pistolet` | — | garde les belgicismes alimentaires si le contexte s'y prête |
| `GSM` | `mobiel` | téléphone |
| `kot` | — | n'a pas sa place ici, mais illustre le registre |
| `alleszins` | `in ieder geval` | en tout cas |
| `seffens`, `direct` | `zo meteen` | tout de suite |
| `poetsen` | `schoonmaken` | nettoyer |
| `noteer` / `schrijf op` | `noteer` ✓ | identique |

Deux réflexes plus importants que la liste :

- **`u` est interdit.** Le site tutoie en français (`ton chien`, `ta gamelle`), il tutoie en néerlandais : `je hond`, `jouw hond`, `je gamel`. Jamais `uw hond`.
- **Pas de diminutif réflexe.** Le néerlandais des Pays-Bas diminue tout (`hondje`, `brokjes`, `momentje`). En BE, réserve le diminutif aux cas où il veut vraiment dire « petit ».

---

## 4. Tics d'IA en néerlandais — interdits au premier jet

L'équivalent direct de la liste #2 du skill `boileau`. Ces mots sortent d'un modèle, pas d'un rédacteur :

`cruciaal`, `essentieel`, `fundamenteel`, `onmisbaar`, `van cruciaal belang`, `van essentieel belang`, `aanzienlijk`, `significant`, `robuust`, `innovatief`, `dynamisch`, `waardevol`, `krachtig` (figuré), `rijk aan` (figuré), `duurzaam` (hors sens écologique réel), `baanbrekend`, `revolutionair`, `boeiend`, `fascinerend`.

Si tu veux dire `cruciaal`, tu donnes le fait : *« zonder dat enzym verteert de helft van de volwassen honden geen lactose meer »* — pas *« dat enzym speelt een cruciale rol »*.

**Verbes passe-partout** : `mogelijk maken`, `garanderen`, `bevorderen`, `optimaliseren`, `ondersteunen`, `bijdragen aan`, `inspelen op`, `tegemoetkomen aan`. Tu cherches le verbe concret : `verlaagt`, `verdubbelt`, `blokkeert`, `vervangt`, `versnelt`.

**Évitement de `zijn`** : n'écris pas `vormt`, `betekent een`, `fungeert als`, `blijkt te zijn`, `staat voor`. Écris `is`, `heeft`. *« Kurkuma is een ontstekingsremmer »*, pas *« Kurkuma vormt een ontstekingsremmer »*.

---

## 5. Structures rhétoriques interdites en néerlandais

- *Het is niet X, het is Y*
- *Meer dan zomaar een X*
- *Niet alleen X, maar ook Y*
- *De echte vraag is niet X, maar Y*
- *Achter de cijfers schuilt*
- *Op het eerste gezicht X, maar in werkelijkheid Y*
- *X is minder Y dan je zou denken*

Et les moules d'annonce, aussi lourds en NL qu'en FR : `Het is belangrijk om te weten dat`, `Houd er rekening mee dat`, `Vergeet niet dat`, `Zoals je misschien al weet`, `Laten we beginnen met`, `In dit artikel bespreken we`, `Kortom`, `Al met al`.

Tu attaques le contenu directement.

---

## 6. Connecteurs en pluie

N'ouvre pas chaque paragraphe par `Bovendien`, `Daarnaast`, `Verder`, `Echter`, `Toch`, `Desalniettemin`, `Dientengevolge`, `Kortom`. Comme en français : quatre fois sur cinq, retirer le connecteur ne fait rien perdre.

`Desalniettemin` et `dientengevolge` sont en plus du registre administratif — jamais sur ce site.

---

## 7. Typographie néerlandaise

C'est là que les traductions FR se trahissent le plus vite, parce que les règles françaises ne s'appliquent pas :

- **Pas d'espace avant `:`, `;`, `?`, `!`.** La règle française de l'espace insécable n'existe pas en néerlandais. `Wat mag een hond eten?` — pas `Wat mag een hond eten ?`.
- **Guillemets** : `'…'` ou `"…"` (courbes) selon la cohérence du fichier. **Jamais `« … »`.**
- **Virgule décimale** : `0,1 g/kg`, `4,8/5`. Comme en français.
- **Séparateur de milliers** : point (`7.845 avis`) ou espace fine — pas la virgule anglaise.
- **Euro** : `60 €` ou `€ 60`, cohérent dans tout le fichier. En Belgique, `60 €` passe partout.
- **Majuscules** : le néerlandais ne capitalise pas les noms de mois ni les jours (`maandag`, `september`). Les adjectifs de nationalité si (`Belgisch`, `Frans`).
- **Trait d'union des composés** : le néerlandais colle les composés (`hondenvoeding`, `voedingsadvies`, `spijsverteringsproblemen`). Ne les sépare pas à la française. En cas de doute sur un composé à trois éléments, vérifie plutôt que d'inventer.

---

## 8. Titres H2 — questions naturelles, en néerlandais

Même logique que la règle #25 de `boileau`, mais les requêtes tapées sont différentes. Le test : *« un Belge taperait-il ça dans Google ? »*

**Bons patterns** :
- *Mag mijn hond {aliment} eten?*
- *Hoeveel {aliment} mag een hond per dag?*
- *Waarom {symptôme} bij honden?*
- *Wat zit er echt in {produit}?*
- *Is {marque} geschikt voor mijn hond?*
- *{marque A} of {marque B}: wat kies je?*
- *Veelgestelde vragen over {sujet}*

**À éviter** : la traduction littérale du H2 français. *« Que peut manger un chien ? »* → le Belge tape `mag mijn hond … eten`, pas `wat kan een hond eten`. Le verbe modal change la requête.

---

## 9. Frontmatter d'un article traduit

Trois champs restent **en français**, volontairement. Ce ne sont pas des oublis :

```yaml
translationOf: "repas-frais-vs-croquettes-chien"  # slug FR source — pilote les hreflang réciproques ET la cover
categorySlug: "avis-marques"                      # slug FR canonique — l'URL NL est dérivée via data/nl-categories.json
category: "Avis & Comparatif"                     # clé de CATEGORY_TABLE — sinon fallback visuel sur cat-nutrition
```

Traduits : `title`, `description`, `tags`. Le `slug` du fichier est en néerlandais (`verse-maaltijden-vs-brokken-hond.mdx`).

`date` / `updatedAt` = date de publication **NL**, pas celle de l'article FR : c'est un contenu neuf pour ce marché.

Aucune image à déclarer : la cover se résout depuis `translationOf`.

---

## 10. Liens internes

Un article NL ne lie **jamais** vers une page FR du site — ni `/quiz`, ni `/comparateur`, ni `/chien/marque/…`. Tant que la phase 1 ne couvre que le blog :

- lien interne autorisé → `/nl`, `/nl/hond/…`
- lien FR dans le corps du texte FR → tu supprimes le lien et tu gardes l'information en clair, ou tu renvoies vers un article NL déjà traduit
- liens affiliés externes → autorisés si le marchand livre en Belgique

Le dictionnaire d'autolink (`AUTOLINK_DICTIONARY`) est FR et n'est pas appliqué côté NL : n'essaie pas de le reproduire à la main.

---

## VOIX ÉDITORIALE — identique au FR

Sobre, factuel, jamais marketing. Sources nommées (auteur, année, journal). Dosages exacts. Nuance quand elle existe. Phrases de longueurs variées. Tutoiement.

La prudence vétérinaire n'est pas du hedging : `vraag advies aan je dierenarts`, `enkel op voorschrift`, `niet bij drachtige teven` restent, toujours.

---

## CHECKLIST AVANT D'ÉCRIRE LA PREMIÈRE LIGNE

1. J'ai lu l'article FR source en entier
2. J'ai repéré ce qui est franco-français dedans (centres antipoison, agences, marché, prix)
3. J'ai en tête : `je`, jamais `u`
4. J'ai en tête : pas d'espace avant `? : ;`
5. Mes H2 sont des requêtes que taperait un Belge, pas des traductions de H2 FR

## CHECKLIST AVANT DE COMMITTER

1. Aucune mention d'organisme français survivante (grep `CNITV`, `CAPAE`, `ANSES`, `AFSCA`, `NVWA`)
2. Aucun `u`/`uw` de vouvoiement
3. Aucun espace avant `?`, `:`, `;`, `!`
4. Aucun `« »`
5. `translationOf`, `categorySlug` et `category` en FR, `title`/`description`/`tags` en NL
6. Aucun lien interne vers une page FR
7. Doses, études et noms de molécules identiques à la version FR
8. Le fichier est bien dans `content/nl/blog/`, nommé avec le slug néerlandais

---

## DISTINCTION CRITIQUE

Ce skill est **proactif**. Tu ne produis pas « une traduction puis une version localisée » : la première version est déjà localisée. Si tu te surprends à calquer une tournure française, tu réécris la phrase avant de passer à la suivante.

Une traduction relue et localisée est un contenu légitime aux yeux de Google. Une traduction automatique publiée telle quelle à raison de deux par jour tombe sous la politique « contenu traduit à grande échelle sans relecture ». La différence se joue exactement dans ce fichier.
