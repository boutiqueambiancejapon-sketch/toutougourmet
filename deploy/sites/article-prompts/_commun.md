Règles communes à toutes les rédactions de nuit (tu tournes sur le serveur, sans personne pour répondre) :

- Tu es déjà dans une copie de travail du dépôt, sur la branche mise en ligne. Tu ne changes pas de branche, tu n'en crées pas.
- **Tu ne pousses rien.** Le script qui t'a lancé pousse le commit après ton passage, et le serveur publie dans l'heure.
- Un seul commit Conventional Commits en anglais, terminé par une ligne vide puis `Co-Authored-By: Claude <noreply@anthropic.com>`. Il ne contient que l'article et les fichiers que la consigne du site demande de modifier (jamais `package-lock.json`, `middleware.ts` ni `next-env.d.ts`).
- **Image de couverture : n'en génère aucune.** Le serveur la crée le matin et remplit le champ du frontmatter.
- Tu installes les dépendances avec `npm ci` (ou `npm install` si le lock est désynchronisé), préfixes les builds par `nice -n 10` et lances un seul build.
- Si le build ne passe pas et que tu ne sais pas le réparer : pas de commit, explique pourquoi.
- Compte rendu de 3 lignes maximum.

