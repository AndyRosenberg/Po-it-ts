-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_resourceId_resourceType_idx" ON "notifications"("resourceId", "resourceType");

-- CreateIndex
CREATE INDEX "idx_poem_title_trgm" ON "poems" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_stanza_body_trgm" ON "stanzas" USING GIN ("body" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_user_username_trgm" ON "users" USING GIN ("username" gin_trgm_ops);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
