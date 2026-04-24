# Gemini Image System Prompt — Toutou Gourmet

> Prompt système unique, figé, utilisé pour **toutes** les images du site.
> Modèle cible : **Gemini 2.5 Flash Image** (Nano Banana) via Google AI API.
> Toute modification ici impacte la cohérence de marque → PR dédiée + regénération batch.

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

---

## 4. Prompt système (à préfixer à chaque requête)

```
You are generating an image for "Toutou Gourmet", a French premium dog food
comparison website. Style guide:

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
These elements MUST be drawn (not photographed) with visible contour lines.

NEGATIVE / AVOID:
- No text, no typography, no watermark, no logo
- No brand packaging imitation (no visible food bags or branded products)
- No dark moody lighting, no dramatic shadows, no night scenes
- No AI-typical deformed anatomy (check eyes, paws, mouth)
- No cluttered backgrounds — keep it clean, airy, 40%+ negative space
- No surreal or psychedelic effects
- No humans in frame (dogs only, unless explicitly requested)
- No aggressive or stressed dog expressions — always calm, happy, curious

COMPOSITION:
- Subject centered or rule-of-thirds
- Shallow depth of field on the photo layer (dog/food crisp, background soft cream)
- Decorative elements placed with intention (hat aligned with head, bowl at dog's muzzle level, confetti scattered at edges)
- 40%+ of the frame is soft cream negative space to allow UI overlays

OUTPUT: {ratio} aspect ratio. High resolution, print-quality.
```

---

## 5. Règles de déclinaison par type de slot

### 5.1 Hero (home / blog hub / article)

- **Sujet** : scène large, chien + accessoire (gamelle / os), plan moyen
- **Éléments déco** : 2-3 (ex. confetti + chapeau OU gamelle + étoile + confetti)
- **Ratio** : 16:9 (1920×1080 export, 1600w webp)
- **Negative space** : zone crème dégagée en bas ET à gauche (pour H1 overlay)

### 5.2 Carte marque (4 slots)

- **Sujet** : scène évocatrice de la catégorie sans imiter les packshots de la marque (croquettes servies, gamelle de repas frais, bol avec ingrédients)
- **Éléments déco** : 1-2 (étoile OU confetti discret)
- **Ratio** : 4:3 (1200×900)
- **Ton global** : aligné avec la couleur pill de la marque (Franklin=ambre, Elmut=vert, Petty Well=bleu, Dog Chef=rose)

### 5.3 Carte race (6 slots)

- **Sujet** : portrait chien de la race, plan buste ou tête-épaules, expression calme
- **Éléments déco** : 1 seul — souvent **chapeau de fête** sur la tête (signature forte) OU empreinte de patte flottante
- **Ratio** : 1:1 (1000×1000)
- **Ton** : dérivé du fond, accent couleur race (amber/rose/blue/green)

### 5.4 Cover article (par catégorie + pilotes)

- **Sujet** : illustration conceptuelle liée au sujet (ex. santé = bol + comprimés dessinés ; comportement = chien avec bulles de pensée ; nutrition = ingrédients)
- **Éléments déco** : 2-3, ton aligné avec la catégorie
- **Ratio** : 3:2 (1500×1000)
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
