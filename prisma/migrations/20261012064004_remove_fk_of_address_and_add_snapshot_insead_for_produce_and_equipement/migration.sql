/*
  Warnings:

  - You are about to drop the column `location_address_id` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `location_address_id` on the `produce_listings` table. All the data in the column will be lost.
  - Added the required column `pickup_address_snapshot` to the `equipment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickup_address_snapshot` to the `produce_listings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_location_address_id_fkey";

-- DropForeignKey
ALTER TABLE "produce_listings" DROP CONSTRAINT "produce_listings_location_address_id_fkey";

-- DropIndex
DROP INDEX "equipment_location_address_id_idx";

-- DropIndex
DROP INDEX "produce_listings_location_address_id_idx";

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "location_address_id",
ADD COLUMN     "pickup_address_snapshot" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "produce_listings" DROP COLUMN "location_address_id",
ADD COLUMN     "pickup_address_snapshot" JSONB NOT NULL;
