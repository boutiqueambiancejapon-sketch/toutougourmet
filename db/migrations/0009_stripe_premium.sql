CREATE TABLE "app"."stripe_event" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."membership" DROP CONSTRAINT "membership_source_values";--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "status" text;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "billing_interval" text;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "current_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "withdrawal_waiver_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "app"."membership" ADD COLUMN "updated_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "membership_stripe_customer_idx" ON "app"."membership" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "membership_stripe_subscription_idx" ON "app"."membership" USING btree ("stripe_subscription_id");--> statement-breakpoint
ALTER TABLE "app"."membership" ADD CONSTRAINT "membership_interval_values" CHECK ("app"."membership"."billing_interval" IS NULL OR "app"."membership"."billing_interval" IN ('month', 'year'));--> statement-breakpoint
ALTER TABLE "app"."membership" ADD CONSTRAINT "membership_source_values" CHECK ("app"."membership"."source" IN ('launch-free', 'stripe'));