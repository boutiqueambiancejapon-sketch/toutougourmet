# Style des couvertures — 10minlanguages.com

Observé sur 6 couvertures existantes (`public/images/blog-*.webp`, 1376 × 768, 16:9) et `STYLE_SUFFIX` de `data/images.ts`.

- **Type** : photographie lifestyle réaliste, éditoriale, naturelle.
- **Sujet** : un adulte (parfois un enfant) qui apprend une langue chez lui : appel vidéo sur ordinateur portable ou téléphone, carnet ouvert, tasse, casque. Personnes générées, souriantes, jamais une célébrité.
- **Décor** : intérieur clair et chaleureux : table en bois, canapé, plantes vertes, étagères de livres, coussins colorés.
- **Palette** : fond crème `#F7F4EE`, accents jaune beurre `#F3D36B`, rouge corail `#E8553A`, pervenche `#C3CCF5`, vert sauge `#BFDCC6`.
- **Lumière** : lumière naturelle du jour venant d'une fenêtre, douce et chaude.
- **Cadrage** : plan moyen, personne de trois quarts à droite ou au centre, écran visible de biais, faible profondeur de champ.
- **Interdits** : texte, logo, capture d'interface lisible, personne réelle reconnaissable.

Fichier produit : `public/images/<slot>.webp`, 1376 × 768, WebP < 200 Ko. Champ : `image` (slot de `data/images.ts`, passé de `ready: false` à `ready: true`).

## Style commun

```text
Editorial lifestyle photography for an English-language website about learning languages with online tutors. Warm natural daylight from a window, soft cream background (#F7F4EE), bright cosy home interior with a wooden table, green plants, books and cushions, subtle accents of butter yellow (#F3D36B), coral red (#E8553A), periwinkle (#C3CCF5) and sage mint (#BFDCC6). Candid and friendly, generated anonymous people (never a real or famous person), shallow depth of field, full-bleed composition, medium shot. Screens seen at an angle with no readable interface, no text, no logos, no UI screenshots.
```
