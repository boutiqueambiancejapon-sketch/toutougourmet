ALTER TABLE "app"."dog" ADD COLUMN "food" text;--> statement-breakpoint
ALTER TABLE "app"."dog" ADD COLUMN "food_slug" text;--> statement-breakpoint
ALTER TABLE "app"."dog" ADD COLUMN "allergies" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "app"."dog" ADD CONSTRAINT "dog_food_length" CHECK ("app"."dog"."food" IS NULL OR char_length("app"."dog"."food") <= 160);--> statement-breakpoint
ALTER TABLE "app"."dog" ADD CONSTRAINT "dog_allergies_count" CHECK (cardinality("app"."dog"."allergies") <= 10);