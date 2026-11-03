
## 2026-11-02 — Ne jamais committer après un build sans vérifier son code de sortie
Un `npm run build … | grep` dans une chaîne `&&` a laissé passer un build cassé (InfoBox mal fermé après une substitution perl `\s*$` qui avalait les retours à la ligne) : le commit est parti sur v2. La préversion n'a pas été touchée (le script garde l'ancienne version si le build échoue).
Règle : `npm run build > log 2>&1 || { tail log; exit 1; }` avant tout commit, et pas de `\s*$` dans une substitution perl ligne à ligne (utiliser `[ \t]*$`).

## 2026-11-03 — serveurs de test oubliés
- Des `next start` / `next dev` lancés par les chantiers (ports 3093, 3099, 3199) sont restés allumés des heures après la fin, ~500 Mo de mémoire.
- Règle : tout chantier arrête son serveur de test par son PID (`ss -ltnp | grep :PORT`) avant son compte rendu ; le coordinateur vérifie `ss -ltnp | grep next-server` après chaque compte rendu.
