ALTER TABLE payout_accounts ADD CONSTRAINT account_holder_name_required
  CHECK (account_holder_name IS NOT NULL);
