/*
  Warnings:

  - Made the column `account_holder_name` on table `payout_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payout_accounts" ALTER COLUMN "account_holder_name" SET NOT NULL;
