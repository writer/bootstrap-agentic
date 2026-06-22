CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"thread_id" varchar,
	"role" varchar,
	"content" text DEFAULT '',
	"tool_call_id" varchar,
	"tool_name" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "threads" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar DEFAULT 'New Chat',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."threads"("id") ON DELETE no action ON UPDATE no action;