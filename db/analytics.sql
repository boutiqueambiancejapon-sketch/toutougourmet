-- @cdc mesure — schéma du tableau de bord maison. Idempotent : se relance sans risque.
-- Appliquer : sudo -u postgres psql -d toutou -f db/analytics.sql
-- Vie privée : aucun cookie, aucune IP de visiteur humain stockée. L'IP n'est gardée que
-- pour les robots, afin de repérer ceux qui usurpent le nom d'un robot connu.

CREATE SCHEMA IF NOT EXISTS analytics AUTHORIZATION toutou;

-- Actions des visiteurs envoyées par le site (lib/analytics.ts → POST /api/e).
CREATE TABLE IF NOT EXISTS analytics.events (
  id       bigserial PRIMARY KEY,
  ts       timestamptz NOT NULL DEFAULT now(),
  name     text NOT NULL,
  page     text NOT NULL,
  props    jsonb NOT NULL DEFAULT '{}'::jsonb,
  ref_host text,
  device   text
);
CREATE INDEX IF NOT EXISTS events_ts_idx ON analytics.events (ts);
CREATE INDEX IF NOT EXISTS events_name_ts_idx ON analytics.events (name, ts);

-- Requêtes lues dans les journaux de Caddy (scripts/ingest-caddy-logs.mjs).
-- kind : human | ai_training | ai_search | ai_user | search | seo | bot
CREATE TABLE IF NOT EXISTS analytics.hits (
  id          bigserial PRIMARY KEY,
  ts          timestamptz NOT NULL,
  host        text NOT NULL,
  method      text NOT NULL,
  path        text NOT NULL,
  status      integer NOT NULL,
  bytes       integer,
  duration_ms integer,
  kind        text NOT NULL,
  bot         text,
  operator    text,
  device      text,
  ref_host    text,
  ref_ai      text,
  ip          inet,
  ua          text
);
CREATE INDEX IF NOT EXISTS hits_ts_idx ON analytics.hits (ts);
CREATE INDEX IF NOT EXISTS hits_kind_ts_idx ON analytics.hits (kind, ts);
CREATE INDEX IF NOT EXISTS hits_bot_ts_idx ON analytics.hits (bot, ts) WHERE bot IS NOT NULL;

-- Position de lecture de chaque source (curseur journald).
CREATE TABLE IF NOT EXISTS analytics.ingest_state (
  source     text PRIMARY KEY,
  cursor     text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analytics.events OWNER TO toutou;
ALTER TABLE analytics.hits OWNER TO toutou;
ALTER TABLE analytics.ingest_state OWNER TO toutou;

-- Rôle du compte administrator (préversion et ingestion tant que le site n'a pas basculé).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'administrator') THEN
    CREATE ROLE administrator LOGIN;
  END IF;
END $$;
GRANT CONNECT ON DATABASE toutou TO administrator;
GRANT USAGE ON SCHEMA analytics TO administrator;
GRANT SELECT, INSERT, DELETE ON ALL TABLES IN SCHEMA analytics TO administrator;
GRANT UPDATE ON analytics.ingest_state TO administrator;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA analytics TO administrator;

-- Messages du formulaire de contact (app/api/contact → tableau de bord, section « Messages »).
-- Aucune IP stockée : la limite de débit reste en mémoire dans la route.
CREATE TABLE IF NOT EXISTS analytics.contact_messages (
  id      bigserial PRIMARY KEY,
  ts      timestamptz NOT NULL DEFAULT now(),
  name    text NOT NULL,
  email   text NOT NULL,
  message text NOT NULL,
  page    text,
  handled boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS contact_messages_handled_ts_idx ON analytics.contact_messages (handled, ts DESC);
ALTER TABLE analytics.contact_messages OWNER TO toutou;
GRANT SELECT, INSERT, UPDATE ON analytics.contact_messages TO administrator;
GRANT USAGE ON SEQUENCE analytics.contact_messages_id_seq TO administrator;

-- Pays du visiteur (code ISO à 2 lettres), déduit de l'IP au moment de la visite avec une base
-- locale (DB-IP country lite, CC BY 4.0) ; l'IP elle-même n'est jamais enregistrée pour les humains.
ALTER TABLE analytics.events ADD COLUMN IF NOT EXISTS country char(2);
ALTER TABLE analytics.hits ADD COLUMN IF NOT EXISTS country char(2);
CREATE INDEX IF NOT EXISTS events_country_ts_idx ON analytics.events (country, ts) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS hits_country_ts_idx ON analytics.hits (country, ts) WHERE country IS NOT NULL;

-- Plafond global des lectures d'étiquette par jour (appels payants au fournisseur d'OCR) : borne
-- la facture même si des robots créent des comptes. Une ligne par jour (heure de Paris).
CREATE TABLE IF NOT EXISTS analytics.scanner_daily (
  day   date PRIMARY KEY,
  calls integer NOT NULL DEFAULT 0
);
ALTER TABLE analytics.scanner_daily OWNER TO toutou;
GRANT SELECT, INSERT, UPDATE ON analytics.scanner_daily TO administrator;

-- Emplacement d'où vient chaque compte (invitation « Créer un compte », lib/signup-places.ts).
-- Pont entre la création du compte et la confirmation de l'e-mail : lu une fois à la confirmation.
-- Aucune IP, aucun e-mail : l'identifiant du compte et un code d'emplacement. Part avec le compte
-- (clé étrangère ajoutée seulement si le schéma des comptes est déjà migré).
CREATE TABLE IF NOT EXISTS analytics.signup_sources (
  user_id    text PRIMARY KEY,
  place      text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics.signup_sources ADD COLUMN IF NOT EXISTS last_return date;
DO $$ BEGIN
  IF to_regclass('app.user') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'signup_sources_user_fk'
  ) THEN
    ALTER TABLE analytics.signup_sources
      ADD CONSTRAINT signup_sources_user_fk FOREIGN KEY (user_id) REFERENCES app."user"(id) ON DELETE CASCADE;
  END IF;
END $$;
ALTER TABLE analytics.signup_sources OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.signup_sources TO administrator;
CREATE INDEX IF NOT EXISTS events_account_place_idx ON analytics.events ((props->>'place'), ts)
  WHERE name IN ('Account Invite View', 'Account Invite Click', 'Account Created', 'Account Verified');

-- E-mail du guide « Le guide de la gamelle » : une seule fois par adresse (lib/server/guide-email.ts).
-- Empreinte HMAC-SHA256 de l'adresse en minuscules, jamais l'adresse elle-même.
CREATE TABLE IF NOT EXISTS analytics.guide_sends (
  email_hash text PRIMARY KEY,
  sent_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics.guide_sends OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.guide_sends TO administrator;

-- Suite de bienvenue (J2, J7 sous le code j5, J10, rappels plus bas) : une ligne par étape partie et par adresse
-- (scripts/welcome-sequence.ts). Empreinte HMAC-SHA256 de l'adresse en minuscules, même calcul que
-- guide_sends, jamais l'adresse elle-même. Posée avant l'envoi, retirée si l'envoi échoue.
CREATE TABLE IF NOT EXISTS analytics.welcome_sends (
  email_hash text NOT NULL,
  step       text NOT NULL CHECK (step IN ('j2', 'j5', 'j10')),
  sent_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (email_hash, step)
);
CREATE INDEX IF NOT EXISTS welcome_sends_sent_at_idx ON analytics.welcome_sends (sent_at);
ALTER TABLE analytics.welcome_sends OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.welcome_sends TO administrator;

-- Nouvelles étapes de la suite : compte-j4 (créer un compte), chien-j1 et chien-j4 (ajouter son
-- chien). Le code j5 reste celui de l'offre, partie au jour 7 depuis le 2026-11 : aucune ligne à
-- réécrire, une adresse qui a déjà reçu j5 ne le reçoit pas une seconde fois.
ALTER TABLE analytics.welcome_sends DROP CONSTRAINT IF EXISTS welcome_sends_step_check;
ALTER TABLE analytics.welcome_sends ADD CONSTRAINT welcome_sends_step_check
  CHECK (step IN ('j2', 'j5', 'j10', 'compte-j4', 'chien-j1', 'chien-j4', 'confirmation-rappel'));

-- Journal des e-mails individuels (lib/server/email-log.ts) : qui a reçu quoi et quand, vu dans le
-- tableau de bord (Conversions, Adresses inscrites, Envois). Empreinte HMAC-SHA256 de l'adresse en
-- minuscules, même calcul que guide_sends, jamais l'adresse : une fois le contact supprimé, plus
-- rien dans la base ne relie ces lignes à une adresse en clair. Purge après 24 mois (toutou-purge).
-- state : sent | failed | simulated (MAIL_LOG_ONLY, rien n'est parti).
CREATE TABLE IF NOT EXISTS analytics.email_log (
  id         bigserial PRIMARY KEY,
  email_hash text NOT NULL,
  kind       text NOT NULL,
  subject    text NOT NULL,
  state      text NOT NULL CHECK (state IN ('sent', 'failed', 'simulated')),
  sent_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_log_hash_sent_at_idx ON analytics.email_log (email_hash, sent_at DESC);
CREATE INDEX IF NOT EXISTS email_log_sent_at_idx ON analytics.email_log (sent_at);
ALTER TABLE analytics.email_log OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.email_log TO administrator;
GRANT USAGE ON SEQUENCE analytics.email_log_id_seq TO administrator;

-- Désinscriptions faites par notre lien (lib/server/email-optouts.ts) : une adresse présente ici
-- ne reçoit plus ni la suite ni les rappels de compte, même sans figurer dans la liste Brevo.
-- Empreinte seulement, gardée sans limite de durée : elle prouve l'opposition et la fait respecter.
CREATE TABLE IF NOT EXISTS analytics.email_optouts (
  email_hash text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics.email_optouts OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.email_optouts TO administrator;

-- Visites à ne pas compter (lib/server/analytics-ignore.ts, scripts/ingest-caddy-logs.mjs) : adresses
-- du moment du propriétaire, posées quand il s'identifie au tableau de bord ou que son cookie est vu
-- sur le site. Empreinte SHA-256 salée ligne par ligne, jamais l'adresse (IPv6 : le /64). Valable
-- 12 h, prolongée s'il reste actif ; les lignes expirées sont retirées par l'ingestion.
CREATE TABLE IF NOT EXISTS analytics.ignored_ips (
  hash       text PRIMARY KEY,
  salt       text NOT NULL,
  expires_at timestamptz NOT NULL
);
ALTER TABLE analytics.ignored_ips OWNER TO toutou;
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics.ignored_ips TO administrator;

-- Visiteur du jour (lib/server/visitor-id.ts) : empreinte à sel quotidien jamais écrit, sans adresse ni cookie.
ALTER TABLE analytics.events ADD COLUMN IF NOT EXISTS visitor text;
-- Journal du scanner (lib/server/scanner-events.ts) : une ligne par scan, réussi ou non, vue dans le
-- tableau de bord (Contenu, Santé du scanner). Date, type, résultat, compte et fiche quand il y en a.
-- Ni IP, ni texte d'erreur, ni photo : result vient d'une liste fermée (lib/scanner/scanner-events.ts).
-- Une suppression de compte ou de fiche efface le lien, la ligne reste comme simple compteur.
-- Purge après 90 jours (toutou-purge).
CREATE TABLE IF NOT EXISTS analytics.scanner_events (
  id               bigserial PRIMARY KEY,
  created_at       timestamptz NOT NULL DEFAULT now(),
  scan_type        text NOT NULL CHECK (scan_type IN ('code', 'photo')),
  result           text NOT NULL,
  user_id          text,
  food_analysis_id uuid
);
ALTER TABLE analytics.scanner_events DROP CONSTRAINT IF EXISTS scanner_events_result_check;
ALTER TABLE analytics.scanner_events ADD CONSTRAINT scanner_events_result_check CHECK (result IN (
  'found', 'incomplete', 'not_found', 'not_scorable', 'not_a_label', 'blurry', 'cat_food', 'timeout',
  'provider_error', 'unavailable', 'lookup_error', 'quota_reached', 'daily_cap', 'rate_limited',
  'bad_request', 'too_large', 'bad_type'
));
DO $$
BEGIN
  IF to_regclass('app."user"') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scanner_events_user_fk'
  ) THEN
    ALTER TABLE analytics.scanner_events
      ADD CONSTRAINT scanner_events_user_fk FOREIGN KEY (user_id) REFERENCES app."user"(id) ON DELETE SET NULL;
  END IF;
  IF to_regclass('app.food_analysis') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scanner_events_food_fk'
  ) THEN
    ALTER TABLE analytics.scanner_events
      ADD CONSTRAINT scanner_events_food_fk FOREIGN KEY (food_analysis_id) REFERENCES app.food_analysis(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS scanner_events_created_at_idx ON analytics.scanner_events (created_at);
CREATE INDEX IF NOT EXISTS scanner_events_user_created_idx ON analytics.scanner_events (user_id, created_at) WHERE user_id IS NOT NULL;
ALTER TABLE analytics.scanner_events OWNER TO toutou;
GRANT SELECT, INSERT, DELETE ON analytics.scanner_events TO administrator;
GRANT USAGE ON SEQUENCE analytics.scanner_events_id_seq TO administrator;

-- Assistant : plafond d'appels par jour, et questions gardées 90 jours (sans compte ni adresse) pour choisir les articles.
CREATE TABLE IF NOT EXISTS analytics.assistant_daily (day date PRIMARY KEY, calls int NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS analytics.assistant_questions (
  id          bigserial PRIMARY KEY,
  question    text NOT NULL,
  depuis_site boolean,
  articles    text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE analytics.assistant_daily OWNER TO toutou;
ALTER TABLE analytics.assistant_questions OWNER TO toutou;

-- Assistant Milo : questions par compte et par jour (limite de 5, décision du 2026-11-07). Purgé après 7 jours.
CREATE TABLE IF NOT EXISTS analytics.assistant_quota (user_id text NOT NULL, day date NOT NULL, n integer NOT NULL DEFAULT 0, PRIMARY KEY (user_id, day));
-- Suivi de Milo dans le tableau de bord (2026-11-07) : type de réponse, gravité, texte de la réponse, produits proposés.
-- kind : site | ia | contexte | sensible | echec
ALTER TABLE analytics.assistant_questions ADD COLUMN IF NOT EXISTS kind text, ADD COLUMN IF NOT EXISTS gravite text, ADD COLUMN IF NOT EXISTS reponse text, ADD COLUMN IF NOT EXISTS produits integer NOT NULL DEFAULT 0, ADD COLUMN IF NOT EXISTS lieu text;
CREATE INDEX IF NOT EXISTS assistant_questions_created_idx ON analytics.assistant_questions (created_at);

-- Acceptation des conditions générales avant la première question à Milo (2026-11-07). Effacée avec le compte.
CREATE TABLE IF NOT EXISTS analytics.assistant_cgu (user_id text PRIMARY KEY REFERENCES app."user"(id) ON DELETE CASCADE, version text NOT NULL, accepted_at timestamptz NOT NULL DEFAULT now());
