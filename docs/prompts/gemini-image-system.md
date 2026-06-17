# Gemini Image System Prompt — Toutou Gourmet

> Prompt système unique, figé, utilisé pour **toutes** les images du site.
> Modèle cible : **Gemini 2.5 Flash Image** (Nano Banana) via Google AI API.
> Toute modification ici impacte la cohérence de marque → PR dédiée + regénération batch.

---

## 0. RÈGLE DE CADRAGE — PLEIN-CADRE OBLIGATOIRE (priorité absolue)

L'image est affichée en `object-cover` dans des conteneurs de ratios variés
(16:9 en hero d'article, ~1:1 à paysage dans les cards, 4:3 en body). Le texte
du site est **toujours posé à côté de l'image, jamais dessus**. Il ne faut donc
**JAMAIS** réserver de bandeau, colonne ou marge de couleur unie « pour le texte ».

- La scène photographique remplit **tout le cadre, bord à bord** (full-bleed).
- Le sujet (chien / aliment / gamelle) et son décor touchent les quatre bords.
- **Aucune bande crème plate**, aucune colonne vide, aucun cadre/passe-partout.
- Le sujet principal est posé de façon à rester lisible quel que soit le recadrage
  (centre élargi qui survit à un crop 16:9, 4:3 ou carré).
- L'« espace négatif » autorisé = arrière-plan **photographique** doux (bokeh crème
  de la scène réelle), pas un aplat de couleur réservé.

Cette règle prime sur toute mention contraire plus bas dans ce document.

---

## 1. Intention visuelle

Style **"photo réaliste + illustration peinte par-dessus"**.
Références : Oatly, Liquid Death, Partake Foods, Dropout, Magic Spoon.

- **Base** : photo studio/lifestyle, lumière naturelle chaude, grain léger, palette crème.
- **Couche décorative** : éléments dessinés à la main (feutre/gouache numérique), cernés, aplat, légèrement texturés — posés par-dessus la photo comme si un illustrateur avait griffonné dessus.
- **Vibe** : éditorial fun, chaleureux, premium sans être coincé. Jamais corporate, jamais IA pure, jamais réaliste-sec.

---

## 2. Palette de marque (à respecter strictement)

| Usage | Hex | Nom sémantique |
|---|---|---|
| Fond dominant | `#FAFAF8` | crème clair |
| Fond secondaire | `#F5F0EA` | crème chaud |
| Rose signature | `#FFD6E3` | pill rose |
| Bleu signature | `#C8DCFF` | pill bleu |
| Ambre signature | `#FFE8B5` | pill ambre |
| Vert signature | `#C2F0D5` | pill vert |
| Orange accent (rare) | `#E8622A` | CTA (usage ponctuel) |
| Texte / trait illustré | `#1A1109` | brun très foncé |

Les **éléments dessinés** utilisent **rose + bleu + ambre + vert** (pill colors) + traits `#1A1109`.
L'orange `#E8622A` est rare et réservé aux petits détails (virgule, étoile, souligné).

---

## 3. Éléments décoratifs signature (la "famille")

Une image contient **1 à 3** éléments parmi cette liste (jamais plus, jamais moins) :

1. **Confetti géométrique** — petits triangles + cercles + traits courts, éparpillés, tons rose/bleu/ambre
2. **Chapeau de fête** (cone hat) — posé sur la tête du chien, couleur pill (rose, bleu ou ambre), pompon blanc cassé, aplat
3. **Gamelle dessinée** — ronde vue de profil ou 3/4, trait noir marqué, remplie de croquettes/repas stylisés, couleur pill
4. **Os stylisé** — forme classique, aplat ambre ou crème, contour noir
5. **Étoile scintillante / sparkle** — 4 branches fines, orange ou ambre, petit glow
6. **Empreinte de patte** — trait contour noir, remplissage pill, taille moyenne

Règle : les éléments sont **dessinés**, pas photographiques. Contour visible. Aplat ou léger dégradé.
Les décorations sont posées **sur la photo** (au-dessus du sujet ou de la scène), jamais dans une marge vide.

---

## 4. Prompt système (à préfixer à chaque requête)

```
You are generating an image for "Toutou Gourmet", a French premium dog food
comparison website. Style guide:

FRAMING (HIGHEST PRIORITY): Full-bleed. The photographic scene fills the ENTIRE
frame edge-to-edge. The subject and its setting reach all four edges. NEVER
reserve a flat-colour band, column, margin, border or empty cream block for
text — the website places all text OUTSIDE the image, never on top of it.
Compose the subject so it stays well-framed after a centre crop to 16:9, 4:3
or square.

STYLE: Mixed media. Start from a photorealistic base (lifestyle/editorial
photography, natural warm daylight, soft film grain, 85mm look) then OVERLAY
hand-drawn illustrated decorative elements directly on top of the photo — as
if a designer painted over the photograph with digital gouache. Contour lines
on decorative elements should be clean black (#1A1109). Decorative fills are
flat or lightly textured.

COLOR PALETTE (strict):
- Background: cream #FAFAF8 / warm cream #F5F0EA dominant
- Decorative fills pick from: rose #FFD6E3, blue #C8DCFF, amber #FFE8B5, green #C2F0D5
- Orange #E8622A used sparingly for small accents only (sparkle, underline)
- Contour lines: dark brown #1A1109

DECORATIVE SIGNATURE (pick 1 to 3 per image, no more, no less):
party cone hat on the dog's head, illustrated food bowl, stylized bone,
4-point sparkle star, paw print, geometric confetti (small triangles+circles).
These elements MUST be drawn (not photographed) with visible contour lines,
placed ON the photographic scene — never inside an empty margin.

NEGATIVE / AVOID:
- No text, no typography, no watermark, no logo
- No brand packaging imitation (no visible food bags or branded products)
- No dark moody lighting, no dramatic shadows, no night scenes
- No AI-typical deformed anatomy (check eyes, paws, mouth)
- No empty flat-colour band, column, border, frame or reserved text zone
- No letterboxing / pillarboxing / vignette frame around the photo
- No surreal or psychedelic effects
- No humans in frame (dogs only, unless explicitly requested)
- No aggressive or stressed dog expressions — always calm, happy, curious

COMPOSITION:
- Subject centered or rule-of-thirds, filling the frame edge-to-edge
- Shallow depth of field on the photo layer (dog/food crisp, background soft cream)
- Decorative elements placed with intention (hat aligned with head, bowl at dog's muzzle level, confetti scattered over the scene)
- The soft cream background is PHOTOGRAPHIC depth-of-field bokeh from the real
  scene, spread across the whole frame — NOT a reserved flat zone for UI text

OUTPUT: {ratio} aspect ratio. High resolution, print-quality.
```

---

## 5. Règles de déclinaison par type de slot

### 5.1 Hero (home / blog hub / article)

- **Sujet** : scène large, chien + accessoire (gamelle / os), plan moyen, qui **remplit le cadre**
- **Éléments déco** : 2-3 (ex. confetti + chapeau OU gamelle + étoile + confetti)
- **Ratio** : 16:9 (1920×1080 export, 1600w webp)
- **Cadrage** : full-bleed, sujet décalé selon la règle des tiers mais la scène
  photographique couvre tout le cadre — pas de bandeau crème vide réservé à un H1

### 5.2 Carte marque (4 slots)

- **Sujet** : scène évocatrice de la catégorie sans imiter les packshots de la marque (croquettes servies, gamelle de repas frais, bol avec ingrédients)
- **Éléments déco** : 1-2 (étoile OU confetti discret)
- **Ratio** : 4:3 (1200×900)
- **Ton global** : aligné avec la couleur pill de la marque (Franklin=ambre, Elmut=vert, Petty Well=bleu, Dog Chef=rose)

### 5.3 Carte race (6 slots)

- **Sujet** : portrait chien de la race, plan buste ou tête-épaules, expression calme, **qui remplit le cadre**
- **Éléments déco** : 1 seul — souvent **chapeau de fête** sur la tête (signature forte) OU empreinte de patte flottante
- **Ratio** : 1:1 (1000×1000)
- **Ton** : dérivé du fond, accent couleur race (amber/rose/blue/green)
- **Cadrage** : le chien et le fond studio crème occupent tout le cadre bord à bord ; pas de colonne vide réservée au texte

### 5.4 Cover article (par catégorie + pilotes)

- **Sujet** : illustration conceptuelle liée au sujet (ex. santé = bol + comprimés dessinés ; comportement = chien avec bulles de pensée ; nutrition = ingrédients)
- **Éléments déco** : 2-3, ton aligné avec la catégorie
- **Ratio** : 3:2 (1500×1000)
- **Cadrage** : full-bleed, scène bord à bord
- **Ton** :
  - Nutrition → ambre `#FFE8B5`
  - Santé → vert `#C2F0D5`
  - Alimentation → rose `#FFD6E3`
  - Comportement → bleu `#C8DCFF`
  - Enquêtes → ambre + trait orange accent
  - Urgences → rose + étoile orange (alerte douce)
  - Avis marques → bleu
  - Par race → ambre

### 5.5 OG / social share

- **Sujet** : logo-like composition, chien + confetti + typographie évitée (on superpose le titre en post-prod si besoin)
- **Ratio** : 1.91:1 (1200×630)
- **Éléments déco** : 3 maximum

---

## 6. Structure d'appel (pseudocode)

```ts
const FULL_PROMPT = `
${SYSTEM_PROMPT}

SLOT: ${slot.id}
SUBJECT: ${slot.subject}
COMPOSITION NOTES: ${slot.composition}
DECORATIVE ELEMENTS (strict): ${slot.decorations.join(', ')}
TONE ACCENT: ${slot.tone}
RATIO: ${slot.ratio}
`
```

Appel via `@google/generative-ai` → `gemini-2.5-flash-image-preview` avec `responseModalities: ['IMAGE']`.

> ⚠️ Les `composition` notes par slot dans `data/images-manifest.ts` ne doivent
> plus contenir d'instruction de « negative space / text zone / reserved margin ».
> La règle §0 (full-bleed) prime sur toute note de slot contraire.

---

## 7. Règles de sortie

- Format : **WebP**, qualité 85
- 2 tailles par slot : `{slug}.webp` (1600w) + `{slug}@800.webp` (800w)
- Nommage : `/public/images/{group}/{slug}.webp` (kebab-case)
- Poids cible : < 200 Ko pour la version 1600w (PSI friendly)
- Post-process : `sharp` si le poids dépasse, sinon passthrough

---

## 8. Processus d'itération

1. Génère **3 variantes** par slot (seed différent) lors du premier run
2. Revue humaine → on choisit 1 variante par slot
3. Si aucune variante ne passe : ajuster `composition` / `decorations` du slot, **jamais** le prompt système (sinon cohérence perdue)
4. Le prompt système évolue uniquement par PR dédiée avec regénération **complète**
