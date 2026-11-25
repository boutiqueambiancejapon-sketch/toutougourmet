#!/usr/bin/env node
// Usine à sites — assistant « Nouveau site » (lot 3). Appelé par le centre de contrôle (onglet Usine), sous le compte
// administrator ; les gestes système passent par `sudo -n`. Chaque étape est idempotente : un essai à blanc décrit ce qui
// serait fait, une reprise après erreur repart de l'étape en échec, le retour arrière ne supprime que ce que l'assistant a
// créé lui-même (noté dans l'état). Ambiance Japon, Miami et Toutou sont protégés : aucun geste sur eux, jamais.
// Les secrets sont lus en mémoire (sudo cat), écrits dans le .env du site, jamais affichés ni écrits dans le journal.
//
//   new-site.mjs plan <id>            essai à blanc ; paramètres JSON sur l'entrée standard (écrit seulement l'état « brouillon »)
//   new-site.mjs apply <id>           création pour de vrai (reprend à l'étape en erreur)
//   new-site.mjs undo <id> [--dry]    retour arrière complet de ce qui a été créé
//   new-site.mjs open <id> [--dry]    ouverture au public (STAGING=0, Caddy sans mot de passe ni noindex, MAIL_MODE=live)
//   new-site.mjs check <id>           dest:check + parité + Brevo/DNS en lecture : résultat dans checks.json
//   new-site.mjs status [--json]      état de tous les sites de l'usine (sites.conf « -socle: » + états)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { spawnSync, spawn } from 'node:child_process';
import { skeleton } from './skeleton.mjs';

const HOME = '/home/administrator';
const STATE_DIR = process.env.USINE_STATE ?? '/var/lib/usine';
const CONF = process.env.USINE_CONF ?? `${HOME}/Toutou/deploy/sites/sites.conf`;
const TOUTOU = path.dirname(path.dirname(path.dirname(CONF)));
const DEPLOY = `${HOME}/Toutou/deploy/sites/deploy-local.sh`;
const SOCLE_NAME = 'neko-voyage';
const SOCLE = `${HOME}/sites-src/${SOCLE_NAME}`;
const SOCLE_MAIN = 'main';
const CADDYFILE = '/etc/caddy/Caddyfile';
const CADDY_DIR = '/etc/caddy/usine';
const CADDY_IMPORT = `import ${CADDY_DIR}/*.caddy`;
const SERVER_IP = '85.190.127.13';
const PORTS = [3108, 3189];
const PROTECTED = new Set(['ambiance-japon', 'miami', 'japon', 'toutou', 'controle', '10minlanguages', 'klarolab', 'robot-tondeuse', 'voyance-fiable', 'travel-belgium', 'sites', 'postgres', 'aj', 'qrt', 'tenmin', 'usine', 'template0', 'template1']);
const ENV_AJ = '/srv/sites/ambiance-japon/shared/.env';
const ENV_MIAMI = '/srv/sites/miami/shared/.env';
const ENV_TOUTOU = '/srv/toutou/shared/.env';
const OWNER_GMAIL = 'cetaniandcie@gmail.com';
const BREVO_FOLDER = 3; // dossier des listes Ambiance Japon et Miami
const IMG_LOG = `${HOME}/drafts/aj-v1/raw/covers-log.tsv`;
const MANUAL = {
  'ambiance-japon': { name: 'Ambiance Japon', note: 'Site d’origine, gabarit de l’usine. Monté à la main avant l’usine.' },
  miami: { name: 'Miami with Neko', note: 'Pilote monté à la main les 24 et 25/11/2026 (base, rôle, .env, service, Caddy, DNS, Brevo, sub_id, minuteurs).' },
};

// --- Outils -----------------------------------------------------------------

const SECRETS = new Set();
const scrub = (s) => { let out = String(s); for (const v of SECRETS) if (v && v.length >= 6) out = out.split(v).join('***'); return out; };
let CUR = null; // site en cours (journal)
const now = () => new Date().toISOString();
const stamp = () => new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
function say(line) {
  const l = scrub(line);
  process.stdout.write(`${l}\n`);
  if (CUR) fs.appendFileSync(path.join(STATE_DIR, CUR, 'journal.log'), `${now().slice(0, 19).replace('T', ' ')}  ${l}\n`);
}
class Human extends Error {}

function run(cmd, args, { input, ok = [0], quiet = false } = {}) {
  const r = spawnSync(cmd, args, { input, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (!ok.includes(r.status)) {
    const msg = scrub(`${cmd} ${args.filter((a) => !/^-/.test(a) || a.length < 3).slice(0, 6).join(' ')} : ${(r.stderr || r.stdout || r.error?.message || '').trim().split('\n').slice(-4).join(' / ')}`);
    if (quiet) return null;
    throw new Error(msg);
  }
  return r.stdout ?? '';
}
const sudo = (args, o) => run('sudo', ['-n', ...args], o);
const psql = (sql, db = 'postgres') => sudo(['-u', 'postgres', 'psql', '-X', '-q', '-At', '-v', 'ON_ERROR_STOP=1', '-d', db, '-c', sql]);
const git = (args, o) => run('git', ['-C', SOCLE, ...args], o);
const writeRoot = (file, content, mode = '0644') => { sudo(['tee', file], { input: content }); sudo(['chmod', mode, file]); };

/** Lit un .env (root ou sites) en mémoire ; toutes les valeurs deviennent des secrets à masquer. */
function readEnv(file) {
  const txt = run('sudo', ['-n', 'cat', file], { ok: [0, 1], quiet: true }) ?? '';
  const map = new Map();
  for (const line of txt.split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!m) continue;
    map.set(m[1], m[2]);
    if (/KEY|TOKEN|SECRET|HASH|PASS|MARKER|TRS|TESTERS/.test(m[1])) SECRETS.add(m[2]);
  }
  return map;
}
const isSslip = (d) => /\.(sslip|nip)\.io$/.test(d);
const dbName = (id) => id.replace(/-/g, '_');

// --- État -------------------------------------------------------------------

const dirOf = (id) => path.join(STATE_DIR, id);
const stateFile = (id) => path.join(dirOf(id), 'state.json');
function load(id) { try { return JSON.parse(fs.readFileSync(stateFile(id), 'utf8')); } catch { return null; } }
function save(s) {
  fs.mkdirSync(dirOf(s.id), { recursive: true, mode: 0o750 });
  const tmp = `${stateFile(s.id)}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(s, null, 1)}\n`, { mode: 0o640 });
  fs.renameSync(tmp, stateFile(s.id));
}
function lock(id) {
  const f = path.join(dirOf(id), 'lock');
  try {
    const pid = Number(fs.readFileSync(f, 'utf8'));
    if (pid && pid !== process.pid) { try { process.kill(pid, 0); throw new Error(`Une action tourne déjà sur ${id} (pid ${pid}).`); } catch (e) { if (e.code !== 'ESRCH') throw e; } }
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  fs.writeFileSync(f, String(process.pid));
  process.on('exit', () => { try { if (Number(fs.readFileSync(f, 'utf8')) === process.pid) fs.unlinkSync(f); } catch { /* déjà parti */ } });
}
const step = (s, k) => (s.steps[k] ??= { status: 'todo' });

// --- sites.conf -------------------------------------------------------------

function confLines() {
  return fs.readFileSync(CONF, 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => { const [name, repo, port, branch] = l.trim().split(/\s+/); return { name, repo, port: Number(port), branch }; });
}
function freePort() {
  const used = new Set(confLines().map((c) => c.port));
  const listening = run('ss', ['-Hltn']).split('\n').map((l) => Number(/:(\d+)\s/.exec(l)?.[1])).filter(Boolean);
  for (const p of listening) used.add(p);
  for (let p = PORTS[0]; p <= PORTS[1]; p++) if (!used.has(p)) return p;
  throw new Error('Aucun port libre entre 3108 et 3189.');
}

// --- Paramètres -------------------------------------------------------------

function validate(raw) {
  const p = {
    id: String(raw.id ?? '').trim().toLowerCase(), name: String(raw.name ?? '').trim(), domain: String(raw.domain ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, ''),
    lang: String(raw.lang ?? ''), mirrorLang: String(raw.mirrorLang ?? '').trim().toLowerCase(), mirrorLabel: String(raw.mirrorLabel ?? '').trim(),
    currency: String(raw.currency ?? '').trim().toUpperCase(), timezone: String(raw.timezone ?? '').trim(),
    departures: String(raw.departures ?? '').split(/[,;\n]/).map((s) => s.trim()).filter(Boolean).slice(0, 30),
  };
  const bad = [];
  if (!/^[a-z][a-z0-9-]{1,23}$/.test(p.id) || /--|-$/.test(p.id)) bad.push('Identifiant : lettres minuscules, chiffres et tirets, 2 à 24 caractères (ex. lisbonne).');
  if (PROTECTED.has(p.id) || PROTECTED.has(dbName(p.id))) bad.push(`L’identifiant « ${p.id} » est réservé.`);
  if (p.name.length < 3 || p.name.length > 60 || /[<>"`$\\]/.test(p.name)) bad.push('Nom : 3 à 60 caractères, sans < > " ` $ \\.');
  if (!/^(?=.{4,100}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(p.domain)) bad.push('Domaine : un nom comme exemple.com (sans https://).');
  if (!['fr', 'en'].includes(p.lang)) bad.push('Langue : fr ou en.');
  if (!/^[a-z]{2}$/.test(p.mirrorLang)) bad.push('Langue miroir : un code à 2 lettres (es, ja, pt…).');
  if (p.mirrorLabel.length < 2 || p.mirrorLabel.length > 30 || /[<>"`$\\]/.test(p.mirrorLabel)) bad.push('Nom de la langue miroir : 2 à 30 caractères (ex. español).');
  if (!/^[A-Z]{3}$/.test(p.currency)) bad.push('Devise : code ISO à 3 lettres (EUR, USD…).');
  try { new Intl.DateTimeFormat('en', { timeZone: p.timezone }); if (!p.timezone.includes('/')) throw new Error(); } catch { bad.push('Fuseau : un fuseau IANA (ex. Europe/Lisbon).'); }
  if (!p.departures.length) bad.push('Zones de départ : au moins une (ex. France, Belgique).');
  if (p.departures.some((d) => d.length > 40 || /[<>"`$\\]/.test(d))) bad.push('Zones de départ : 40 caractères au plus chacune.');
  p.locale = `${p.lang}-${p.lang === 'fr' ? 'FR' : 'US'}`;
  if (bad.length) throw new Human(bad.join(' '));
  return p;
}

// --- API Cloudflare et Brevo ------------------------------------------------

let CF_TOKEN = null, BREVO_KEY = null;
function keys() {
  if (!CF_TOKEN) { CF_TOKEN = readEnv(ENV_TOUTOU).get('CLOUDFLARE_API_TOKEN') ?? null; }
  if (!BREVO_KEY) { BREVO_KEY = readEnv(ENV_AJ).get('BREVO_API_KEY') ?? null; }
}
async function cf(method, p, body) {
  keys();
  if (!CF_TOKEN) throw new Error('Clé Cloudflare absente du serveur (coffre à clés).');
  const res = await fetch(`https://api.cloudflare.com/client/v4${p}`, { method, headers: { authorization: `Bearer ${CF_TOKEN}`, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30_000) });
  const j = await res.json().catch(() => ({}));
  if (!j.success) throw new Error(`Cloudflare ${method} ${p.split('?')[0]} : ${(j.errors ?? []).map((e) => e.message).join(', ') || res.status}`);
  return j.result;
}
async function cfZone(domain) {
  const parts = domain.split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts.slice(i).join('.');
    const z = await cf('GET', `/zones?name=${encodeURIComponent(name)}`);
    if (z?.length) return { id: z[0].id, name: z[0].name, status: z[0].status };
  }
  return null;
}
async function brevo(method, p, body, okStatus = [200, 201, 204]) {
  keys();
  if (!BREVO_KEY) throw new Error('Clé Brevo absente (secrets d’Ambiance Japon).');
  const res = await fetch(`https://api.brevo.com/v3${p}`, { method, headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json', accept: 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30_000) });
  const text = await res.text();
  let j = null; try { j = text ? JSON.parse(text) : null; } catch { /* vide */ }
  if (res.status === 404) return null;
  if (!okStatus.includes(res.status)) throw new Error(`Brevo ${method} ${p} : ${res.status} ${j?.message ?? ''}`.trim());
  return j ?? {};
}

// --- Contexte ---------------------------------------------------------------

function ctxOf(s) {
  const p = s.params;
  return { s, p, id: p.id, db: dbName(p.id), port: s.port, sslip: isSslip(p.domain), domain: p.domain, root: `/srv/sites/${p.id}`, branch: `usine/${p.id}`, caddyFile: `${CADDY_DIR}/${p.id}.caddy` };
}
function maquetteHash() {
  // Mot de passe des maquettes : même empreinte que les autres préproductions (jamais le mot de passe en clair).
  const txt = fs.readFileSync(CADDYFILE, 'utf8');
  const block = /miami\.85-190-127-13\.sslip\.io \{[\s\S]*?basicauth \{\s*(\S+) (\$2[aby]\$\d+\$\S+)/.exec(txt) ?? /basicauth \{\s*(\S+) (\$2[aby]\$\d+\$\S+)/.exec(txt);
  if (!block) throw new Error('Empreinte du mot de passe des maquettes introuvable dans le Caddyfile.');
  return { user: block[1], hash: block[2] };
}
function caddyBlock(c, mode) {
  const a = maquetteHash();
  const www = c.sslip ? '' : `www.${c.domain} {\n\timport sondes\n\tredir https://${c.domain}{uri} permanent\n}\n\n`;
  const head = `# Usine : ${c.p.name} (${c.id}, port ${c.port}) — ${mode === 'public' ? 'ouvert au public' : 'préproduction : mot de passe des maquettes + noindex'}.\n# Écrit par ~/Toutou/deploy/sites/usine/new-site.mjs (centre de contrôle, onglet Usine) : ne pas modifier à la main.\n`;
  const auth = mode === 'public' ? '' : `\tbasicauth {\n\t\t${a.user} ${a.hash}\n\t}\n`;
  const robots = mode === 'public' ? '' : '\t\tX-Robots-Tag "noindex, nofollow"\n';
  return `${head}${www}${c.domain} {\n\timport sondes\n\tencode zstd gzip\n\tlog {\n\t\toutput stderr\n\t\tformat json\n\t}\n${auth}\theader {\n${robots}\t\tStrict-Transport-Security "max-age=31536000"\n\t\tX-Content-Type-Options "nosniff"\n\t\tReferrer-Policy "strict-origin-when-cross-origin"\n\t\t-Server\n\t}\n\treverse_proxy 127.0.0.1:${c.port}\n}\n`;
}
function backup(file, tag) {
  const dest = path.join(STATE_DIR, 'backups', `${path.basename(file)}.${tag}-${stamp()}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true, mode: 0o750 });
  fs.writeFileSync(dest, run('sudo', ['-n', 'cat', file]), { mode: 0o640 });
  return dest;
}
function caddyReload() {
  sudo(['caddy', 'validate', '--config', CADDYFILE, '--adapter', 'caddyfile']);
  sudo(['systemctl', 'reload', 'caddy']);
}
function ensureCaddyImport() {
  const txt = fs.readFileSync(CADDYFILE, 'utf8');
  sudo(['install', '-d', '-m', '0755', CADDY_DIR]);
  if (txt.split('\n').some((l) => l.trim() === CADDY_IMPORT)) return false;
  const bk = backup(CADDYFILE, 'avant-usine');
  sudo(['cp', CADDYFILE, `${CADDYFILE}.avant-usine-${stamp()}`]);
  writeRoot(CADDYFILE, `${txt.replace(/\n*$/, '\n')}\n# --- Usine à sites : un fichier par site créé par l'assistant « Nouveau site » (centre de contrôle) ---\n${CADDY_IMPORT}\n`);
  try { sudo(['caddy', 'validate', '--config', CADDYFILE, '--adapter', 'caddyfile']); } catch (e) { writeRoot(CADDYFILE, txt); throw e; }
  say(`  Caddyfile : ligne « ${CADDY_IMPORT} » ajoutée (sauvegarde ${bk}).`);
  return true;
}
function confCommit(msg) {
  // sites.conf vit dans le dépôt Toutou : commit du seul fichier si le dépôt est sur v2 et que rien d'autre n'y est modifié.
  const rel = path.relative(TOUTOU, CONF);
  const branch = run('git', ['-C', TOUTOU, 'rev-parse', '--abbrev-ref', 'HEAD']).trim();
  const dirty = run('git', ['-C', TOUTOU, 'status', '--porcelain']).split('\n').filter(Boolean).filter((l) => !l.endsWith(rel) && !l.startsWith('??'));
  if (branch !== 'v2' || dirty.length) { say(`  sites.conf modifié mais pas commité (dépôt Toutou sur ${branch}, ${dirty.length} autre(s) fichier(s) modifié(s)) : à committer.`); return false; }
  run('git', ['-C', TOUTOU, 'commit', '-q', '-m', msg, '--', rel]);
  say(`  sites.conf commité sur v2 (${run('git', ['-C', TOUTOU, 'rev-parse', '--short', 'HEAD']).trim()}), pas poussé.`);
  return true;
}
async function waitFor(fn, seconds, every = 3) {
  const end = Date.now() + seconds * 1000;
  let last;
  while (Date.now() < end) { last = await fn().catch((e) => ({ ok: false, why: e.message })); if (last?.ok) return last; await new Promise((r) => setTimeout(r, every * 1000)); }
  return last ?? { ok: false, why: 'délai dépassé' };
}
function streamCmd(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    const onData = (d) => { buf += d; const lines = buf.split('\n'); buf = lines.pop(); for (const l of lines) if (l.trim()) say(`  | ${l.slice(0, 300)}`); };
    child.stdout.on('data', onData); child.stderr.on('data', onData);
    child.on('close', (code) => { if (buf.trim()) say(`  | ${buf.slice(0, 300)}`); code === 0 ? resolve() : reject(new Error(`${path.basename(args[args.length - 2] ?? cmd)} a échoué (code ${code}).`)); });
  });
}

// --- Étapes de création -----------------------------------------------------
// plan(c) → lignes « ce qui sera fait » ; done(c) → déjà fait dans la réalité ; apply(c, st) ; undo(c, st, dry) → lignes.

const STEPS = [
  {
    id: 'preflight', label: 'Vérifications',
    async plan(c) {
      const out = [`Identifiant ${c.id}, port ${c.port}, base ${c.db}, branche ${c.branch} du socle ${SOCLE_NAME}.`];
      if (confLines().some((l) => l.name === c.id) && !c.s.steps.conf?.created) throw new Human(`« ${c.id} » est déjà dans sites.conf.`);
      if (c.sslip) out.push(`Domaine d’essai ${c.domain} : Cloudflare et Brevo sautés.`);
      else {
        const z = await cfZone(c.domain);
        if (!z) throw new Human(`Le domaine ${c.domain} n’est pas dans Cloudflare (compte Cetaniandcie). Achète-le, ajoute-le à Cloudflare, puis relance l’assistant.`);
        out.push(`Zone Cloudflare ${z.name} trouvée (${z.status}).`);
      }
      if (fs.readFileSync(CADDYFILE, 'utf8').includes(`${c.domain} {`)) throw new Human(`${c.domain} a déjà un bloc dans le Caddyfile.`);
      return out;
    },
    done: () => false,
    async apply(c) { for (const l of await this.plan(c)) say(`  ${l}`); },
    undo: () => [],
  },
  {
    id: 'dns', label: 'DNS Cloudflare',
    async plan(c) { return c.sslip ? null : [`Cloudflare : A ${c.domain} et A www.${c.domain} → ${SERVER_IP} (DNS only).`]; },
    done: () => false,
    async apply(c, st) {
      if (c.sslip) { st.status = 'skipped'; st.note = 'Domaine d’essai (sslip.io) : rien à faire.'; return; }
      const z = await cfZone(c.domain);
      st.data = { zone: z.id, records: st.data?.records ?? [] };
      for (const name of [c.domain, `www.${c.domain}`]) {
        const ex = await cf('GET', `/zones/${z.id}/dns_records?type=A&name=${encodeURIComponent(name)}`);
        if (ex.length) {
          if (ex[0].content !== SERVER_IP) throw new Human(`${name} pointe déjà vers ${ex[0].content} : décide toi-même dans Cloudflare.`);
          say(`  A ${name} existe déjà vers le serveur : gardé tel quel.`); continue;
        }
        const r = await cf('POST', `/zones/${z.id}/dns_records`, { type: 'A', name, content: SERVER_IP, ttl: 1, proxied: false, comment: `usine ${c.id}` });
        st.data.records.push({ id: r.id, type: 'A', name }); save(c.s);
        say(`  A ${name} → ${SERVER_IP} créé.`);
      }
      st.created = st.data.records.length > 0;
    },
    async undo(c, st, dry) { return cfUndo(st, dry); },
  },
  {
    id: 'skeleton', label: 'Squelette de destination',
    async plan(c) {
      const files = skeleton(c.p, today());
      return [`Branche ${c.branch} du socle depuis ${SOCLE_MAIN} (${git(['rev-parse', '--short', SOCLE_MAIN]).trim()}), ${files.length} fichiers : destinations/${c.id}/ (fiche, zones, hôtels, activités, itinéraires, parité, thème) et routes provisoires *.${c.id}.tsx. ${SOCLE_MAIN} n’est pas touchée.`];
    },
    done: (c) => Boolean(git(['rev-parse', '--verify', '-q', `refs/heads/${c.branch}`], { ok: [0, 1] }).trim()),
    async apply(c, st) {
      if (fs.existsSync(path.join(SOCLE, 'destinations', c.id)) || git(['ls-tree', '--name-only', SOCLE_MAIN, `destinations/${c.id}`]).trim()) throw new Human(`destinations/${c.id}/ existe déjà dans le socle.`);
      const base = git(['rev-parse', SOCLE_MAIN]).trim();
      const index = path.join(STATE_DIR, c.id, 'git-index');
      const env = { ...process.env, GIT_INDEX_FILE: index };
      const g = (args, input) => { const r = spawnSync('git', ['-C', SOCLE, ...args], { env, input, encoding: 'utf8' }); if (r.status !== 0) throw new Error(`git ${args[0]} : ${r.stderr.trim()}`); return r.stdout.trim(); };
      g(['read-tree', base]);
      const files = skeleton(c.p, today());
      for (const [f, content] of files) g(['update-index', '--add', '--cacheinfo', `100644,${g(['hash-object', '-w', '--stdin'], content)},${f}`]);
      const tree = g(['write-tree']);
      const commit = g(['commit-tree', tree, '-p', base, '-m', `feat(usine): skeleton for destination ${c.id} (${c.p.name})\n\nCreated by the "New site" assistant of the control center (Usine tab).`]);
      g(['update-ref', `refs/heads/${c.branch}`, commit, '0'.repeat(40)]);
      fs.rmSync(index, { force: true });
      st.created = true; st.data = { commit, base, files: files.length };
      say(`  Branche ${c.branch} créée (${commit.slice(0, 7)}, ${files.length} fichiers).`);
    },
    async undo(c, st, dry) {
      if (!st.created) return [];
      const head = git(['rev-parse', '--verify', '-q', `refs/heads/${c.branch}`], { ok: [0, 1] }).trim();
      if (!head) return [];
      if (head !== st.data?.commit) {
        const arch = `usine-archive/${c.id}-${stamp()}`;
        if (!dry) git(['branch', '-m', c.branch, arch]);
        return [`Branche ${c.branch} : des commits ont été ajoutés depuis la création, elle est gardée sous ${arch}.`];
      }
      if (!dry) git(['update-ref', '-d', `refs/heads/${c.branch}`, head]);
      return [`Branche ${c.branch} supprimée (${SOCLE_MAIN} intacte).`];
    },
  },
  {
    id: 'db', label: 'Base PostgreSQL et rôle',
    async plan(c) { return [`Rôle ${c.db} (sans connexion), base ${c.db} dont il est propriétaire, GRANT ${c.db} TO sites, schémas communs du socle (${migrations(c).length} fichiers SQL de la branche).`]; },
    done: (c) => psql(`SELECT 1 FROM pg_database WHERE datname = '${c.db}'`).trim() === '1' && c.s.steps.db?.status === 'done',
    async apply(c, st) {
      const hasDb = psql(`SELECT 1 FROM pg_database WHERE datname = '${c.db}'`).trim() === '1';
      const hasRole = psql(`SELECT 1 FROM pg_roles WHERE rolname = '${c.db}'`).trim() === '1';
      if ((hasDb || hasRole) && !st.data?.createdDb) throw new Human(`La base ou le rôle « ${c.db} » existe déjà sans avoir été créé par l’assistant : rien n’est touché.`);
      st.data = st.data ?? {};
      if (!hasRole) { psql(`CREATE ROLE ${c.db} NOLOGIN`); st.data.createdRole = true; save(c.s); say(`  Rôle ${c.db} créé.`); }
      if (!hasDb) { psql(`CREATE DATABASE ${c.db} OWNER ${c.db}`); st.data.createdDb = true; save(c.s); say(`  Base ${c.db} créée.`); }
      psql(`GRANT ${c.db} TO sites`);
      for (const f of migrations(c)) {
        const sql = git(['show', `${c.branch}:db/${f}.sql`]).replace(/(AUTHORIZATION|OWNER TO|GRANT [a-z]+ TO|TO) aj;/g, `$1 ${c.db};`);
        sudo(['-u', 'postgres', 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-d', c.db, '-f', '-'], { input: sql });
      }
      const n = psql(`SELECT count(*) FROM pg_namespace WHERE nspowner = (SELECT oid FROM pg_roles WHERE rolname = '${c.db}')`, c.db).trim();
      st.created = true;
      say(`  ${migrations(c).length} fichiers SQL joués, ${n} schémas appartiennent à ${c.db}.`);
    },
    async undo(c, st, dry) {
      const out = [];
      if (st.data?.createdDb && psql(`SELECT 1 FROM pg_database WHERE datname = '${c.db}'`).trim() === '1') { if (!dry) psql(`DROP DATABASE ${c.db} WITH (FORCE)`); out.push(`Base ${c.db} supprimée.`); }
      if (st.data?.createdRole && psql(`SELECT 1 FROM pg_roles WHERE rolname = '${c.db}'`).trim() === '1') { if (!dry) { psql(`REVOKE ${c.db} FROM sites`); psql(`DROP ROLE ${c.db}`); } out.push(`Rôle ${c.db} supprimé.`); }
      return out;
    },
  },
  {
    id: 'brevo', label: 'Brevo : domaine, DKIM, expéditeur, liste',
    async plan(c) { return c.sslip ? null : [`Brevo : domaine d’envoi ${c.domain}, enregistrements DKIM, code Brevo et DMARC posés dans Cloudflare, authentification, expéditeur « ${c.p.name} » <hello@${c.domain}>, liste « ${c.p.name} ».`]; },
    done: () => false,
    async apply(c, st) {
      if (c.sslip) { st.status = 'skipped'; st.note = 'Domaine d’essai (sslip.io) : pas d’e-mail.'; return; }
      st.data = st.data ?? { records: [] };
      let d = await brevo('GET', `/senders/domains/${c.domain}`);
      if (!d) { await brevo('POST', '/senders/domains', { name: c.domain }); st.data.domain = c.domain; save(c.s); say(`  Domaine ${c.domain} ajouté à Brevo.`); d = await brevo('GET', `/senders/domains/${c.domain}`); }
      else if (!st.data.domain) say(`  Domaine ${c.domain} déjà dans Brevo : gardé, jamais supprimé par le retour arrière.`);
      const z = await cfZone(c.domain);
      st.data.zone = z.id;
      for (const r of Object.values(d?.dns_records ?? {})) {
        if (!r?.type || !r.host_name || !r.value) continue;
        const name = r.host_name === '@' ? c.domain : `${r.host_name}.${c.domain}`;
        const ex = await cf('GET', `/zones/${z.id}/dns_records?type=${r.type}&name=${encodeURIComponent(name)}`);
        const same = ex.find((e) => e.content.replace(/^"|"$/g, '') === r.value);
        if (same) { say(`  ${r.type} ${name} déjà présent.`); continue; }
        if (r.type === 'TXT' && r.host_name === '_dmarc' && ex.length) { say(`  DMARC déjà présent : gardé.`); continue; }
        const rec = await cf('POST', `/zones/${z.id}/dns_records`, { type: r.type, name, content: r.type === 'TXT' ? `"${r.value}"` : r.value, ttl: 1, proxied: false, comment: `usine ${c.id} brevo` });
        st.data.records.push({ id: rec.id, type: r.type, name }); save(c.s);
        say(`  ${r.type} ${name} posé dans Cloudflare.`);
      }
      if (!d?.authenticated) {
        const ok = await waitFor(async () => { await brevo('PUT', `/senders/domains/${c.domain}/authenticate`, undefined, [200, 201, 204, 400]); const x = await brevo('GET', `/senders/domains/${c.domain}`); return { ok: Boolean(x?.authenticated) }; }, 120, 20);
        if (!ok.ok) throw new Error('Brevo n’a pas encore authentifié le domaine (DNS en cours de propagation) : reprends dans quelques minutes.');
      }
      say(`  Domaine authentifié par Brevo.`);
      const senders = (await brevo('GET', '/senders'))?.senders ?? [];
      const email = `hello@${c.domain}`;
      const snd = senders.find((x) => x.email === email);
      if (snd) say(`  Expéditeur ${email} déjà là.`);
      else { const r = await brevo('POST', '/senders', { name: c.p.name, email }); st.data.sender = r.id; save(c.s); say(`  Expéditeur ${email} créé.`); }
      const lists = (await brevo('GET', '/contacts/lists?limit=50'))?.lists ?? [];
      const lst = lists.find((x) => x.name === c.p.name);
      if (lst) { st.data.listId = lst.id; say(`  Liste « ${c.p.name} » déjà là (n° ${lst.id}).`); }
      else { const r = await brevo('POST', '/contacts/lists', { name: c.p.name, folderId: BREVO_FOLDER }); st.data.list = r.id; st.data.listId = r.id; save(c.s); say(`  Liste « ${c.p.name} » créée (n° ${r.id}).`); }
      st.created = true;
    },
    async undo(c, st, dry) {
      const out = [];
      if (st.data?.list) { if (!dry) await brevo('DELETE', `/contacts/lists/${st.data.list}`); out.push(`Liste Brevo n° ${st.data.list} supprimée.`); }
      if (st.data?.sender) { if (!dry) await brevo('DELETE', `/senders/${st.data.sender}`); out.push(`Expéditeur hello@${c.domain} supprimé.`); }
      if (st.data?.domain) { if (!dry) await brevo('DELETE', `/senders/domains/${c.domain}`); out.push(`Domaine ${c.domain} retiré de Brevo.`); }
      return [...out, ...(await cfUndo(st, dry))];
    },
  },
  {
    id: 'env', label: 'Dossier et secrets (.env)',
    async plan(c) { return [`${c.root}/{releases,shared/data} et ${c.root}/shared/.env : PORT=${c.port}, SITE_DEST=${c.id}, SITE_URL=https://${c.domain}, STAGING=1, DATABASE_URL (base ${c.db}), TRAVELPAYOUTS_SUB_ID=${c.id}, MAIL_MODE=test, MAIL_SENDER=hello@${c.domain}, clés Travelpayouts et Brevo copiées sans affichage, secrets de session générés.`]; },
    done: (c) => c.s.steps.env?.status === 'done' && fs.existsSync(`${c.root}/shared/.env`),
    async apply(c, st) {
      if (fs.existsSync(c.root) && !st.created) throw new Human(`${c.root} existe déjà sans avoir été créé par l’assistant.`);
      const aj = readEnv(ENV_AJ), mi = readEnv(ENV_MIAMI);
      const need = (m, k) => { const v = m.get(k); if (!v) throw new Error(`Clé ${k} introuvable dans les secrets partagés.`); return v; };
      const gen = () => { const v = crypto.randomBytes(32).toString('hex'); SECRETS.add(v); return v; };
      const env = [
        ['PORT', c.port], ['STAGING', 1], ['SITE_DEST', c.id], ['SITE_URL', `https://${c.domain}`], ['DATABASE_URL', `postgresql:///${c.db}?host=/var/run/postgresql`],
        ['TRAVELPAYOUTS_API_TOKEN', need(aj, 'TRAVELPAYOUTS_API_TOKEN')], ['TRAVELPAYOUTS_MARKER', need(aj, 'TRAVELPAYOUTS_MARKER')], ['TRAVELPAYOUTS_TRS', need(aj, 'TRAVELPAYOUTS_TRS')], ['TRAVELPAYOUTS_SUB_ID', c.id],
        ['DASHBOARD_PASSWORD_HASH', need(aj, 'DASHBOARD_PASSWORD_HASH')], ['DASHBOARD_AUTH_SECRET', gen()], ['DEST_DATA_DIR', `${c.root}/shared/data`], ['DEST_SECRET', gen()],
        ['BREVO_API_KEY', need(aj, 'BREVO_API_KEY')], ['MAIL_TESTERS', mi.get('MAIL_TESTERS') || OWNER_GMAIL], ['MAIL_MODE', 'test'], ['MAIL_DAILY_CAP', 20],
        ['MAIL_SENDER', `hello@${c.domain}`], ['MAIL_REPLY_TO', `contact@${c.domain}`],
        ...(c.s.steps.brevo?.data?.listId ? [['BREVO_LIST_ID', c.s.steps.brevo.data.listId]] : []),
      ];
      fs.mkdirSync(`${c.root}/releases`, { recursive: true });
      fs.mkdirSync(`${c.root}/shared/data`, { recursive: true });
      st.created = true; save(c.s);
      sudo(['chgrp', 'sites', c.root, `${c.root}/releases`, `${c.root}/shared`]);
      sudo(['chmod', '0750', c.root, `${c.root}/releases`, `${c.root}/shared`]);
      sudo(['chown', 'sites:sites', `${c.root}/shared/data`]);
      sudo(['chmod', '2775', `${c.root}/shared/data`]);
      const file = `${c.root}/shared/.env`;
      fs.writeFileSync(file, `${env.map(([k, v]) => `${k}=${v}`).join('\n')}\n`, { mode: 0o600 });
      sudo(['chgrp', 'sites', file]);
      say(`  ${file} écrit (${env.length} clés, valeurs masquées).`);
    },
    async undo(c, st, dry) {
      if (!st.created || !fs.existsSync(c.root)) return [];
      if (!/^\/srv\/sites\/[a-z][a-z0-9-]+$/.test(c.root) || PROTECTED.has(c.id)) throw new Error('Chemin protégé.');
      if (!dry) sudo(['rm', '-rf', '--one-file-system', c.root]);
      return [`${c.root} supprimé (versions, .env, données).`];
    },
  },
  {
    id: 'conf', label: 'Ligne sites.conf',
    async plan(c) { return [`sites.conf : « ${c.id} -socle:${SOCLE_NAME} ${c.port} ${c.branch} » (sauvegarde avant, commit du seul fichier sur v2).`]; },
    done: (c) => confLines().some((l) => l.name === c.id),
    async apply(c, st) {
      const bk = backup(CONF, 'avant-usine');
      const txt = fs.readFileSync(CONF, 'utf8');
      const line = `${c.id.padEnd(16)} ${`-socle:${SOCLE_NAME}`.padEnd(47)} ${String(c.port).padEnd(6)} ${c.branch}`;
      fs.writeFileSync(CONF, `${txt.replace(/\n*$/, '\n')}${line}\n`);
      st.created = true; save(c.s);
      say(`  Ligne ajoutée (sauvegarde ${bk}).`);
      confCommit(`chore(sites): add ${c.id} (usine, port ${c.port}, preproduction)`);
    },
    async undo(c, st, dry) {
      if (!st.created || !confLines().some((l) => l.name === c.id)) return [];
      if (!dry) {
        const bk = backup(CONF, 'avant-retrait');
        fs.writeFileSync(CONF, fs.readFileSync(CONF, 'utf8').split('\n').filter((l) => l.trim().split(/\s+/)[0] !== c.id).join('\n'));
        say(`  sites.conf sauvegardé (${bk}).`);
        confCommit(`chore(sites): remove ${c.id} (usine rollback)`);
      }
      return [`Ligne ${c.id} retirée de sites.conf.`];
    },
  },
  {
    id: 'caddy', label: 'Bloc Caddy de préproduction',
    async plan(c) { return [`${c.caddyFile} : ${c.sslip ? '' : `www.${c.domain} → ${c.domain}, `}${c.domain} avec le mot de passe des maquettes et X-Robots-Tag noindex → 127.0.0.1:${c.port}. Sauvegarde du Caddyfile, caddy validate, puis rechargement.`]; },
    done: (c) => fs.existsSync(c.caddyFile),
    async apply(c, st) {
      ensureCaddyImport();
      backup(CADDYFILE, `avant-usine-${c.id}`);
      writeRoot(c.caddyFile, caddyBlock(c, 'staging'));
      st.created = true; save(c.s);
      try { caddyReload(); } catch (e) { sudo(['rm', '-f', c.caddyFile]); st.created = false; throw e; }
      say(`  ${c.caddyFile} écrit, configuration validée, Caddy rechargé.`);
    },
    async undo(c, st, dry) {
      if (!st.created || !fs.existsSync(c.caddyFile)) return [];
      if (!dry) { backup(CADDYFILE, `avant-retrait-${c.id}`); backup(c.caddyFile, 'avant-retrait'); sudo(['rm', '-f', c.caddyFile]); caddyReload(); }
      return [`${c.caddyFile} supprimé, Caddy validé et rechargé.`];
    },
  },
  {
    id: 'service', label: 'Service du site',
    async plan(c) { return [`systemctl enable site@${c.id} (démarré par le premier déploiement).`]; },
    done: (c) => run('systemctl', ['is-enabled', `site@${c.id}`], { ok: [0, 1] }).trim() === 'enabled',
    async apply(c, st) { sudo(['systemctl', 'enable', `site@${c.id}`]); st.created = true; say(`  site@${c.id} activé au démarrage.`); },
    async undo(c, st, dry) {
      const out = [];
      for (const t of [`dest-flights@${c.id}.timer`, `dest-alerts@${c.id}.timer`]) if (run('systemctl', ['is-enabled', t], { ok: [0, 1] }).trim() === 'enabled') { if (!dry) sudo(['systemctl', 'disable', '--now', t]); out.push(`${t} arrêté.`); }
      if (!st.created) return out;
      if (!dry) { sudo(['systemctl', 'disable', '--now', `site@${c.id}`], { ok: [0, 1, 5] }); sudo(['systemctl', 'reset-failed', `site@${c.id}`], { ok: [0, 1, 5] }); }
      return [...out, `site@${c.id} arrêté et désactivé.`];
    },
  },
  {
    id: 'deploy', label: 'Premier déploiement',
    async plan(c) { return [`bash -euo pipefail deploy-local.sh ${c.id} : build Next (SITE_DEST=${c.id}) dans la file d’attente commune, node_modules repris d’un site du socle si package-lock identique, puis démarrage de site@${c.id}. Quelques minutes.`]; },
    done: (c) => fs.existsSync(`${c.root}/current`) && c.s.steps.deploy?.status === 'done',
    async apply(c, st) { await streamCmd('bash', ['-euo', 'pipefail', DEPLOY, c.id, '--force']); st.data = { release: path.basename(fs.realpathSync(`${c.root}/current`)) }; },
    undo: () => [],
  },
  {
    id: 'verify', label: 'Contrôle de la préproduction',
    async plan(c) { return [`Contrôles : http://127.0.0.1:${c.port}/ répond 200 avec « ${c.p.name} », robots.txt fermé, en-tête noindex ; https://${c.domain}/ demande le mot de passe (401), certificat HTTPS valide.`]; },
    done: () => false,
    async apply(c, st) {
      const local = await waitFor(async () => { const r = await fetch(`http://127.0.0.1:${c.port}/`, { signal: AbortSignal.timeout(10_000) }); const b = await r.text(); return { ok: r.status === 200 && b.includes(c.p.name), why: `HTTP ${r.status}`, noindex: /noindex/.test(r.headers.get('x-robots-tag') ?? '') && /noindex/.test(b) }; }, 90);
      if (!local.ok) throw new Error(`Le site ne répond pas sur le port ${c.port} (${local.why}).`);
      say(`  Local : 200, nom présent, noindex ${local.noindex ? 'oui' : 'NON'}.`);
      const robots = await (await fetch(`http://127.0.0.1:${c.port}/robots.txt`)).text();
      if (!/Disallow: \/\s*$/m.test(robots)) throw new Error('robots.txt n’est pas fermé en préproduction.');
      say('  robots.txt : Disallow: /');
      const pub = await waitFor(async () => { const r = await fetch(`https://${c.domain}/`, { redirect: 'manual', signal: AbortSignal.timeout(15_000) }); return { ok: r.status === 401, why: `HTTP ${r.status}` }; }, 120, 5);
      if (!pub.ok) throw new Error(`https://${c.domain}/ ne demande pas le mot de passe (${pub.why}).`);
      say(`  https://${c.domain}/ : 401, mot de passe demandé, certificat valide.`);
      if (!local.noindex) throw new Error('En-tête ou balise noindex absente.');
      st.data = { at: now() };
    },
    undo: () => [],
  },
];

async function cfUndo(st, dry) {
  const out = [];
  for (const r of st.data?.records ?? []) {
    if (!dry) { try { await cf('DELETE', `/zones/${st.data.zone}/dns_records/${r.id}`); } catch (e) { if (!/not found|81044|1032/i.test(e.message)) throw e; } }
    out.push(`Cloudflare : ${r.type} ${r.name} supprimé.`);
  }
  return out;
}
function migrations(c) {
  const ref = git(['rev-parse', '--verify', '-q', c.branch], { ok: [0, 1] }).trim() ? c.branch : SOCLE_MAIN;
  const txt = git(['show', `${ref}:scripts/usine/migrate.sh`]);
  const list = (/\|\| FILES=\(([^)]*)\)/.exec(txt)?.[1] ?? '').split(/\s+/).filter(Boolean);
  if (!list.length) throw new Error('Liste des schémas introuvable dans scripts/usine/migrate.sh.');
  const all = git(['ls-tree', '--name-only', `${ref}:db`]).split('\n');
  if (all.includes('dest-account.sql') && !list.includes('dest-account')) list.push('dest-account');
  return list;
}
const today = () => new Date().toLocaleDateString('fr-CA', { timeZone: 'Europe/Brussels' });

function humanActions(c) {
  if (c.sslip) return ['Aucune : domaine d’essai, ni e-mail ni DNS.'];
  return [
    `Cloudflare Email Routing : envoyer contact@${c.domain} vers ${OWNER_GMAIL} (Cloudflare → ${c.domain} → Email → Email Routing). La clé du serveur n’a pas ce droit.`,
    'Travelpayouts (facultatif) : projet dédié (trs) pour séparer les revenus ; le sub_id est déjà posé sur chaque lien.',
    'Relire les pages avant l’ouverture (préproduction protégée par le mot de passe des maquettes).',
  ];
}

// --- Ouverture au public ----------------------------------------------------

const OPEN = [
  { id: 'env', plan: (c) => `.env : STAGING=1 → 0, MAIL_MODE=test → live (sauvegarde avant).`, async apply(c) {
    const file = `${c.root}/shared/.env`;
    fs.copyFileSync(file, path.join(STATE_DIR, c.id, `env.avant-ouverture-${stamp()}`));
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^STAGING=.*$/m, 'STAGING=0').replace(/^MAIL_MODE=.*$/m, 'MAIL_MODE=live'));
    say('  STAGING=0, MAIL_MODE=live.');
  } },
  { id: 'caddy', plan: (c) => `${c.caddyFile} : bloc public (sans mot de passe ni noindex), caddy validate, rechargement.`, async apply(c) {
    backup(c.caddyFile, 'avant-ouverture'); const old = fs.readFileSync(c.caddyFile, 'utf8');
    writeRoot(c.caddyFile, caddyBlock(c, 'public'));
    try { caddyReload(); } catch (e) { writeRoot(c.caddyFile, old); throw e; }
    say('  Caddy : bloc public en service.');
  } },
  { id: 'deploy', plan: (c) => `Nouveau build (robots.txt et en-têtes lus au build) : deploy-local.sh ${c.id} --force.`, async apply(c) { await streamCmd('bash', ['-euo', 'pipefail', DEPLOY, c.id, '--force']); } },
  { id: 'verify', plan: (c) => `Contrôles : https://${c.domain}/ 200 sans mot de passe, pas de noindex, robots.txt avec Sitemap, sitemap.xml 200.`, async apply(c) {
    const r = await waitFor(async () => { const x = await fetch(`https://${c.domain}/`, { signal: AbortSignal.timeout(15_000) }); return { ok: x.status === 200 && !/noindex/.test(x.headers.get('x-robots-tag') ?? ''), why: `HTTP ${x.status}` }; }, 90);
    if (!r.ok) throw new Error(`https://${c.domain}/ n’est pas ouvert (${r.why}).`);
    const robots = await (await fetch(`https://${c.domain}/robots.txt`)).text();
    if (!/Sitemap:/.test(robots)) throw new Error('robots.txt sans Sitemap.');
    const sm = await fetch(`https://${c.domain}/sitemap.xml`);
    if (sm.status !== 200) throw new Error(`sitemap.xml : HTTP ${sm.status}.`);
    say('  Ouvert : 200, sans noindex, robots.txt et sitemap.xml en place.');
  } },
];
const openHuman = (c) => [
  `Google Search Console : ajouter la propriété « Domaine » ${c.domain} ; Google donne un enregistrement TXT à poser dans Cloudflare (le donner à Claude), puis envoyer https://${c.domain}/sitemap.xml.`,
  'Bing Webmaster Tools : « Importer depuis Google Search Console ».',
  `Vérifier que contact@${c.domain} arrive bien sur ${OWNER_GMAIL} (Email Routing).`,
];

// --- Commandes --------------------------------------------------------------

async function cmdPlan(id) {
  const raw = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
  const p = validate({ ...raw, id });
  let s = load(id);
  if (s && Object.values(s.steps ?? {}).some((x) => x.created)) throw new Human(`« ${id} » est déjà en cours de création : ouvre sa fiche pour reprendre ou revenir en arrière.`);
  s = { id, origin: 'usine', phase: 'draft', params: p, port: s?.port && s.params?.id === id ? s.port : freePort(), created: now(), steps: {}, open: {} };
  const c = ctxOf(s);
  const plan = [];
  for (const st of STEPS) {
    let lines;
    try { lines = await st.plan(c); } catch (e) { if (e instanceof Human) return out({ ok: false, error: e.message }); throw e; }
    plan.push({ id: st.id, label: st.label, lines: lines ?? ['Sauté : domaine d’essai (sslip.io).'], skipped: lines === null });
  }
  s.plan = plan; s.human = humanActions(c);
  fs.mkdirSync(dirOf(id), { recursive: true, mode: 0o750 });
  save(s);
  CUR = id; say(`Essai à blanc préparé pour ${p.name} (${p.domain}), port ${s.port}.`);
  return out({ ok: true, plan, human: s.human, port: s.port, params: p });
}

async function cmdApply(id) {
  const s = load(id);
  if (!s || s.origin !== 'usine') throw new Human('Fais d’abord l’essai à blanc.');
  if (['removed', 'removing'].includes(s.phase)) throw new Human('Ce site est en cours de retrait.');
  lock(id); CUR = id;
  s.phase = 'creating'; s.error = null; save(s);
  say(`=== Création de ${s.params.name} (${id}) ===`);
  const c = ctxOf(s);
  for (const def of STEPS) {
    const st = step(s, def.id);
    if (st.status === 'done' || st.status === 'skipped') continue;
    say(`→ ${def.label}`);
    st.status = 'running'; st.at = now(); save(s);
    try {
      await def.apply(c, st);
      if (st.status === 'running') st.status = 'done';
      if (st.note) say(`  ${st.note}`);
      st.at = now(); save(s);
    } catch (e) {
      st.status = e instanceof Human ? 'human' : 'error'; st.note = scrub(e.message); st.at = now();
      s.phase = 'error'; s.error = `${def.label} : ${st.note}`; save(s);
      say(`✗ ${st.note}`);
      say('Arrêté. « Reprendre » repart de cette étape ; « Retour arrière » supprime ce qui a été créé.');
      process.exitCode = 1; return;
    }
  }
  s.phase = 'ready'; s.ready = now(); save(s);
  say(`✓ ${s.params.name} est en préproduction : https://${s.params.domain}/ (mot de passe des maquettes).`);
  for (const h of s.human ?? []) say(`  À faire par toi : ${h}`);
}

async function cmdUndo(id, dry) {
  const s = load(id);
  if (!s || s.origin !== 'usine') throw new Human(`« ${id} » n’a pas été créé par l’assistant : aucun retour arrière possible ici.`);
  if (PROTECTED.has(id)) throw new Human('Site protégé.');
  if (!dry) { lock(id); CUR = id; s.phase = 'removing'; save(s); say(`=== Retour arrière de ${s.params.name} (${id}) ===`); }
  const c = ctxOf(s);
  const lines = [];
  for (const def of [...STEPS].reverse()) {
    const st = s.steps[def.id];
    if (!st) continue;
    try {
      const l = await def.undo(c, st, dry);
      lines.push(...l);
      if (!dry) { for (const x of l) say(`  ${x}`); st.status = 'removed'; st.created = false; save(s); }
    } catch (e) {
      if (dry) { lines.push(`${def.label} : ${e.message}`); continue; }
      s.phase = 'error'; s.error = `Retour arrière, ${def.label} : ${scrub(e.message)}`; save(s);
      say(`✗ ${s.error}`); process.exitCode = 1; return;
    }
  }
  if (dry) return out({ ok: true, lines: lines.length ? lines : ['Rien n’a encore été créé : seul le brouillon est effacé.'] });
  s.phase = 'removed'; s.removed = now(); save(s);
  say('✓ Retour arrière terminé : plus rien de ce site sur le serveur.');
  CUR = null;
  const arch = path.join(STATE_DIR, '_archive', `${id}-${stamp()}`);
  fs.mkdirSync(path.dirname(arch), { recursive: true });
  fs.rmSync(path.join(dirOf(id), 'lock'), { force: true });
  fs.renameSync(dirOf(id), arch);
  process.stdout.write(`Journal et état archivés : ${arch}\n`);
}

async function cmdOpen(id, dry) {
  const s = load(id);
  if (!s || s.origin !== 'usine') throw new Human(`« ${id} » n’a pas été créé par l’assistant : ouverture à faire à la main.`);
  const c = ctxOf(s);
  if (c.sslip) throw new Human('Un domaine d’essai (sslip.io) reste en préproduction.');
  if (s.phase !== 'ready' && s.phase !== 'opening' && !(s.phase === 'error' && s.open?.error)) throw new Human('Le site doit d’abord être prêt en préproduction.');
  if (dry) return out({ ok: true, lines: OPEN.map((o) => o.plan(c)), human: openHuman(c) });
  lock(id); CUR = id; s.phase = 'opening'; s.open = s.open ?? {}; s.open.error = null; save(s);
  say(`=== Ouverture au public de ${s.params.name} ===`);
  for (const o of OPEN) {
    if (s.open[o.id] === 'done') continue;
    say(`→ ${o.plan(c)}`);
    try { await o.apply(c); s.open[o.id] = 'done'; save(s); } catch (e) { s.phase = 'error'; s.open.error = scrub(e.message); s.error = `Ouverture : ${s.open.error}`; save(s); say(`✗ ${s.open.error}`); process.exitCode = 1; return; }
  }
  s.phase = 'public'; s.opened = now(); s.human = openHuman(c); save(s);
  say(`✓ ${s.params.name} est ouvert au public : https://${c.domain}/`);
  for (const h of s.human) say(`  À faire par toi : ${h}`);
}

// Contrôles en lecture : dest:check et parité dans la version en ligne, Brevo et DNS si domaine réel.
async function cmdCheck(id) {
  const site = confLines().find((l) => l.name === id);
  if (!site) throw new Human('Site inconnu.');
  const env = readEnv(`/srv/sites/${id}/shared/.env`);
  const dest = env.get('SITE_DEST') ?? 'japon';
  const cur = `/srv/sites/${id}/current`;
  const res = { at: now(), dest };
  fs.mkdirSync(dirOf(id), { recursive: true, mode: 0o750 });
  const r = spawnSync('node_modules/.bin/tsx', ['--conditions=react-server', 'scripts/usine/dest-check.ts', dest], { cwd: cur, encoding: 'utf8', env: { ...process.env, SITE_DEST: dest === 'japon' ? '' : dest }, timeout: 240_000 });
  const txt = `${r.stdout}\n${r.stderr}`;
  const last = txt.split('\n').reverse().find((l) => /^[✓✗] /.test(l)) ?? (r.error ? r.error.message : txt.trim().split('\n').pop());
  res.destCheck = { ok: r.status === 0, line: scrub(last ?? '').slice(0, 300), errors: Number(/(\d+) erreur/.exec(last ?? '')?.[1] ?? (r.status === 0 ? 0 : NaN)), warnings: Number(/(\d+) signalement/.exec(last ?? '')?.[1] ?? 0), missingImages: Number(/Images manquantes \((\d+)\)/.exec(txt)?.[1] ?? 0), zones: Number(/: (\d+) zone/.exec(txt)?.[1] ?? 0) };
  if (dest !== 'japon') {
    const outDir = path.join(dirOf(id), 'parity');
    const pr = spawnSync('node', ['scripts/usine/parity.cjs', dest, '--base', `http://127.0.0.1:${site.port}`, '--no-shots', '--out', outDir], { cwd: cur, encoding: 'utf8', timeout: 300_000 });
    res.parity = parityOf(path.join(outDir, 'report.json')) ?? { ok: false, line: scrub((pr.stderr || pr.stdout || '').trim().split('\n').pop() ?? '').slice(0, 200) };
    res.parity.code = pr.status;
  }
  const url = env.get('SITE_URL') ?? '';
  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (domain && !isSslip(domain)) {
    try { const a = await dns.resolve4(domain); res.dns = { ok: a.includes(SERVER_IP), a }; } catch (e) { res.dns = { ok: false, a: [], why: e.code }; }
    try {
      const d = await brevo('GET', `/senders/domains/${domain}`);
      const senders = (await brevo('GET', '/senders'))?.senders ?? [];
      res.brevo = { domain: Boolean(d), authenticated: Boolean(d?.authenticated), sender: senders.some((x) => x.email === env.get('MAIL_SENDER')), list: env.get('BREVO_LIST_ID') ?? null };
    } catch (e) { res.brevo = { error: scrub(e.message) }; }
  }
  fs.writeFileSync(path.join(dirOf(id), 'checks.json'), `${JSON.stringify(res, null, 1)}\n`);
  out(res);
}
/** Texte du bloc Caddy d'un hôte (de « hôte { » jusqu'à l'accolade fermante en début de ligne). */
function blockOf(caddy, host) {
  const i = caddy.search(new RegExp(`(^|\\n)${host.replace(/\./g, '\\.')} \\{`));
  if (i < 0) return '';
  const rest = caddy.slice(i + 1);
  const end = rest.search(/\n\}/);
  return end < 0 ? rest : rest.slice(0, end);
}
function parityOf(file) {
  try {
    const rep = JSON.parse(fs.readFileSync(file, 'utf8'));
    let types = 0, rows = 0, ok = 0, absent = 0;
    for (const v of Object.values(rep)) { if (!v || typeof v !== 'object') continue; if (!Array.isArray(v.rows)) { absent++; continue; } types++; rows += v.rows.length; ok += v.rows.filter((x) => x.ok).length; }
    return { ok: rows > 0 && ok === rows, types, rows, okRows: ok, absent, at: fs.statSync(file).mtime.toISOString() };
  } catch { return null; }
}

// État de tous les sites de l'usine : sites.conf « -socle: », états de l'assistant, sondes locales (rien d'écrit).
async function cmdStatus() {
  const conf = confLines().filter((l) => l.repo?.startsWith('-socle:'));
  const ids = new Set(conf.map((l) => l.name));
  try { for (const d of fs.readdirSync(STATE_DIR)) if (!d.startsWith('_') && d !== 'backups' && fs.existsSync(stateFile(d))) ids.add(d); } catch { /* pas encore d'état */ }
  const dbs = new Set(psql('SELECT datname FROM pg_database').split('\n'));
  const roles = new Set(psql('SELECT rolname FROM pg_roles').split('\n'));
  const caddy = fs.readFileSync(CADDYFILE, 'utf8') + (fs.existsSync(CADDY_DIR) ? fs.readdirSync(CADDY_DIR).map((f) => fs.readFileSync(path.join(CADDY_DIR, f), 'utf8')).join('\n') : '');
  const imgLog = fs.existsSync(IMG_LOG) ? fs.readFileSync(IMG_LOG, 'utf8').split('\n').map((l) => l.split('\t')[1]) : [];
  const capsTxt = git(['show', `${SOCLE_MAIN}:scripts/usine/gen-image.mjs`], { ok: [0, 128], quiet: true }) ?? '';
  const caps = Object.fromEntries([...(/const CAPS = \{([^}]*)\}/.exec(capsTxt)?.[1] ?? '').matchAll(/([a-z0-9-]+): (\d+)/g)].map((m) => [m[1], Number(m[2])]));
  const sites = [];
  for (const id of ids) {
    const line = conf.find((l) => l.name === id);
    const s = load(id);
    const root = `/srv/sites/${id}`;
    const env = fs.existsSync(`${root}/shared/.env`) ? readEnv(`${root}/shared/.env`) : new Map();
    const dest = env.get('SITE_DEST') ?? (line ? 'japon' : s?.params?.id);
    const url = env.get('SITE_URL') ?? (s ? `https://${s.params.domain}` : null);
    const domain = url?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') ?? null;
    let release = null;
    try { const real = fs.realpathSync(`${root}/current`); release = { sha: path.basename(real), at: fs.statSync(real).mtime.toISOString() }; } catch { /* pas encore déployé */ }
    const unit = (u) => run('systemctl', ['is-active', u], { ok: [0, 3, 4] }).trim();
    const enabled = (u) => run('systemctl', ['is-enabled', u], { ok: [0, 1] }).trim();
    const db = dbName(id === 'ambiance-japon' ? 'aj' : id);
    const hosts = (domain ? [domain] : []).concat(isSslip(domain ?? '') || id === 'ambiance-japon' ? [] : [`${id}.85-190-127-13.sslip.io`]);
    const caddyHosts = hosts.filter((h) => blockOf(caddy, h));
    const facts = {
      db: dbs.has(db), role: roles.has(db), env: env.size > 0, port: env.get('PORT') ?? line?.port ?? null, service: unit(`site@${id}`), serviceEnabled: enabled(`site@${id}`),
      caddy: caddyHosts, password: caddyHosts.length > 0 && caddyHosts.every((h) => /basicauth/.test(blockOf(caddy, h))), noindexCaddy: caddyHosts.length > 0 && caddyHosts.every((h) => /X-Robots-Tag "noindex/.test(blockOf(caddy, h))),
      subId: env.get('TRAVELPAYOUTS_SUB_ID') ?? null, mailMode: env.get('MAIL_MODE') ?? (env.get('AJ_EMAIL_SENDING') ? `AJ_EMAIL_SENDING=${env.get('AJ_EMAIL_SENDING')}` : null),
      mailSender: env.get('MAIL_SENDER') ?? null, brevoList: env.get('BREVO_LIST_ID') ?? null,
      timers: ['dest-flights', 'dest-alerts'].filter((t) => enabled(`${t}@${id}.timer`) === 'enabled'),
    };
    let checks = null; try { checks = JSON.parse(fs.readFileSync(path.join(dirOf(id), 'checks.json'), 'utf8')); } catch { /* jamais contrôlé */ }
    const parity = checks?.parity ?? (dest && dest !== 'japon' ? parityOf(`/var/www/toutou-maquettes/usine-parite/${dest}/report.json`) : null);
    const branchRef = line?.branch ?? (s?.params ? `usine/${id}` : null);
    let behind = null; try { behind = Number(git(['rev-list', '--count', `${branchRef}..${SOCLE_MAIN}`]).trim()); } catch { /* branche absente */ }
    const staging = env.get('STAGING') === '1';
    let contentCount = null;
    if (release) try { contentCount = ['guides', 'articles', 'pages'].reduce((n, k) => { const d = path.join(root, 'current', 'destinations', dest, 'content', k); return n + (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith('.md')).length : 0); }, 0); } catch { /* */ }
    sites.push({
      id, dest, name: s?.params?.name ?? MANUAL[id]?.name ?? id, domain, url, staging: env.size ? staging : null, origin: s?.origin ?? 'manual', manual: MANUAL[id]?.note ?? null,
      phase: s?.phase ?? (line ? (staging ? 'ready' : 'public') : null), error: s?.error ?? null, branch: line?.branch ?? null, behind, release, facts, checks, parity,
      images: dest === 'japon' ? null : { used: imgLog.filter((w) => w === `usine-${dest}`).length, cap: caps[dest] ?? 0 },
      content: contentCount,
      pipeline: dest === 'japon' ? null : {
        donnees: checks?.destCheck ? (checks.destCheck.ok ? 'ok' : 'ko') : 'unknown',
        images: checks?.destCheck ? (checks.destCheck.ok && checks.destCheck.missingImages === 0 ? 'ok' : 'ko') : 'unknown',
        contenu: contentCount ? 'ok' : contentCount === 0 ? 'ko' : 'unknown',
        ouverture: env.size ? (staging ? 'ko' : 'ok') : 'unknown',
      },
      steps: s?.steps ?? null, plan: s?.plan ?? null, human: s?.human ?? null, open: s?.open ?? null, port: s?.port ?? line?.port ?? null, params: s?.params ?? null,
      running: run('systemctl', ['is-active', `usine-${id}.service`], { ok: [0, 3, 4] }).trim() === 'active',
    });
  }
  const order = (x) => (x.id === 'ambiance-japon' ? 0 : x.origin === 'manual' ? 1 : 2);
  sites.sort((a, b) => order(a) - order(b) || a.id.localeCompare(b.id));
  out({ sites, at: now() });
}

function out(x) { process.stdout.write(`${JSON.stringify(x)}\n`); }

const [verb, id, ...rest] = process.argv.slice(2);
const dry = rest.includes('--dry');
const ID_RE = /^[a-z][a-z0-9-]{1,23}$/;
try {
  fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o750 });
  if (verb !== 'status' && !ID_RE.test(id ?? '')) throw new Human('Identifiant invalide.');
  if (verb === 'plan') await cmdPlan(id);
  else if (verb === 'apply') await cmdApply(id);
  else if (verb === 'undo') await cmdUndo(id, dry);
  else if (verb === 'open') await cmdOpen(id, dry);
  else if (verb === 'check') await cmdCheck(id);
  else if (verb === 'status') await cmdStatus();
  else throw new Human('Usage : new-site.mjs plan|apply|undo|open|check|status <id> [--dry]');
} catch (e) {
  const msg = scrub(e.message);
  if (CUR) say(`✗ ${msg}`);
  if (verb === 'plan' || dry || verb === 'status' || verb === 'check') out({ ok: false, error: msg });
  else process.stderr.write(`${msg}\n`);
  process.exitCode = e instanceof Human ? 3 : 1;
}
