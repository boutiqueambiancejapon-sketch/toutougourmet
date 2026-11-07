CREATE TABLE "app"."food_favorite" (
	"user_id" text NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_favorite_user_id_food_analysis_id_pk" PRIMARY KEY("user_id","food_analysis_id")
);
--> statement-breakpoint
ALTER TABLE "app"."food_favorite" ADD CONSTRAINT "food_favorite_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."food_favorite" ADD CONSTRAINT "food_favorite_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;