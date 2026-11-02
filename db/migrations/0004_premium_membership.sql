CREATE TABLE "app"."membership" (
	"user_id" text PRIMARY KEY NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"source" text DEFAULT 'launch-free' NOT NULL,
	"activated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_plan_values" CHECK ("app"."membership"."plan" IN ('free', 'premium')),
	CONSTRAINT "membership_source_values" CHECK ("app"."membership"."source" IN ('launch-free'))
);
--> statement-breakpoint
ALTER TABLE "app"."membership" ADD CONSTRAINT "membership_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;