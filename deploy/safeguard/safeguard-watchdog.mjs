#!/usr/bin/env node
// Safeguard : veilleur du VPS, lancé chaque minute par safeguard-watchdog.timer (root, sans IA).
// Il mesure, écrit l'état dans /run/safeguard/status.json et son journal dans /var/log/safeguard/safeguard.log.
// Le centre de contrôle lit cet état et prévient le propriétaire (une alerte par sujet et par heure au plus).
// Si le centre de contrôle est arrêté, les alertes urgentes partent directement par ntfy (message neutre).
//   safeguard-watchdog            un passage
//   safeguard-watchdog --test     ajoute une fausse alerte « info » pendant 3 minutes (journal seulement)
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const RUN = '/run/safeguard';
const STATE = '/var/lib/safeguard/watchdog.json';
const LOG = '/var/log/safeguard/safeguard.log';
const BUILDS = '/var/log/safeguard/builds.log';
const ALERTS_ENV = '/home/administrator/.config/toutou/alerts.env';
const T = { mem: 85, memMin: 5, swap: 50, loadX: 2, loadMin: 10, disk: 85, waitMin: 30, holdMin: 45 };
const now = Date.now();
const MIN = 60_000;

const sh = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: 'utf8', timeout: 20_000, stdio: ['ignore', 'pipe', 'ignore'] }); } catch { return ''; } };
const read = (f, d = '') => { try { return fs.readFileSync(f, 'utf8'); } catch { return d; } };
const pct = (n) => Math.round(n);
const go = (b) => `${(b / 1024 ** 3).toFixed(1).replace('.', ',')} Go`;
const log = (line) => { try { fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`); } catch { /* journal indisponible */ } };

let state = {};
try { state = JSON.parse(read(STATE, '{}')); } catch { state = {}; }
state.since ??= {};
state.direct ??= {};
if (process.argv.includes('--test')) { state.testUntil = now + 3 * MIN; log('test : fausse alerte demandée'); }

// --- Mesures -----------------------------------------------------------------
const mi = read('/proc/meminfo');
const kb = (k) => Number(new RegExp(`^${k}:\\s+(\\d+)`, 'm').exec(mi)?.[1] ?? 0) * 1024;
const mem = { total: kb('MemTotal'), avail: kb('MemAvailable') };
mem.pct = (100 * (mem.total - mem.avail)) / mem.total;
const swap = { total: kb('SwapTotal'), free: kb('SwapFree') };
swap.pct = swap.total ? (100 * (swap.total - swap.free)) / swap.total : 0;
const cpus = os.cpus().length;
const load = os.loadavg()[0];
const st = fs.statfsSync('/');
const disk = { pct: (100 * (st.blocks - st.bfree)) / (st.blocks - st.bfree + st.bavail) };

function topProcess() {
  const out = sh('ps', ['-eo', 'rss=,comm=', '--sort=-rss']).split('\n')[0]?.trim();
  if (!out) return '';
  const [rss, ...name] = out.split(/\s+/);
  return `${name.join(' ')} (${go(Number(rss) * 1024)})`;
}

// --- File des builds -----------------------------------------------------------
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
function entries(prefix) {
  const list = [];
  for (const f of (() => { try { return fs.readdirSync(RUN); } catch { return []; } })()) {
    if (!f.startsWith(`${prefix}.`)) continue;
    const pid = Number(f.slice(prefix.length + 1));
    if (!alive(pid)) { try { fs.rmSync(`${RUN}/${f}`); } catch { /* déjà parti */ } continue; }
    const [ts, user, label, ...cmd] = read(`${RUN}/${f}`).trim().split(' ');
    list.push({ pid, ts: Number(ts) * 1000, user, label, cmd: cmd.join(' ').slice(0, 120) });
  }
  return list.sort((a, b) => a.ts - b.ts);
}
const holders = entries('hold');
const waiters = entries('wait');
const buildMem = Number(read('/sys/fs/cgroup/build.slice/memory.current', '0').trim()) || 0;

function lastBuilds(n = 8) {
  const lines = read(BUILDS).trim().split('\n').filter((l) => / event=(done|timeout|gave-up) /.test(l)).slice(-n);
  return lines.map((l) => {
    const kv = Object.fromEntries([...l.matchAll(/(\w+)=("[^"]*"|\S+)/g)].map((m) => [m[1], m[2].replace(/^"|"$/g, '')]));
    return { ts: Date.parse(l.split(' ')[0]), event: kv.event, label: kv.label, user: kv.user, unit: kv.unit, wait: kv.wait, dur: kv.dur, peak: kv.peak, rc: kv.rc };
  }).reverse();
}

// --- Sujets d'alerte -----------------------------------------------------------
const issues = [];
const add = (key, level, title, body) => issues.push({ key, level, title, body });
// Seuil tenu pendant une durée : on retient depuis quand.
function held(key, cond, minutes) {
  if (!cond) { delete state.since[key]; return false; }
  state.since[key] ??= now;
  return now - state.since[key] >= minutes * MIN;
}
const mins = (key) => Math.round((now - state.since[key]) / MIN);

if (held('mem', mem.pct > T.mem, T.memMin)) add('memoire', 'urgent', `Mémoire à ${pct(mem.pct)} %`, `Depuis ${mins('mem')} min. Le plus gros : ${topProcess()}.${holders.length ? ` Build en cours : ${holders[0].label}.` : ''}`);
if (swap.pct > T.swap) add('swap', 'urgent', `Mémoire de secours à ${pct(swap.pct)} %`, `Le serveur manque de mémoire vive (${pct(mem.pct)} % utilisés). Le plus gros : ${topProcess()}.`);
if (held('load', load > T.loadX * cpus, T.loadMin)) add('charge', 'veille', 'Processeur saturé', `Charge ${load.toFixed(1).replace('.', ',')} pour ${cpus} cœurs depuis ${mins('load')} min.`);
if (disk.pct > T.disk) add('disque', 'urgent', `Disque plein à ${pct(disk.pct)} %`, 'Il faut faire de la place.');

// Processus tués faute de mémoire (journal du noyau depuis le passage précédent).
const sinceOom = Math.floor((state.oomChecked ?? now - 2 * MIN) / 1000);
const kern = sh('journalctl', ['-k', '--no-pager', '-o', 'short-iso', '--since', `@${sinceOom}`]);
const ooms = kern.split('\n').filter((l) => /Out of memory: Killed process|oom-kill:|Memory cgroup out of memory/.test(l));
state.oomChecked = now;
if (ooms.length) {
  const victims = [...new Set(ooms.map((l) => /Killed process \d+ \(([^)]+)\)/.exec(l)?.[1]).filter(Boolean))];
  state.oom = { ts: now, victims, n: ooms.length };
  log(`oom : ${ooms.length} ligne(s) ${victims.join(', ')}`);
}
if (state.oom && now - state.oom.ts < 60 * MIN) add('oom', 'urgent', 'Un programme a été tué faute de mémoire', state.oom.victims.length ? `Victime : ${state.oom.victims.join(', ')}.` : 'Voir le journal du noyau.');

const failed = sh('systemctl', ['list-units', '--state=failed', '--no-legend', '--plain']).split('\n').map((l) => l.trim().split(/\s+/)[0]).filter((u) => u && !u.startsWith('run-'));
if (failed.length) add('echecs', 'veille', `${failed.length} tâche${failed.length > 1 ? 's' : ''} en échec`, failed.join(', '));

const longWait = waiters.find((w) => now - w.ts > T.waitMin * MIN);
if (longWait) add('attente', 'veille', 'Un build attend depuis longtemps', `${longWait.label} (${longWait.user}) attend depuis ${Math.round((now - longWait.ts) / MIN)} min derrière ${holders[0]?.label ?? '?'}.`);
const longHold = holders.find((h) => now - h.ts > T.holdMin * MIN);
if (longHold) add('verrou', 'veille', 'Un build est très long', `${longHold.label} (${longHold.user}) tient la file depuis ${Math.round((now - longHold.ts) / MIN)} min.`);

if (state.testUntil && now < state.testUntil) add('test', 'info', 'Essai de Safeguard', 'Fausse alerte, aucune action à faire.');
else delete state.testUntil;

// --- Journal des changements d'état ----------------------------------------------
const before = new Set(state.open ?? []);
const after = new Set(issues.map((i) => i.key));
for (const i of issues) if (!before.has(i.key)) log(`ouvert ${i.key} [${i.level}] ${i.title} — ${i.body}`);
for (const k of before) if (!after.has(k)) log(`fermé ${k}`);
state.open = [...after];

// --- Centre de contrôle arrêté : envoi direct des urgences, neutre, une fois par heure ---
const controleUp = sh('systemctl', ['is-active', 'controle.service']).trim() === 'active';
if (!controleUp) {
  const env = Object.fromEntries(read(ALERTS_ENV).split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]));
  for (const i of issues.filter((x) => x.level === 'urgent')) {
    if (now - (state.direct[i.key] ?? 0) < 60 * MIN || !env.NTFY_TOPIC) continue;
    state.direct[i.key] = now;
    const server = (env.NTFY_SERVER || 'https://ntfy.sh').replace(/\/$/, '');
    try {
      await fetch(server, { method: 'POST', headers: { 'content-type': 'application/json' }, signal: AbortSignal.timeout(15_000), body: JSON.stringify({ topic: env.NTFY_TOPIC, title: 'Safeguard', message: 'Alerte serveur (le centre de contrôle est arrêté).', priority: 5 }) });
      log(`envoi direct ${i.key}`);
    } catch { /* réseau indisponible */ }
  }
}

// --- État lisible par le centre de contrôle -----------------------------------------
const status = {
  ts: now,
  thresholds: T,
  mem: { pct: mem.pct, used: mem.total - mem.avail, total: mem.total },
  swap: { pct: swap.pct },
  load, cpus,
  disk: { pct: disk.pct },
  buildMem,
  holder: holders[0] ?? null,
  waiters,
  failed,
  issues,
  lastBuilds: lastBuilds(),
  lastAlerts: read(LOG).trim().split('\n').filter((l) => / ouvert /.test(l)).slice(-5).reverse(),
};
fs.mkdirSync(RUN, { recursive: true });
fs.writeFileSync(`${RUN}/.status.tmp`, JSON.stringify(status));
fs.chmodSync(`${RUN}/.status.tmp`, 0o644);
fs.renameSync(`${RUN}/.status.tmp`, `${RUN}/status.json`);
fs.mkdirSync('/var/lib/safeguard', { recursive: true });
fs.writeFileSync(STATE, JSON.stringify(state));
