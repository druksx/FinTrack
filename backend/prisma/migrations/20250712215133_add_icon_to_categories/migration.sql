/*
  Warnings:

  - Added the required column `icon` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" ADD COLUMN "icon" TEXT;

-- Update existing records with default icons based on their names
UPDATE "categories" SET "icon" = 
  CASE name
    WHEN 'Food & Dining' THEN 'Utensils'
    WHEN 'Transportation' THEN 'Car'
    WHEN 'Housing' THEN 'Home'
    WHEN 'Utilities' THEN 'Lightbulb'
    WHEN 'Shopping' THEN 'ShoppingBag'
    WHEN 'Entertainment' THEN 'Popcorn'
    WHEN 'Healthcare' THEN 'Heart'
    WHEN 'Education' THEN 'GraduationCap'
    WHEN 'Travel' THEN 'Plane'
    ELSE 'CircleDot'
  END;

-- Make the column required after setting default values
ALTER TABLE "categories" ALTER COLUMN "icon" SET NOT NULL;
