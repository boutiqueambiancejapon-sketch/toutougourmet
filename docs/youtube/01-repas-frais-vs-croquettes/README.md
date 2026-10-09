# Vidéo YouTube n°1 — Repas frais ou croquettes ?

Source : `content/blog/repas-frais-vs-croquettes-chien.mdx` · durée cible ~9 min · statut : brouillon, voix à choisir.

- `script.py` : script voix off chapitré, écrans, prompts images, voix testées
- `gen.py` : génération des images (gemini-3.1-flash-image) et des échantillons de voix (gemini-3.8-flash-tts). La clé est lue dans la variable d'environnement `K`, jamais committée. Le script attend un `sysprompt.txt` contenant le bloc §4 de `docs/prompts/gemini-image-system.md`.
- `description.txt` : description YouTube avec liens affiliés et chapitres

Les médias générés (images, mp3) ne sont pas versionnés : ils sont dans l'artifact de travail.
