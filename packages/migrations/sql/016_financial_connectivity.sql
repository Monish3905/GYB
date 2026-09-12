-- Milestone 26: Real Financial Connectivity & Controlled Settlement
-- 016_financial_connectivity.sql

BEGIN;

-- Financial Connectors
CREATE TABLE financial_connectors (
    connector_id VARCHAR(100) PRIMARY KEY,
    connector_name VARCHAR(255) NOT NULL,
    connector_type VARCHAR(50) NOT NULL, -- UK_SETTLEMENT, INDIA_SETTLEMENT, FX_PROVIDER
    environment VARCHAR(50) NOT NULL DEFAULT 'SANDBOX', -- SANDBOX, CERTIFICATION, PRODUCTION
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED', -- REGISTERED, ACTIVE, DEGRADED, SUSPENDED, DEACTIVATED
    jurisdiction VARCHAR(100),
    supported_currencies JSONB,
    capabilities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Connector Credentials (references only — actual secrets in vault)
CREATE TABLE connector_credentials (
    credential_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id) ON DELETE CASCADE,
    environment VARCHAR(50) NOT NULL,
    vault_reference VARCHAR(500) NOT NULL, -- Reference to secrets vault, never the secret itself
    credential_type VARCHAR(100) NOT NULL, -- API_KEY, OAUTH_CLIENT, CERTIFICATE, HMAC
    version INTEGER NOT NULL DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_connector_cred_active ON connector_credentials(connector_id, environment, credential_type) WHERE is_active = true;

-- Connector Capabilities
CREATE TABLE connector_capabilities (
    capability_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id) ON DELETE CASCADE,
    capability VARCHAR(100) NOT NULL, -- GBP_PAYOUT, INR_PAYOUT, FX_QUOTE, BENEFICIARY_VALIDATION
    is_supported BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Connector Health
CREATE TABLE connector_health_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id) ON DELETE CASCADE,
    latency_ms INTEGER,
    is_available BOOLEAN NOT NULL,
    error_rate DECIMAL(5,2),
    settlement_success_rate DECIMAL(5,2),
    unknown_settlement_count INTEGER DEFAULT 0,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- External Accounts (tokenized references)
CREATE TABLE external_accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_type VARCHAR(50) NOT NULL, -- FUNDING_SOURCE, BENEFICIARY
    owner_reference VARCHAR(255) NOT NULL, -- Tokenized customer/beneficiary reference
    country VARCHAR(10) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    institution_name VARCHAR(255),
    account_token VARCHAR(255) NOT NULL, -- Tokenized account reference, never raw account number
    validation_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, VALIDATED, FAILED, EXPIRED
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Beneficiary Validation
CREATE TABLE beneficiary_validations (
    validation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES external_accounts(account_id),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id),
    name_match_result VARCHAR(50), -- EXACT, PARTIAL, MISMATCH, NOT_SUPPORTED
    account_valid BOOLEAN,
    risk_flags JSONB,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Funding Requests
CREATE TABLE funding_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) NOT NULL,
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id),
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    source_account_id UUID REFERENCES external_accounts(account_id),
    status VARCHAR(50) NOT NULL DEFAULT 'FUNDING_CREATED', -- FUNDING_CREATED, FUNDING_PENDING, FUNDING_CONFIRMED, FUNDING_FAILED, FUNDING_RETURNED
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    provider_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- FX Quotes
CREATE TABLE fx_quotes (
    quote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id),
    source_currency VARCHAR(10) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    source_amount DECIMAL(19,4) NOT NULL,
    destination_amount DECIMAL(19,4) NOT NULL,
    rate DECIMAL(19,6) NOT NULL,
    spread DECIMAL(19,6),
    fees DECIMAL(19,4) DEFAULT 0,
    provider_quote_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'QUOTED', -- QUOTED, LOCKED, EXECUTED, EXPIRED, FAILED
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FX Executions
CREATE TABLE fx_executions (
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID REFERENCES fx_quotes(quote_id),
    rail_transaction_id VARCHAR(100) NOT NULL,
    executed_rate DECIMAL(19,6) NOT NULL,
    source_amount DECIMAL(19,4) NOT NULL,
    destination_amount DECIMAL(19,4) NOT NULL,
    provider_execution_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'EXECUTED', -- EXECUTED, CONFIRMED, FAILED, REVERSED
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlement Instructions (external payout leg)
CREATE TABLE settlement_instructions (
    instruction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) NOT NULL,
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id),
    beneficiary_account_id UUID REFERENCES external_accounts(account_id),
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, ACCEPTED, PROCESSING, COMPLETED, FAILED, RETURNED, REVERSED, UNKNOWN
    provider_reference VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Settlement Results (external confirmation)
CREATE TABLE settlement_results (
    result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instruction_id UUID REFERENCES settlement_instructions(instruction_id),
    provider_reference VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    response_payload JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Connector Certifications
CREATE TABLE connector_certifications (
    certification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id VARCHAR(100) REFERENCES financial_connectors(connector_id),
    from_environment VARCHAR(50) NOT NULL, -- SANDBOX -> CERTIFICATION -> PRODUCTION
    to_environment VARCHAR(50) NOT NULL,
    certification_evidence JSONB NOT NULL,
    certified_by VARCHAR(100) NOT NULL,
    certified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Approvals (Four-Eyes / Maker-Checker)
CREATE TABLE financial_approvals (
    approval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) NOT NULL,
    approval_type VARCHAR(50) NOT NULL, -- MAKER, CHECKER
    approver_id VARCHAR(100) NOT NULL,
    decision VARCHAR(50) NOT NULL, -- APPROVED, REJECTED
    reason TEXT,
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_financial_approval_unique ON financial_approvals(rail_transaction_id, approval_type);

-- Transaction Limits
CREATE TABLE transaction_limits (
    limit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(50) NOT NULL, -- CORRIDOR, CUSTOMER, BENEFICIARY, PARTICIPANT, GLOBAL
    scope_reference VARCHAR(255), -- e.g. 'UK-IN', customer_id, etc.
    currency VARCHAR(10) NOT NULL,
    max_per_transaction DECIMAL(19,4),
    max_per_day DECIMAL(19,4),
    max_per_rolling_30d DECIMAL(19,4),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
