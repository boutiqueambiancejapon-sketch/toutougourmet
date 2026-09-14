# Routine — Traduction NL, 2 articles par jour

> Prompt d'une tâche planifiée. Chaque déclenchement ouvre une **session neuve** :
> ce texte doit se suffire à lui-même, il ne peut rien supposer d'une session précédente.
>
> Cadence : tous les jours à 06:00 (Europe/Bruxelles) — cron UTC `0 4 * * *`
> Session neuve à chaque tir · notification push activée

---

Traduction quotidienne FR → NL-BE du site Toutou Gourmet (www.toutou-gourmet.com).

Repo : `boutiqueambiancejapon-sketch/toutougourmet`
Branche de travail : `claude/toutou-gourmet-setup-3mRbP` — c'est la branche par défaut du
repo et celle que Vercel déploie en production. Il n'existe pas de branche `main`. Le
propriétaire du site a explicitement autorisé le push direct sur cette branche pour ce
run : pas de PR, pas de branche intermédiaire.

## Procédure

1. `git fetch origin claude/toutou-gourmet-setup-3mRbP`, puis checkout et pull de cette branche.

2. **Garde-fou de démarrage** : vérifier que le dossier `app/(nl)` ET le fichier
   `scripts/translation-queue.mjs` existent. S'ils manquent, NE RIEN POUSSER et terminer le
   run en signalant que l'infrastructure du miroir NL n'a pas encore été mergée sur la
   branche de production.

3. Lire `docs/10-traduction-nl.md`.

4. Charger le skill `.claude/skills/boileau-nl/SKILL.md` **avant** d'écrire la moindre ligne
   de néerlandais. Ce n'est pas une relecture après coup : les règles s'appliquent au premier jet.

5. `node scripts/translation-queue.mjs --next 2` pour choisir les deux articles du jour.
   Si la commande ne renvoie plus rien, la phase contenu est terminée : le signaler, ne rien pousser.

6. Pour chacun des deux articles :
   - `node scripts/translation-queue.mjs --scaffold <slug-fr> --slug <slug-nl>` — le slug
     néerlandais se choisit sur la requête qu'un Belge taperait dans Google, pas sur la
     traduction littérale du slug français
   - réécrire entièrement le corps en néerlandais de Belgique (l'article FR est un brief,
     pas un texte à calquer)
   - traduire `title`, `description`, `tags` ; laisser `translationOf`, `categorySlug` et
     `category` en français — c'est volontaire, cover et Open Graph s'y résolvent
   - retirer la ligne `draft: true` : c'est le geste qui publie

7. Si une traduction ne peut pas être menée à son terme, **laisser `draft: true` en place**.
   L'article reste hors build, hors sitemap et hors hreflang. C'est le comportement voulu,
   pas un échec.

8. Vérifications avant push, dans cet ordre. Ne pousser que si les trois passent :
   - `node scripts/translation-queue.mjs --lint`
   - `npx tsc --noEmit`
   - `npx next build`

9. Un seul commit pour les deux articles, message en Conventional Commits anglais, puis
   `git push origin claude/toutou-gourmet-setup-3mRbP`.

## Interdits

- force-push, rebase, amend, ou toute réécriture d'historique sur cette branche
- toucher à une autre branche que `claude/toutou-gourmet-setup-3mRbP`
- pousser si le lint, le typecheck ou le build échoue — signaler et s'arrêter
- inventer une source, une étude, un chiffre ou un avis client
- laisser un organisme français dans un texte destiné à un lecteur belge : CNITV,
  CAPAE-Ouest, ANSES, AFSCA et NVWA sont interdits. En néerlandais de Belgique : FAVV,
  Antigifcentrum. Vérifier tout numéro d'urgence à la source avant de l'écrire ; à défaut,
  ne pas mettre de numéro du tout.
- modifier PROGRESS.md dans ce run quotidien (le run hebdomadaire s'en charge)
