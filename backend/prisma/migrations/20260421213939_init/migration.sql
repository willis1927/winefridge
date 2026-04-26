/*
  Warnings:

  - You are about to alter the column `notes` on the `stored_wines` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - Changed the type of `owner_id` on the `storage` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `lwin` to the `stored_wines` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `owner_id` on the `stored_wines` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `name` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "storage" DROP CONSTRAINT "storage_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "stored_wines" DROP CONSTRAINT "stored_wines_owner_id_fkey";

-- DropIndex
DROP INDEX "users_email_key";

-- AlterTable
ALTER TABLE "storage" DROP COLUMN "owner_id",
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "stored_wines" ADD COLUMN     "date_purchased" DATE,
ADD COLUMN     "date_stored" DATE,
ADD COLUMN     "full_lwin" VARCHAR(255),
ADD COLUMN     "lwin" VARCHAR(255) NOT NULL,
ADD COLUMN     "purchased_from" VARCHAR(255),
ADD COLUMN     "size" VARCHAR(5),
ADD COLUMN     "storage_id" INTEGER,
ADD COLUMN     "vintage" VARCHAR(4),
DROP COLUMN "owner_id",
ADD COLUMN     "owner_id" INTEGER NOT NULL,
ALTER COLUMN "notes" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "lwin" (
    "lwin" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255),
    "display_name" VARCHAR(255),
    "producer_title" VARCHAR(255),
    "producer_name" VARCHAR(255),
    "wine" VARCHAR(255),
    "country" VARCHAR(255),
    "region" VARCHAR(255),
    "sub_region" VARCHAR(255),
    "site" VARCHAR(255),
    "parcel" VARCHAR(255),
    "colour" VARCHAR(255),
    "type" VARCHAR(255),
    "sub_type" VARCHAR(255),
    "designation" VARCHAR(255),
    "classification" VARCHAR(255),
    "vintage_config" VARCHAR(255),
    "first_vintage" VARCHAR(255),
    "final_vintage" VARCHAR(255),
    "date_added" VARCHAR(255),
    "date_updated" VARCHAR(255),
    "reference" VARCHAR(255),

    CONSTRAINT "lwin_pkey" PRIMARY KEY ("lwin")
);

-- CreateTable
CREATE TABLE "vintage_info" (
    "full_lwin" VARCHAR(255) NOT NULL,
    "drink_by_date" DATE,
    "current_drink_state" VARCHAR(255),
    "ratings" DOUBLE PRECISION,
    "awards" VARCHAR(255),
    "notes" VARCHAR(255),

    CONSTRAINT "vintage_info_pkey" PRIMARY KEY ("full_lwin")
);

-- CreateIndex
CREATE INDEX "idx_storage_owner" ON "storage"("owner_id");

-- CreateIndex
CREATE INDEX "idx_stored_wines_owner" ON "stored_wines"("owner_id");

-- CreateIndex
CREATE INDEX "idx_stored_wines_lwin" ON "stored_wines"("lwin");

-- CreateIndex
CREATE INDEX "idx_stored_wines_storage" ON "stored_wines"("storage_id");

-- AddForeignKey
ALTER TABLE "storage" ADD CONSTRAINT "storage_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_wines" ADD CONSTRAINT "stored_wines_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_wines" ADD CONSTRAINT "stored_wines_lwin_fkey" FOREIGN KEY ("lwin") REFERENCES "lwin"("lwin") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_wines" ADD CONSTRAINT "stored_wines_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "storage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stored_wines" ADD CONSTRAINT "stored_wines_full_lwin_fkey" FOREIGN KEY ("full_lwin") REFERENCES "vintage_info"("full_lwin") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "storage_owner_id_idx" RENAME TO "idx_storage_owner";

-- RenameIndex
ALTER INDEX "stored_wines_owner_id_idx" RENAME TO "idx_stored_wines_owner";
