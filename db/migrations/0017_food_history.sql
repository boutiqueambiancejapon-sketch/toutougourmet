CREATE TABLE "app"."food_analysis_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	"extracted" jsonb NOT NULL,
	"score" smallint,
	"source" text NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."food_analysis_history" ADD CONSTRAINT "food_analysis_history_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "app"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "food_analysis_history_fiche_idx" ON "app"."food_analysis_history" USING btree ("food_analysis_id","recorded_at");--> statement-breakpoint
CREATE OR REPLACE FUNCTION app.food_analysis_keep_history() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.extracted->'ingredients' IS DISTINCT FROM NEW.extracted->'ingredients'
     OR OLD.extracted->'constituants' IS DISTINCT FROM NEW.extracted->'constituants' THEN
    INSERT INTO app.food_analysis_history (food_analysis_id, extracted, score, source, valid_from)
    VALUES (OLD.id, OLD.extracted, OLD.score, OLD.source, OLD.updated_at);
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER food_analysis_history AFTER UPDATE OF extracted ON app.food_analysis
  FOR EACH ROW EXECUTE FUNCTION app.food_analysis_keep_history();
