-- Migration 006: Provider Network Schema
-- Global Payment Operating System - Milestone 15

-- PROVIDERS
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(100) NOT NULL UNIQUE,
  provider_type VARCHAR(50) NOT NULL, -- BLOCKCHAIN, BANK, CARD, WALLET, FX
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER CAPABILITIES
CREATE TABLE IF NOT EXISTS provider_capabilities (
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  supported_currencies TEXT[] NOT NULL DEFAULT '{}',
  supported_countries TEXT[] NOT NULL DEFAULT '{}',
  supported_operations TEXT[] NOT NULL DEFAULT '{}',
  max_throughput INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER HEALTH
CREATE TABLE IF NOT EXISTS provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  is_healthy BOOLEAN NOT NULL,
  latency_ms INTEGER,
  success_rate NUMERIC(5,4),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER LIMITS
CREATE TABLE IF NOT EXISTS provider_limits (
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  currency VARCHAR(3) NOT NULL,
  min_amount NUMERIC(15,4),
  max_amount NUMERIC(15,4),
  daily_volume_limit NUMERIC(20,4),
  current_daily_volume NUMERIC(20,4) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (provider_id, currency)
);

-- EXCHANGE RATES
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  source_currency VARCHAR(3) NOT NULL,
  destination_currency VARCHAR(3) NOT NULL,
  rate NUMERIC(15,6) NOT NULL,
  spread NUMERIC(10,6),
  valid_until TIMESTAMPTZ,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER QUOTES
CREATE TABLE IF NOT EXISTS provider_quotes (
  quote_id VARCHAR(255) PRIMARY KEY,
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  source_currency VARCHAR(3) NOT NULL,
  destination_currency VARCHAR(3) NOT NULL,
  amount NUMERIC(15,4) NOT NULL,
  exchange_rate NUMERIC(15,6) NOT NULL,
  guaranteed_until TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER TRANSACTIONS
CREATE TABLE IF NOT EXISTS provider_transactions (
  transaction_id VARCHAR(255) PRIMARY KEY,
  payment_id UUID NOT NULL,
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  status VARCHAR(50) NOT NULL,
  amount NUMERIC(15,4) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  network_fee NUMERIC(15,6),
  estimated_completion_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER CONFIRMATIONS
CREATE TABLE IF NOT EXISTS provider_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(255) NOT NULL REFERENCES provider_transactions(transaction_id),
  confirmations INTEGER NOT NULL,
  block_height BIGINT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROVIDER FAILURES
CREATE TABLE IF NOT EXISTS provider_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id VARCHAR(100) NOT NULL REFERENCES providers(provider_id),
  transaction_id VARCHAR(255) REFERENCES provider_transactions(transaction_id),
  payment_id UUID,
  error_code VARCHAR(100),
  error_message TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_provider_health_recorded ON provider_health(provider_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pairs ON exchange_rates(source_currency, destination_currency, valid_until);
CREATE INDEX IF NOT EXISTS idx_provider_tx_payment ON provider_transactions(payment_id);
