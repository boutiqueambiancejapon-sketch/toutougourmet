CREATE TABLE "app"."dashboard_backup_code" (
	"code_hash" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "app"."dashboard_device" (
	"hash" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."dashboard_login_event" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"kind" text NOT NULL,
	"outcome" text NOT NULL,
	"ip_hash" text DEFAULT '' NOT NULL,
	"device_label" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."dashboard_passkey" (
	"credential_id" text PRIMARY KEY NOT NULL,
	"public_key" text NOT NULL,
	"counter" bigint DEFAULT 0 NOT NULL,
	"transports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "app"."dashboard_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"stage" text NOT NULL,
	"password_fp" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"factor_at" timestamp with time zone,
	"factor_failures" integer DEFAULT 0 NOT NULL,
	"challenge" text,
	"challenge_at" timestamp with time zone,
	"device_label" text DEFAULT '' NOT NULL,
	CONSTRAINT "dashboard_session_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "app"."dashboard_totp" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"secret_enc" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"last_counter" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dashboard_totp_single" CHECK ("app"."dashboard_totp"."id" = 1)
);
--> statement-breakpoint
CREATE INDEX "dashboard_login_event_at_idx" ON "app"."dashboard_login_event" USING btree ("at");--> statement-breakpoint
CREATE INDEX "dashboard_login_event_ip_idx" ON "app"."dashboard_login_event" USING btree ("ip_hash","at");--> statement-breakpoint
CREATE INDEX "dashboard_session_expires_idx" ON "app"."dashboard_session" USING btree ("expires_at");