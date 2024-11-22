/*
  Warnings:

  - The primary key for the `Asset` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Asset` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `classification` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('open', 'closed');

-- AlterTable
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_pkey",
ADD COLUMN     "classification" TEXT NOT NULL,
ADD COLUMN     "narrative" TEXT[],
ADD COLUMN     "origin" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ALTER COLUMN "purchaseDate" DROP NOT NULL,
ALTER COLUMN "purchaseDate" SET DEFAULT '2000-01-01 00:00:00'::timestamp without time zone,
ALTER COLUMN "purchaseDate" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(6),
ALTER COLUMN "updatedAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(6),
ADD CONSTRAINT "Asset_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Trade" (
    "id" SERIAL NOT NULL,
    "asset_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "leverage" DECIMAL(5,2),
    "target_price" DECIMAL(18,8),
    "quantity" DECIMAL(18,8) NOT NULL,
    "entry_price" DECIMAL(18,8) NOT NULL,
    "exit_price" DECIMAL(18,8),
    "entry_date" TIMESTAMP(6) NOT NULL,
    "exit_date" TIMESTAMP(6),
    "pl" DECIMAL(18,8),
    "status" "TradeStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioHistory" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "asset_id" UUID,
    "total_value" DECIMAL(18,8),
    "pl" DECIMAL(18,8),
    "price_snapshot" DECIMAL(18,8),

    CONSTRAINT "PortfolioHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "PortfolioHistory" ADD CONSTRAINT "PortfolioHistory_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "Asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
