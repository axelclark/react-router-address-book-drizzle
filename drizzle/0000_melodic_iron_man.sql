CREATE TABLE IF NOT EXISTS "contacts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contacts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first" text,
	"last" text,
	"avatar" text,
	"twitter" varchar(255),
	"notes" text,
	"favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
