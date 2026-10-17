CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"client" varchar(120) NOT NULL,
	"category" varchar(80) DEFAULT 'Разное' NOT NULL,
	"amount" integer NOT NULL,
	"commission_rate" integer NOT NULL,
	"commission_amount" integer NOT NULL,
	"net_amount" integer NOT NULL,
	"status" varchar(32) DEFAULT 'paid' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"company_name" varchar(200) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"inn" varchar(16) NOT NULL,
	"ogrnip" varchar(20) DEFAULT '' NOT NULL,
	"tax_system" varchar(60) DEFAULT 'УСН 6%' NOT NULL,
	"bank_account" varchar(40) DEFAULT '' NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"needs_vat" boolean DEFAULT false NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_name" varchar(120) DEFAULT 'Быстро Деньги' NOT NULL,
	"legal_name" varchar(200) NOT NULL,
	"owner_name" varchar(160) NOT NULL,
	"inn" varchar(16) NOT NULL,
	"ogrnip" varchar(20) DEFAULT '' NOT NULL,
	"okved" varchar(40) DEFAULT '62.01' NOT NULL,
	"tax_system" varchar(60) DEFAULT 'УСН «Доходы» 6%' NOT NULL,
	"registered_at" varchar(40) DEFAULT '' NOT NULL,
	"legal_address" varchar(300) DEFAULT '' NOT NULL,
	"bank_name" varchar(160) DEFAULT '' NOT NULL,
	"bank_inn" varchar(16) DEFAULT '' NOT NULL,
	"bank_address" varchar(300) DEFAULT '' NOT NULL,
	"bik" varchar(12) DEFAULT '' NOT NULL,
	"corr_account" varchar(24) DEFAULT '' NOT NULL,
	"settlement_account" varchar(24) DEFAULT '' NOT NULL,
	"email" varchar(160) DEFAULT '' NOT NULL,
	"phone" varchar(40) DEFAULT '' NOT NULL,
	"website" varchar(160) DEFAULT '' NOT NULL,
	"support_hours" varchar(120) DEFAULT 'Пн–Вс, 09:00–21:00 МСК' NOT NULL,
	"offer_url" varchar(200) DEFAULT '/legal' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" varchar(40) NOT NULL,
	"display_name" varchar(80) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"fee_bps" integer DEFAULT 290 NOT NULL,
	"payout_enabled" boolean DEFAULT false NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_settings_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" varchar(120) DEFAULT '' NOT NULL,
	"provider" varchar(40) NOT NULL,
	"mode" varchar(16) DEFAULT 'demo' NOT NULL,
	"purpose" varchar(40) DEFAULT 'escrow' NOT NULL,
	"amount_kop" integer NOT NULL,
	"platform_fee_kop" integer DEFAULT 0 NOT NULL,
	"acquiring_fee_kop" integer DEFAULT 0 NOT NULL,
	"description" varchar(250) DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"method" varchar(40) DEFAULT 'bank_card' NOT NULL,
	"customer_email" varchar(160) DEFAULT '' NOT NULL,
	"confirmation_url" text DEFAULT '' NOT NULL,
	"idempotence_key" varchar(80) DEFAULT '' NOT NULL,
	"task_id" integer,
	"user_id" integer,
	"error_text" varchar(250) DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"category" varchar(80) NOT NULL,
	"budget" integer NOT NULL,
	"deadline_days" integer DEFAULT 3 NOT NULL,
	"customer_name" varchar(120) NOT NULL,
	"city" varchar(120) DEFAULT 'Удалённо' NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"responses" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"city" varchar(120) DEFAULT 'Москва' NOT NULL,
	"specialization" varchar(160) DEFAULT 'Универсал' NOT NULL,
	"avatar_emoji" varchar(8) DEFAULT '🙂' NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"rating" integer DEFAULT 50 NOT NULL,
	"is_ip" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"method" varchar(60) NOT NULL,
	"destination" varchar(120) DEFAULT '' NOT NULL,
	"status" varchar(32) DEFAULT 'done' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
