CREATE TABLE "app"."food_check" (
	"food_analysis_id" uuid PRIMARY KEY NOT NULL,
	"status" text NOT NULL,
	"reason" text NOT NULL,
	"model" text NOT NULL,
	"content_hash" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_check_status" CHECK ("app"."food_check"."status" IN ('ok', 'doubt', 'rejected'))
);
--> statement-breakpoint
ALTER TABLE "app"."food_check" ADD CONSTRAINT "food_check_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_check_status_idx" ON "app"."food_check" USING btree ("status");