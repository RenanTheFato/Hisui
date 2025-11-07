-- CreateTable
CREATE TABLE "public"."user_preferences" (
    "user_id" TEXT NOT NULL,
    "allow_news_notifications" BOOLEAN NOT NULL DEFAULT true,
    "allow_orders_notifications" BOOLEAN NOT NULL DEFAULT true,
    "allow_updates_notifications" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "public"."user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
