ALTER TABLE "app"."food_analysis" DROP CONSTRAINT "food_analysis_source";--> statement-breakpoint
ALTER TABLE "app"."food_analysis" ADD CONSTRAINT "food_analysis_source" CHECK ("app"."food_analysis"."source" IN ('photo', 'openpetfoodfacts', 'openfoodfacts', 'maxizoo', 'marque'));
