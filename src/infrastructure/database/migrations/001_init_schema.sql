-- ============================================================================
-- IDENTITY & USERS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality CHAR(2),
  
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  kyc_score INT CHECK (kyc_score >= 0 AND kyc_score <= 100),
  kyc_verified_at TIMESTAMP,
  kyc_expires_at TIMESTAMP,
  
  risk_profile VARCHAR(20) DEFAULT 'medium',
  risk_factors JSONB DEFAULT '[]',
  
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE TABLE kyc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  document_type VARCHAR(50) NOT NULL,
  document_number VARCHAR(100) NOT NULL,
  document_expiry DATE NOT NULL,
  document_issuer VARCHAR(100),
  
  proof_of_address_type VARCHAR(50),
  proof_of_address_url TEXT,
  
  verification_timestamp TIMESTAMP,
  verified_by VARCHAR(100),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kyc_data_user_id ON kyc_data(user_id);

-- ============================================================================
-- WALLETS & BALANCES
-- ============================================================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  currency CHAR(3) NOT NULL,
  
  balance_available NUMERIC(20, 8) NOT NULL DEFAULT 0,
  balance_locked NUMERIC(20, 8) NOT NULL DEFAULT 0,
  
  wallet_type VARCHAR(20) NOT NULL,
  blockchain_address VARCHAR(255),
  bank_account_id VARCHAR(100),
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, currency),
  CONSTRAINT valid_balances CHECK (balance_available >= 0 AND balance_locked >= 0)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);

CREATE TABLE holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL,
  
  amount NUMERIC(20, 8) NOT NULL CHECK (amount > 0),
  reason VARCHAR(255),
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP
);

CREATE INDEX idx_holds_wallet_id ON holds(wallet_id);
CREATE INDEX idx_holds_transaction_id ON holds(transaction_id);

-- ============================================================================
-- LEDGER (Core Double-Entry Accounting)
-- ============================================================================

CREATE TABLE ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  account_type VARCHAR(50) NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  currency CHAR(3),
  
  wallet_id UUID REFERENCES wallets(id),
  pool_id UUID,
  
  parent_account_id UUID REFERENCES ledger_accounts(id),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ledger_accounts_type ON ledger_accounts(account_type);
CREATE INDEX idx_ledger_accounts_wallet_id ON ledger_accounts(wallet_id);

CREATE TABLE ledger_entries (
  id BIGSERIAL PRIMARY KEY,
  transaction_id UUID NOT NULL,
  
  debit_account UUID NOT NULL REFERENCES ledger_accounts(id),
  credit_account UUID NOT NULL REFERENCES ledger_accounts(id),
  
  amount NUMERIC(20, 8) NOT NULL CHECK (amount > 0),
  currency CHAR(3) NOT NULL,
  fx_rate NUMERIC(10, 6),
  
  status VARCHAR(20) NOT NULL DEFAULT 'provisional',
  settlement_reference VARCHAR(255),
  
  description TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  committed_at TIMESTAMP
);

CREATE INDEX idx_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_created_at ON ledger_entries(created_at);
CREATE INDEX idx_status ON ledger_entries(status);

-- Ensure immutability (no updates)
CREATE RULE ledger_entries_no_update AS ON UPDATE TO ledger_entries DO INSTEAD NOTHING;

-- ============================================================================
-- TRANSACTIONS
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  
  sender_wallet_id UUID NOT NULL REFERENCES wallets(id),
  recipient_wallet_id UUID NOT NULL REFERENCES wallets(id),
  
  from_amount NUMERIC(20, 8) NOT NULL,
  from_currency CHAR(3) NOT NULL,
  to_amount NUMERIC(20, 8),
  to_currency CHAR(3) NOT NULL,
  fx_rate NUMERIC(10, 6),
  
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  route_chosen VARCHAR(100),
  settlement_provider VARCHAR(100),
  settlement_reference VARCHAR(255),
  
  actual_cost_usd NUMERIC(12, 6),
  cost_percentage NUMERIC(5, 3),
  
  compliance_approved BOOLEAN,
  compliance_score INT,
  compliance_check_details JSONB,
  
  error_message TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_user_id ON transactions(user_id);
CREATE INDEX idx_status_txn ON transactions(status);
CREATE INDEX idx_created_at_txn ON transactions(created_at);
CREATE INDEX idx_sender_wallet ON transactions(sender_wallet_id);
CREATE INDEX idx_recipient_wallet ON transactions(recipient_wallet_id);

-- ============================================================================
-- TREASURY & POOLS
-- ============================================================================

CREATE TABLE country_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  currency CHAR(3) NOT NULL,
  
  balance NUMERIC(20, 8) NOT NULL DEFAULT 0,
  target_balance NUMERIC(20, 8),
  min_threshold NUMERIC(20, 8),
  max_threshold NUMERIC(20, 8),
  
  pool_status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  total_inflow_24h NUMERIC(20, 8),
  total_outflow_24h NUMERIC(20, 8),
  last_settlement_time TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(country_code, currency)
);

CREATE INDEX idx_country_pools_status ON country_pools(pool_status);
