-- Migration 007: Treasury Platform Schema
-- Global Payment Operating System - Milestone 16

-- TREASURY ACCOUNTS
CREATE TABLE IF NOT EXISTS treasury_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- NOSTRO, VOSTRO, RESERVE, OPERATIONAL, SETTLEMENT
  currency VARCHAR(3) NOT NULL,
  provider_id VARCHAR(100), -- References providers(provider_id)
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- LIQUIDITY POOLS
CREATE TABLE IF NOT EXISTS liquidity_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_name VARCHAR(255) NOT NULL UNIQUE,
  currency VARCHAR(3) NOT NULL,
  total_liquidity NUMERIC(20,4) NOT NULL DEFAULT 0,
  reserved_liquidity NUMERIC(20,4) NOT NULL DEFAULT 0,
  available_liquidity NUMERIC(20,4) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- POOL MEMBERS
CREATE TABLE IF NOT EXISTS pool_members (
  pool_id UUID NOT NULL REFERENCES liquidity_pools(id),
  account_id UUID NOT NULL REFERENCES treasury_accounts(id),
  allocation_percentage NUMERIC(5,4),
  PRIMARY KEY (pool_id, account_id)
);

-- CASH POSITIONS
CREATE TABLE IF NOT EXISTS cash_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- COUNTRY, CURRENCY, PROVIDER
  entity_id VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  balance NUMERIC(20,4) NOT NULL DEFAULT 0,
  last_recalculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_type, entity_id, currency)
);

-- FUNDING REQUESTS
CREATE TABLE IF NOT EXISTS funding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_account_id UUID NOT NULL REFERENCES treasury_accounts(id),
  amount NUMERIC(20,4) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- FX EXPOSURES
CREATE TABLE IF NOT EXISTS fx_exposures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_currency VARCHAR(3) NOT NULL,
  destination_currency VARCHAR(3) NOT NULL,
  open_position NUMERIC(20,4) NOT NULL DEFAULT 0,
  realized_exposure NUMERIC(20,4) NOT NULL DEFAULT 0,
  unrealized_exposure NUMERIC(20,4) NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_currency, destination_currency)
);

-- TREASURY POLICIES
CREATE TABLE IF NOT EXISTS treasury_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name VARCHAR(100) NOT NULL UNIQUE,
  policy_type VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TREASURY ALERTS
CREATE TABLE IF NOT EXISTS treasury_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- LIQUIDITY FORECASTS
CREATE TABLE IF NOT EXISTS liquidity_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_entity VARCHAR(100) NOT NULL, -- e.g., 'USD-EUR-CORRIDOR'
  currency VARCHAR(3) NOT NULL,
  forecast_date DATE NOT NULL,
  projected_demand NUMERIC(20,4) NOT NULL,
  confidence_score NUMERIC(5,4),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (target_entity, currency, forecast_date)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_treasury_accounts_type ON treasury_accounts(account_type, currency);
CREATE INDEX IF NOT EXISTS idx_cash_positions_lookup ON cash_positions(entity_type, currency);
CREATE INDEX IF NOT EXISTS idx_funding_requests_status ON funding_requests(status);
CREATE INDEX IF NOT EXISTS idx_fx_exposures_pair ON fx_exposures(source_currency, destination_currency);
