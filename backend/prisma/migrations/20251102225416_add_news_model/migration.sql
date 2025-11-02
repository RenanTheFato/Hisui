-- CreateTable
CREATE TABLE "public"."news" (
    "id" TEXT NOT NULL,
    "publisher_name" TEXT NOT NULL,
    "publisher_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "published_at" TIMESTAMP(3) NOT NULL,
    "article_url" TEXT NOT NULL,
    "tickers" TEXT[],
    "amp_url" TEXT,
    "image_url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "public"."news"("published_at");

-- CreateIndex
CREATE INDEX "news_publisher_name_idx" ON "public"."news"("publisher_name");
