CREATE TABLE "app"."dashboard_challenge" (
	"challenge" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
