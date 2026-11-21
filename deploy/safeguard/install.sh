#!/usr/bin/env bash
# Installe ou met à jour Safeguard. À lancer avec : sudo bash -euo pipefail deploy/safeguard/install.sh
# Ne redémarre aucun service : les réglages des services s'appliquent à leur prochain démarrage,
# sauf la protection des sites (score OOM et réserve mémoire), posée tout de suite sans redémarrage.
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"

bash -n "$SRC/vps-build"
node --check "$SRC/safeguard-watchdog.mjs"

install -m 0755 "$SRC/vps-build" /usr/local/bin/vps-build
ln -sfn vps-build /usr/local/bin/vps-bg
install -m 0755 "$SRC/safeguard-watchdog.mjs" /usr/local/sbin/safeguard-watchdog.mjs
ln -sfn safeguard-watchdog.mjs /usr/local/sbin/safeguard-watchdog

install -m 0644 "$SRC/tmpfiles.conf" /etc/tmpfiles.d/safeguard.conf
systemd-tmpfiles --create /etc/tmpfiles.d/safeguard.conf
[[ -f /var/lib/safeguard/limits.env ]] || install -m 0644 -o administrator -g administrator "$SRC/limits.env" /var/lib/safeguard/limits.env
install -m 0644 "$SRC/logrotate.conf" /etc/logrotate.d/safeguard

install -m 0644 "$SRC/build.slice" "$SRC/background.slice" "$SRC/safeguard-watchdog.service" "$SRC/safeguard-watchdog.timer" /etc/systemd/system/
for f in "$SRC"/dropins/*.conf; do
  unit=$(basename "$f" .conf)
  install -d -m 0755 "/etc/systemd/system/$unit.d"
  install -m 0644 "$f" "/etc/systemd/system/$unit.d/safeguard.conf"
done
systemctl daemon-reload
systemctl enable --now safeguard-watchdog.timer

# Protection immédiate des sites en service, sans redémarrage : réserve mémoire (cgroup) et score OOM (/proc).
prod_units() { echo toutou-web.service caddy.service; systemctl list-units 'site@*.service' --state=running --no-legend --plain | awk '{print $1}'; }
for u in $(prod_units); do
  case $u in
    toutou-web.service) low=1G ;; caddy.service) low=128M ;; *) low=256M ;;
  esac
  systemctl set-property --runtime "$u" MemoryLow=$low
  cg=$(systemctl show -p ControlGroup --value "$u")
  for pid in $(cat "/sys/fs/cgroup$cg/cgroup.procs" 2>/dev/null); do echo -500 > "/proc/$pid/oom_score_adj" 2>/dev/null || true; done
done
pg=$(systemctl list-units 'postgresql@*.service' --state=running --no-legend --plain | awk '{print $1}')
for u in $pg; do systemctl set-property --runtime "$u" MemoryLow=1G; done
systemctl set-property --runtime system.slice MemoryLow=3584M
systemctl set-property --runtime system-site.slice MemoryLow=1280M 2>/dev/null || true
systemctl set-property --runtime system-postgresql.slice MemoryLow=1G 2>/dev/null || true

/usr/bin/node /usr/local/sbin/safeguard-watchdog.mjs
echo "Safeguard installé. État : /run/safeguard/status.json · journaux : /var/log/safeguard/"
