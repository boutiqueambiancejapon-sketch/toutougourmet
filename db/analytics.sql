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
