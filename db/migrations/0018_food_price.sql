CREATE TABLE "app"."food_price" (
	"food_analysis_id" uuid PRIMARY KEY NOT NULL,
	"prix" numeric(8, 2) NOT NULL,
	"prix_kg" numeric(8, 2),
	"prix_ancien" numeric(8, 2),
	"maj_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app"."food_price_history" (
	"food_analysis_id" uuid NOT NULL,
	"jour" date NOT NULL,
	"prix" numeric(8, 2) NOT NULL,
	"prix_kg" numeric(8, 2),
	"prix_ancien" numeric(8, 2),
	CONSTRAINT "food_price_history_food_analysis_id_jour_pk" PRIMARY KEY("food_analysis_id","jour")
);
--> statement-breakpoint
ALTER TABLE "app"."food_price" ADD CONSTRAINT "food_price_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."food_price_history" ADD CONSTRAINT "food_price_history_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;