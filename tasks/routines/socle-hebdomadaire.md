# Routine — Socle applicatif NL, une zone par semaine

> Prompt d'une tâche planifiée. Chaque déclenchement ouvre une **session neuve**.
>
> Cadence : chaque dimanche à 07:00 (Europe/Bruxelles) — cron UTC `0 5 * * 0`
> Session neuve à chaque tir · notification push activée

---

Traduction hebdomadaire du socle applicatif FR → NL-BE, site Toutou Gourmet.

Repo : `boutiqueambiancejapon-sketch/toutougourmet`
Branche de travail : `claude/toutou-gourmet-setup-3mRbP` — branche par défaut du repo,
déployée en production par Vercel. Il n'existe pas de branche `main`. Push direct autorisé
par le propriétaire du site.

## Objectif du run

Avancer d'**une seule** zone de la phase A, dans l'ordre de `tasks/todo.md`, section
« Phase A — socle applicatif ». Cocher la zone traitée dans ce fichier à la fin du run.

## Méthode pour une zone

- Extraire les chaînes françaises des composants concernés vers `lib/i18n/dictionary.ts`,
  **avec le français en valeur par défaut** : le rendu des pages FR existantes doit rester
  strictement identique.
- Ajouter les entrées néerlandaises correspondantes.
- Créer la route `/nl/…` correspondante.
- Ne jamais dupliquer la logique métier : un seul composant, une prop `locale`. Un
  calculateur, un quiz ou un comparateur en double finirait par diverger.
- Charger `.claude/skills/boileau-nl/SKILL.md` avant d'écrire du néerlandais.

## Deux décisions à NE PAS trancher seul

- **Zone 7 (marques)** : les avis clients de `data/brands.ts` sont des témoignages réels.
  Ne pas les traduire sans instruction explicite du propriétaire. Les laisser en français
  avec `lang="fr"` sur le bloc, et signaler la question dans le compte rendu du run.
- **Zone 8 (légal)** : mentions légales et politique de confidentialité ont une portée
  juridique. Ne pas les traduire. Créer les routes NL qui renvoient vers les versions
  françaises, et signaler la question.

## Vérifications avant push

Les trois doivent passer :

- `npx tsc --noEmit`
- `npx next build`
- `npx eslint app components lib` — ne pas introduire de nouvelle erreur. 9 erreurs
  antérieures existent (`app/(fr)/a-propos/page.tsx`,
  `app/(fr)/chien/marque/[slug]/page.tsx`, `components/blog/StickyCta.tsx`) : les laisser.

Vérifier aussi qu'une page FR de la zone touchée rend toujours la même chose qu'avant
(`npx next start` + `curl`), puisque ces composants sont partagés avec 327 pages en ligne.

## Fin de run

Mettre à jour `PROGRESS.md` et `tasks/todo.md`, commit en Conventional Commits anglais,
push sur `claude/toutou-gourmet-setup-3mRbP`.

## Interdits

- force-push, rebase, amend sur cette branche
- toucher à une autre branche
- pousser si une vérification échoue — signaler et s'arrêter
- traiter plus d'une zone dans le même run
