-- DropForeignKey
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
