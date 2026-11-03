CREATE TABLE "app"."sitter_sheet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"dog_id" uuid NOT NULL,
	"token" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sitter_sheet_dates" CHECK ("app"."sitter_sheet"."ends_on" >= "app"."sitter_sheet"."starts_on"),
	CONSTRAINT "sitter_sheet_token_length" CHECK (length("app"."sitter_sheet"."token") >= 22)
);
--> statement-breakpoint
ALTER TABLE "app"."sitter_sheet" ADD CONSTRAINT "sitter_sheet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."sitter_sheet" ADD CONSTRAINT "sitter_sheet_dog_id_dog_id_fk" FOREIGN KEY ("dog_id") REFERENCES "app"."dog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sitter_sheet_token_idx" ON "app"."sitter_sheet" USING btree ("token");--> statement-breakpoint
CREATE INDEX "sitter_sheet_dog_idx" ON "app"."sitter_sheet" USING btree ("dog_id");--> statement-breakpoint
CREATE INDEX "sitter_sheet_user_idx" ON "app"."sitter_sheet" USING btree ("user_id");