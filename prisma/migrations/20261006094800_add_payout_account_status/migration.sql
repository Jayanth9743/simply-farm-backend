-- CreateEnum
CREATE TYPE "PayoutAccountStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "payout_accounts" ADD COLUMN     "status" "PayoutAccountStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "payout_accounts_user_id_status_idx" ON "payout_accounts"("user_id", "status");

ALTER TABLE payout_accounts ADD CONSTRAINT bank_account_fields_required
  CHECK (payout_method != 'BANK_ACCOUNT' OR (account_number IS NOT NULL AND ifsc_code IS NOT NULL));

ALTER TABLE payout_accounts ADD CONSTRAINT upi_field_required
  CHECK (payout_method != 'UPI' OR upi_id IS NOT NULL);

CREATE UNIQUE INDEX one_default_payout_account_per_user
  ON payout_accounts (user_id)
  WHERE is_default = true;