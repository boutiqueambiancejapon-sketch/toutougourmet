CREATE TABLE "app"."food_amazon" (
	"food_analysis_id" uuid PRIMARY KEY NOT NULL,
	"asin" text NOT NULL,
	"titre" text NOT NULL,
	"prix" numeric(8, 2),
	"prix_kg" numeric(8, 2),
	"poids_kg" numeric(8, 3),
	"dispo" boolean DEFAULT true NOT NULL,
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."food_amazon" ADD CONSTRAINT "food_amazon_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;