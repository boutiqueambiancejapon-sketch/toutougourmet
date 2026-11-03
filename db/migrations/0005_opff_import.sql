CREATE TABLE "app"."opff_import_run" (
	"id" serial PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"counters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dump_modified" timestamp with time zone,
	"error" text,
	CONSTRAINT "opff_import_run_status" CHECK ("app"."opff_import_run"."status" IN ('running', 'ok', 'error'))
);
--> statement-breakpoint
CREATE TABLE "app"."opff_product" (
	"ean" text PRIMARY KEY NOT NULL,
	"name" text,
	"name_fr" text,
	"brand" text,
	"ingredients_text" text,
	"ingredients_text_fr" text,
	"nutriments" jsonb NOT NULL,
	"categories" jsonb NOT NULL,
	"additives" jsonb NOT NULL,
	"countries" jsonb NOT NULL,
	"image_url" text,
	"lang" text,
	"kind" text NOT NULL,
	"scorable" boolean DEFAULT false NOT NULL,
	"score" smallint,
	"indexable" boolean DEFAULT false NOT NULL,
	"skip_reason" text,
	"last_modified" timestamp with time zone,
	"content_hash" text NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opff_product_ean_format" CHECK ("app"."opff_product"."ean" ~ '^([0-9]{8}|[0-9]{13})$'),
	CONSTRAINT "opff_product_kind" CHECK ("app"."opff_product"."kind" IN ('complete', 'treat'))
);
--> statement-breakpoint
ALTER TABLE "app"."food_analysis" DROP CONSTRAINT "food_analysis_source";--> statement-breakpoint
CREATE INDEX "opff_import_run_started_idx" ON "app"."opff_import_run" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "opff_product_indexable_idx" ON "app"."opff_product" USING btree ("indexable");--> statement-breakpoint
ALTER TABLE "app"."food_analysis" ADD CONSTRAINT "food_analysis_source" CHECK ("app"."food_analysis"."source" IN ('photo', 'openpetfoodfacts', 'openfoodfacts'));