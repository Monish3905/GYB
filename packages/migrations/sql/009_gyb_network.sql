-- Milestone 19: Native Payment Network, Clearing, Settlement Rail & GYB Network
-- 009_gyb_network.sql

BEGIN;

-- Network Participants
CREATE TABLE participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name VARCHAR(255) NOT NULL,
    participant_type VARCHAR(100) NOT NULL, -- BANK, FINTECH, PSP, WALLET, CRYPTO_EXCHANGE
    bic_code VARCHAR(11) UNIQUE,
    status VARCHAR(50) DEFAULT 'ONBOARDING', -- ACTIVE, SUSPENDED
    jurisdiction VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participant_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    supported_currencies JSONB NOT NULL,
    supported_services JSONB NOT NULL,
    clearing_type VARCHAR(50) NOT NULL, -- RTGS, DNS, HYBRID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participant_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    operational_status VARCHAR(50) DEFAULT 'ONLINE',
    compliance_status VARCHAR(50) DEFAULT 'CLEARED',
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Network Accounts
CREATE TABLE network_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    account_number VARCHAR(100) UNIQUE NOT NULL,
    currency VARCHAR(10) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- SETTLEMENT, RESERVE, LIQUIDITY
    balance NUMERIC(20,4) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE participant_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
    internal_account_ref VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES network_accounts(id) ON DELETE CASCADE,
    net_debit_cap NUMERIC(20,4) NOT NULL,
    intraday_limit NUMERIC(20,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clearing Engine
CREATE TABLE clearing_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_reference VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, CALCULATING, CLOSED, SETTLED
    currency VARCHAR(10) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE clearing_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES clearing_batches(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES participants(id),
    net_position NUMERIC(20,4) NOT NULL, -- positive means they receive, negative means they pay
    gross_debit NUMERIC(20,4) NOT NULL,
    gross_credit NUMERIC(20,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settlement Engine
CREATE TABLE settlement_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clearing_batch_id UUID REFERENCES clearing_batches(id),
    settlement_type VARCHAR(50) NOT NULL, -- DNS
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, EXECUTING, COMPLETED, FAILED
    executed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE settlement_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_batch_id UUID REFERENCES settlement_batches(id) ON DELETE CASCADE,
    account_id UUID REFERENCES network_accounts(id),
    amount NUMERIC(20,4) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    settled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE settlement_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency VARCHAR(10) NOT NULL,
    window_start TIME NOT NULL,
    window_end TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC'
);

-- Liquidity
CREATE TABLE liquidity_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id),
    currency VARCHAR(10) NOT NULL,
    available_liquidity NUMERIC(20,4) DEFAULT 0,
    locked_liquidity NUMERIC(20,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE liquidity_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_account_id UUID REFERENCES liquidity_accounts(id),
    to_account_id UUID REFERENCES liquidity_accounts(id),
    amount NUMERIC(20,4) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Network Routing & Rail
CREATE TABLE network_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_currency VARCHAR(10),
    target_currency VARCHAR(10),
    primary_route_type VARCHAR(50) NOT NULL, -- INTERNAL_RAIL, EXTERNAL_PROVIDER
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES network_routes(id),
    condition_json JSONB NOT NULL,
    priority INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE routing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(100) NOT NULL,
    route_taken VARCHAR(100) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_participant_id UUID REFERENCES participants(id),
    receiver_participant_id UUID REFERENCES participants(id),
    path_json JSONB NOT NULL,
    is_direct BOOLEAN DEFAULT true
);

CREATE TABLE rail_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_account_id UUID REFERENCES network_accounts(id),
    receiver_account_id UUID REFERENCES network_accounts(id),
    amount NUMERIC(20,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) NOT NULL, -- ACCEPTED, CLEARING, SETTLED, FAILED
    clearing_mode VARCHAR(50) NOT NULL, -- RTGS, DNS
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rail_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id UUID REFERENCES rail_transactions(id),
    confirmation_hash VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'QUEUED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Network Messaging
CREATE TABLE network_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR(100) UNIQUE NOT NULL,
    message_type VARCHAR(50) NOT NULL, -- pacs.008, pacs.002, pain.001
    sender_id UUID REFERENCES participants(id),
    receiver_id UUID REFERENCES participants(id),
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PROCESSED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    network_message_id UUID REFERENCES network_messages(id),
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Network Nodes & Directory
CREATE TABLE network_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id),
    node_url VARCHAR(255) NOT NULL,
    public_key TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE TABLE network_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES participants(id),
    services_exposed JSONB,
    endpoints JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Network Governance
CREATE TABLE network_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_name VARCHAR(100) NOT NULL,
    policy_document JSONB NOT NULL,
    enforcement_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE protocol_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    release_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE fee_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(100) NOT NULL,
    flat_fee NUMERIC(10,4) DEFAULT 0,
    percentage_fee NUMERIC(5,4) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE fee_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id UUID REFERENCES rail_transactions(id),
    fee_amount NUMERIC(10,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Auditing & Monitoring
CREATE TABLE network_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    latency_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settlement_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_batch_id UUID REFERENCES settlement_batches(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL,
    total_volume NUMERIC(20,4) DEFAULT 0,
    total_transactions BIGINT DEFAULT 0,
    unique_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
