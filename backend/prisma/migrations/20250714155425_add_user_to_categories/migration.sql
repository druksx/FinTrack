/*
  Warnings:

  - Added the required column `userId` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- Add userId column as nullable first
ALTER TABLE "categories" ADD COLUMN "userId" TEXT;

-- Assign all existing categories to the default user
UPDATE "categories" SET "userId" = '00000000-0000-0000-0000-000000000000';

-- Make userId required
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "categories_userId_idx" ON "categories"("userId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
