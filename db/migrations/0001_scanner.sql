CREATE TABLE "app"."food_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ean" text,
	"slug" text NOT NULL,
	"brand" text,
	"product" text,
	"extracted" jsonb NOT NULL,
	"score" smallint,
	"details" jsonb NOT NULL,
	"algorithm_version" text NOT NULL,
	"model" text NOT NULL,
	"scan_count" integer DEFAULT 1 NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_analysis_ean_unique" UNIQUE("ean"),
	CONSTRAINT "food_analysis_slug_unique" UNIQUE("slug"),
	CONSTRAINT "food_analysis_score_range" CHECK ("app"."food_analysis"."score" IS NULL OR ("app"."food_analysis"."score" >= 0 AND "app"."food_analysis"."score" <= 100)),
	CONSTRAINT "food_analysis_ean_format" CHECK ("app"."food_analysis"."ean" IS NULL OR "app"."food_analysis"."ean" ~ '^([0-9]{8}|[0-9]{13})$')
);
--> statement-breakpoint
CREATE TABLE "app"."scan_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	"from_cache" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."scan_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."scan_usage" (
	"user_id" text NOT NULL,
	"month" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "scan_usage_user_id_month_pk" PRIMARY KEY("user_id","month"),
	CONSTRAINT "scan_usage_month_format" CHECK ("app"."scan_usage"."month" ~ '^[0-9]{4}-[0-9]{2}$')
);
--> statement-breakpoint
ALTER TABLE "app"."scan_history" ADD CONSTRAINT "scan_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."scan_history" ADD CONSTRAINT "scan_history_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."scan_report" ADD CONSTRAINT "scan_report_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."scan_report" ADD CONSTRAINT "scan_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."scan_usage" ADD CONSTRAINT "scan_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "scan_history_user_idx" ON "app"."scan_history" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "scan_history_created_idx" ON "app"."scan_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "scan_report_analysis_idx" ON "app"."scan_report" USING btree ("food_analysis_id");