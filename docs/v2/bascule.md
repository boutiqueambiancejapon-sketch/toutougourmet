# Bascule de www.toutou-gourmet.com vers le VPS

Décision du propriétaire (2026-11-02) : plus aucun service hérité de Vercel. Inscriptions et e-mails via Brevo, mesure et messages de contact dans notre base PostgreSQL, tableau de bord maison. Formspree, Plausible et l'API d'indexation Google sont abandonnés.

## Avant (sans toucher au site en ligne)

1. `v2` complète et contrôlée (contrôle qualité sans bloquant, 385 URL de Google en 200).
2. Base `toutou` : appliquer `db/analytics.sql` (idempotent) : `sudo -u postgres psql -d toutou < db/analytics.sql`.
3. `/srv/toutou/shared/.env` (propriétaire `toutou`, mode 600) :
   - `DATABASE_URL=postgresql:///toutou?host=/var/run/postgresql`
   - `BREVO_API_KEY`, `BREVO_LIST_ID=5`
   - `DASHBOARD_USER`, `DASHBOARD_PASSWORD`, `DASHBOARD_LOG_DIR`
   - (plus tard, lot 4 : `BETTER_AUTH_SECRET`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`)
4. Construire la production depuis `v2` : `sudo -u toutou env DEPLOY_BRANCH=v2 /srv/toutou/deploy.sh`, puis tester sous le vrai nom sans DNS :
   `curl -sI --resolve www.toutou-gourmet.com:443:85.190.127.13 https://www.toutou-gourmet.com/` (après l'étape 6 pour le certificat) ou `curl -s -H 'Host: www.toutou-gourmet.com' http://127.0.0.1:3000/`.
5. Mettre Caddy à jour (dépôt officiel) si possible avant la bascule.
6. Préparer `/etc/caddy/Caddyfile` = `deploy/Caddyfile` (www, apex, dashboard) + le bloc de préversion de `~/toutou-preview/Caddyfile`.

## Jour J (le propriétaire est joignable)

1. Recharger Caddy avec la configuration de l'étape 6 (`sudo caddy validate` puis `sudo systemctl reload caddy`).
2. Vercel → projet `toutougourmet` → Domains : retirer `toutou-gourmet.com` et `www.toutou-gourmet.com` du projet (sinon Vercel continue de gérer les enregistrements). Action du propriétaire.
3. DNS (zone chez Vercel) : remplacer l'ALIAS de la racine et l'ALIAS `*` par des A `85.190.127.13` et AAAA `2001:880:a:343::419` pour `@` et `www`. Garder tels quels : DKIM/DMARC/brevo-code, `mail`, `img.mail`, `r.mail`, vérification Google, CAA (letsencrypt autorisé), `dashboard`.
4. Attendre que Caddy obtienne les certificats (journal `journalctl -u caddy`), puis contrôler : accueil, 10 articles, outils, quiz, marques, `/sitemap.xml`, `/robots.txt`, inscription Brevo, message de contact, `dashboard.toutou-gourmet.com`.
5. Search Console : soumettre `/sitemap.xml`, inspecter 3 URL.
6. Merger `v2` dans la branche de prod GitHub (copie de référence) ; `DEPLOY_BRANCH` repasse sur la branche de prod.
7. Désactiver la tâche planifiée cloud qui publiait les articles sur Vercel (la tâche de nuit du serveur prend le relais).

## Retour arrière (TTL 60 s)

Remettre les deux ALIAS Vercel (valeurs dans le journal du 2 novembre : racine `c624be6d665fb4b7.vercel-dns-017.com`, `*` `cname.vercel-dns-016.com.`) et rattacher les domaines au projet Vercel. Le site V1 sur Vercel n'a pas bougé pendant toute l'opération.

## Fait le 2026-11-02 (soir)

- `.env` de production rempli (base, Brevo, tableau de bord), production construite depuis `v2` (`DEPLOY_BRANCH=v2`), Caddy de production activé (copie hors dépôt, sur le serveur : `~/toutou-preview/Caddyfile.live`, elle contient l'empreinte du mot de passe de la préversion).
- DNS : enregistrements explicites `www` A `85.190.127.13` et AAAA `2001:880:a:343::419` (TTL 60), prioritaires sur l'ALIAS `*` géré par Vercel. La racine reste chez Vercel, qui redirige déjà en 301 vers www.
- Contrôles : certificat valide, 385 URL connues de Google en 200 (dont 20 via une redirection 308 vers l'article déplacé), inscription Brevo et enregistrement des événements testés en production.
- Retour arrière : repointer les deux enregistrements `www` créés vers Vercel (ou les supprimer) ; Vercel sert de nouveau www en une minute.
- Mises à jour : la production ne se reconstruit pas toute seule : `sudo -u toutou env DEPLOY_BRANCH=v2 /srv/toutou/deploy.sh` après chaque fusion (à automatiser après la tâche de nuit).
