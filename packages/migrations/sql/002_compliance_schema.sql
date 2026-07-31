-- Migration 002: Compliance Schema
-- Global Payment Operating System - Milestone 11
-- Raw SQL only. No ORM.

-- IDENTITIES
CREATE TABLE IF NOT EXISTS identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_type VARCHAR(30) NOT NULL CHECK (identity_type IN ('INDIVIDUAL','BUSINESS','BANK','MERCHANT','VASP')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT','PENDING','VERIFIED','SUSPENDED','REJECTED','ARCHIVED')),
  risk_rating VARCHAR(10) NOT NULL CHECK (risk_rating IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  country VARCHAR(3) NOT NULL,
  jurisdiction VARCHAR(100),
  linked_wallets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- KYC RECORDS
CREATE TABLE IF NOT EXISTS kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','RUNNING','VERIFIED','REJECTED','MANUAL_REVIEW','EXPIRED')),
  document_type VARCHAR(30) NOT NULL,
  pep_match BOOLEAN NOT NULL DEFAULT FALSE,
  risk_classification VARCHAR(20),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- KYB RECORDS
CREATE TABLE IF NOT EXISTS kyb_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_identity_id UUID NOT NULL REFERENCES identities(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
  ubo_verified BOOLEAN NOT NULL DEFAULT FALSE,
  corporate_documents_valid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identity_id UUID NOT NULL REFERENCES identities(id),
  document_type VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','VERIFIED','REJECTED','EXPIRED')),
  issuing_country VARCHAR(3) NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- AML ALERTS
CREATE TABLE IF NOT EXISTS aml_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  triggered_rules TEXT[] NOT NULL DEFAULT '{}',
  evidence TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  correlation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- FRAUD ALERTS
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  fraud_signals JSONB NOT NULL DEFAULT '{}',
  evidence TEXT[] NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  correlation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- WALLET SCREENINGS
CREATE TABLE IF NOT EXISTS wallet_screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(255) NOT NULL,
  chain VARCHAR(30) NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  flags TEXT[] NOT NULL DEFAULT '{}',
  mixer_exposure NUMERIC(5,2) NOT NULL DEFAULT 0,
  darknet_exposure NUMERIC(5,2) NOT NULL DEFAULT 0,
  sanctioned_exposure NUMERIC(5,2) NOT NULL DEFAULT 0,
  screened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- RISK SCORES
CREATE TABLE IF NOT EXISTS risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(30) NOT NULL,
  composite_score INTEGER NOT NULL CHECK (composite_score BETWEEN 0 AND 100),
  risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  customer_risk INTEGER NOT NULL DEFAULT 0,
  wallet_risk INTEGER NOT NULL DEFAULT 0,
  provider_risk INTEGER NOT NULL DEFAULT 0,
  corridor_risk INTEGER NOT NULL DEFAULT 0,
  fraud_score INTEGER NOT NULL DEFAULT 0,
  aml_score INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  correlation_id UUID,
  metadata JSONB DEFAULT '{}'
);

-- SANCTIONS MATCHES
CREATE TABLE IF NOT EXISTS sanctions_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  match_status VARCHAR(20) NOT NULL CHECK (match_status IN ('CLEAR','MATCH','PARTIAL_MATCH','REVIEW','BLOCK')),
  match_score INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 0,
  matched_entity VARCHAR(255),
  provider VARCHAR(50),
  correlation_id UUID NOT NULL,
  screened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- WATCHLISTS
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_name VARCHAR(100) NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50),
  country VARCHAR(3),
  aliases TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- COMPLIANCE DECISIONS
CREATE TABLE IF NOT EXISTS compliance_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  decision VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVED','REJECTED','MANUAL_REVIEW')),
  aml_score INTEGER NOT NULL DEFAULT 0,
  fraud_score INTEGER NOT NULL DEFAULT 0,
  risk_score INTEGER NOT NULL DEFAULT 0,
  sanctions_result VARCHAR(20) NOT NULL DEFAULT 'CLEAR',
  triggered_rules TEXT[] NOT NULL DEFAULT '{}',
  evidence TEXT[] NOT NULL DEFAULT '{}',
  reason_code VARCHAR(100),
  execution_trace TEXT[] NOT NULL DEFAULT '{}',
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  correlation_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- COMPLIANCE CASES
CREATE TABLE IF NOT EXISTS compliance_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  decision_id UUID REFERENCES compliance_decisions(id),
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('OPEN','ASSIGNED','INVESTIGATING','RESOLVED','CLOSED')),
  triggered_rules TEXT[] NOT NULL DEFAULT '{}',
  evidence TEXT[] NOT NULL DEFAULT '{}',
  risk_score INTEGER NOT NULL DEFAULT 0,
  aml_score INTEGER NOT NULL DEFAULT 0,
  fraud_score INTEGER NOT NULL DEFAULT 0,
  assigned_to VARCHAR(100),
  correlation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- CASE HISTORY TIMELINE
CREATE TABLE IF NOT EXISTS case_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES compliance_cases(id),
  actor VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- TRAVEL RULE RECORDS
CREATE TABLE IF NOT EXISTS travel_rule_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  originator_vasp VARCHAR(255) NOT NULL,
  beneficiary_vasp VARCHAR(255) NOT NULL,
  originator_details JSONB NOT NULL DEFAULT '{}',
  beneficiary_details JSONB NOT NULL DEFAULT '{}',
  transfer_amount NUMERIC(20,8) NOT NULL,
  ivms101_payload JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'GENERATED',
  correlation_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- BEHAVIOR PROFILES
CREATE TABLE IF NOT EXISTS behavior_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE,
  average_transaction_amount NUMERIC(20,2) NOT NULL DEFAULT 0,
  typical_hours INTEGER[] DEFAULT '{}',
  typical_destinations TEXT[] DEFAULT '{}',
  risk_drift INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- DEVICE PROFILES
CREATE TABLE IF NOT EXISTS device_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint VARCHAR(255) NOT NULL UNIQUE,
  customer_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  country VARCHAR(3),
  is_known_device BOOLEAN NOT NULL DEFAULT FALSE,
  risk_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- TRANSACTION MONITORING PROFILES
CREATE TABLE IF NOT EXISTS transaction_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE,
  daily_volume NUMERIC(20,2) NOT NULL DEFAULT 0,
  weekly_volume NUMERIC(20,2) NOT NULL DEFAULT 0,
  monthly_volume NUMERIC(20,2) NOT NULL DEFAULT 0,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  avg_amount NUMERIC(20,2) NOT NULL DEFAULT 0,
  unique_destinations INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- COUNTRY RISK
CREATE TABLE IF NOT EXISTS country_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(3) NOT NULL UNIQUE,
  risk_level VARCHAR(10) NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  fatf_status VARCHAR(50),
  aml_required BOOLEAN NOT NULL DEFAULT TRUE,
  kyc_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- PROVIDER RISK
CREATE TABLE IF NOT EXISTS provider_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL UNIQUE,
  risk_score INTEGER NOT NULL DEFAULT 10 CHECK (risk_score BETWEEN 0 AND 100),
  last_assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- CORRIDOR RISK
CREATE TABLE IF NOT EXISTS corridor_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_country VARCHAR(3) NOT NULL,
  to_country VARCHAR(3) NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 20 CHECK (risk_score BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  UNIQUE (from_country, to_country),
  metadata JSONB DEFAULT '{}'
);

-- RULE DEFINITIONS
CREATE TABLE IF NOT EXISTS rule_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  version VARCHAR(10) NOT NULL,
  rule_type VARCHAR(30) NOT NULL,
  logic_operator VARCHAR(5) NOT NULL,
  conditions JSONB NOT NULL DEFAULT '[]',
  action VARCHAR(20) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- AUDIT LOGS
CREATE TABLE IF NOT EXISTS compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  device_fingerprint VARCHAR(255),
  correlation_id UUID NOT NULL,
  trace_id UUID,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_kyc_identity ON kyc_records(identity_id);
CREATE INDEX IF NOT EXISTS idx_aml_payment ON aml_alerts(payment_id);
CREATE INDEX IF NOT EXISTS idx_fraud_payment ON fraud_alerts(payment_id);
CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_screenings(wallet_address);
CREATE INDEX IF NOT EXISTS idx_compliance_decision_payment ON compliance_decisions(payment_id);
CREATE INDEX IF NOT EXISTS idx_compliance_cases_status ON compliance_cases(status);
CREATE INDEX IF NOT EXISTS idx_risk_entity ON risk_scores(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON compliance_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_corridor_countries ON corridor_risk(from_country, to_country);
