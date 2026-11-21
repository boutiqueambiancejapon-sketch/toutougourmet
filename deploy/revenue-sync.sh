#!/usr/bin/env bash
# Recopie les ventes réelles de Toutou (centre de contrôle, table commissions) dans analytics.revenue_sales, pour
# l'écran Revenus du tableau de bord. Compte administrator : seul à lire la base du centre de contrôle.
# Lancé chaque nuit par toutou-revenue-sync.timer ; se relance sans risque (la table est réécrite).
set -euo pipefail
DB=${CONTROLE_DB:-/var/lib/controle/controle.db}
PROJECT=${PROJECT:-toutou}
CSV=$(sqlite3 -readonly -csv "file:$DB?mode=ro" \
  "SELECT project, day, program, sum(amount), sum(sales), min(status) FROM commissions WHERE project = '$PROJECT' GROUP BY project, day, program")
psql -v ON_ERROR_STOP=1 -q -d toutou <<SQL
BEGIN;
DELETE FROM analytics.revenue_sales WHERE project = '$PROJECT';
\copy analytics.revenue_sales (project, day, program, amount, sales, status) FROM STDIN WITH (FORMAT csv)
$CSV
\.
COMMIT;
SQL
echo "ventes recopiées : $(printf '%s\n' "$CSV" | grep -c . || true) lignes"
