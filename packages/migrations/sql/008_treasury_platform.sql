-- Milestone 18: Enterprise Treasury, Liquidity & Financial Operations Platform
-- 008_treasury_platform.sql

BEGIN;

-- Core Treasury
CREATE TABLE treasury_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- NOSTRO, VOSTRO, RESERVE, SETTLEMENT
    provider_id VARCHAR(100),
    balance NUMERIC(20,4) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    total_balance NUMERIC(20,4) DEFAULT 0,
    locked_balance NUMERIC(20,4) DEFAULT 0,
    available_balance NUMERIC(20,4) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_account_id UUID REFERENCES treasury_accounts(id),
    destination_account_id UUID REFERENCES treasury_accounts(id),
    amount NUMERIC(20,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE treasury_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES treasury_accounts(id),
    limit_type VARCHAR(50) NOT NULL,
    max_amount NUMERIC(20,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Liquidity Management
CREATE TABLE liquidity_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    total_liquidity NUMERIC(20,4) DEFAULT 0,
    reserved_liquidity NUMERIC(20,4) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE liquidity_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES liquidity_pools(id),
    amount NUMERIC(20,4) NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- RESERVE, RELEASE, DEPOSIT, WITHDRAW
    reference_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(20,4) DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE provider_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    min_balance NUMERIC(20,4) NOT NULL,
    max_balance NUMERIC(20,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FX & Hedging
CREATE TABLE fx_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    exposure_amount NUMERIC(20,4) DEFAULT 0,
    hedged_amount NUMERIC(20,4) DEFAULT 0,
    unrealized_pnl NUMERIC(20,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fx_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    rate NUMERIC(15,6) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cash Management & Forecasting
CREATE TABLE cash_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(20,4) DEFAULT 0,
    as_of_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cash_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    forecast_date DATE NOT NULL,
    expected_inflow NUMERIC(20,4) DEFAULT 0,
    expected_outflow NUMERIC(20,4) DEFAULT 0,
    net_position NUMERIC(20,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reconciliation
CREATE TABLE reconciliation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_type VARCHAR(50) NOT NULL, -- THREE_WAY, PROVIDER, INTERNAL
    status VARCHAR(50) DEFAULT 'RUNNING',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    summary JSONB
);

CREATE TABLE reconciliation_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES reconciliation_jobs(id),
    transaction_id VARCHAR(100) NOT NULL,
    match_status VARCHAR(50) NOT NULL, -- MATCHED, DISCREPANCY, MISSING_LEDGER, MISSING_PROVIDER
    discrepancy_amount NUMERIC(20,4),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounting
CREATE TABLE accounting_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) NOT NULL,
    entry_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accounting_entry_id UUID REFERENCES accounting_entries(id),
    account_code VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    debit_amount NUMERIC(20,4) DEFAULT 0,
    credit_amount NUMERIC(20,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reporting & Analytics
CREATE TABLE financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    dimensions JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treasury_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE liquidity_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES liquidity_pools(id),
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE treasury_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Extended Account Types (Sub-tables/views conceptually, just creating tables for them as specified)
CREATE TABLE settlement_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID REFERENCES treasury_accounts(id),
    settlement_rail VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID REFERENCES treasury_accounts(id),
    bank_name VARCHAR(255) NOT NULL,
    iban VARCHAR(100),
    swift_bic VARCHAR(20)
);

CREATE TABLE nostro_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID REFERENCES treasury_accounts(id),
    correspondent_bank VARCHAR(255) NOT NULL
);

CREATE TABLE vostro_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID REFERENCES treasury_accounts(id),
    respondent_bank VARCHAR(255) NOT NULL
);

CREATE TABLE reserve_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_account_id UUID REFERENCES treasury_accounts(id),
    reserve_purpose VARCHAR(255) NOT NULL
);

CREATE TABLE currency_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treasury_position_id UUID REFERENCES treasury_positions(id),
    currency VARCHAR(10) NOT NULL,
    amount NUMERIC(20,4) DEFAULT 0
);

COMMIT;
