-- Milestone 25: GYB End-to-End Rail Validation & Real-World Transaction Readiness
-- 015_rail_validation.sql

BEGIN;

-- Rail Participants
CREATE TABLE rail_participants (
    participant_id VARCHAR(100) PRIMARY KEY,
    participant_type VARCHAR(50) NOT NULL, -- GYB_NODE, PSP, BANK, LIQUIDITY_PROVIDER, FX_PROVIDER
    jurisdiction VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'REGISTERED', -- REGISTERED, ACTIVE, SUSPENDED, QUARANTINED, DEACTIVATED
    supported_currencies JSONB,
    capabilities JSONB,
    public_key TEXT,
    compliance_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rail Nodes
CREATE TABLE rail_nodes (
    node_id VARCHAR(100) PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    ip_address VARCHAR(255),
    public_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_heartbeat TIMESTAMP WITH TIME ZONE
);

-- Rail Transactions
CREATE TABLE rail_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) UNIQUE NOT NULL,
    correlation_id VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    originating_country VARCHAR(10) NOT NULL,
    destination_country VARCHAR(10) NOT NULL,
    source_currency VARCHAR(10) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    source_amount DECIMAL(19,4) NOT NULL,
    destination_amount DECIMAL(19,4) NOT NULL,
    fx_rate DECIMAL(19,6),
    fees DECIMAL(19,4) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', 
    protocol_version VARCHAR(20) DEFAULT '1.0',
    participant_id VARCHAR(100) REFERENCES rail_participants(participant_id),
    node_id VARCHAR(100) REFERENCES rail_nodes(node_id),
    compliance_state VARCHAR(50),
    settlement_state VARCHAR(50),
    reconciliation_state VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rail_tx_correlation ON rail_transactions(correlation_id);
CREATE INDEX idx_rail_tx_status ON rail_transactions(status);

-- Rail Transaction Events
CREATE TABLE rail_transaction_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) REFERENCES rail_transactions(rail_transaction_id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    from_state VARCHAR(50),
    to_state VARCHAR(50),
    payload JSONB,
    node_id VARCHAR(100),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transaction Signatures & Integrity
CREATE TABLE transaction_integrity_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) REFERENCES rail_transactions(rail_transaction_id) ON DELETE CASCADE,
    participant_id VARCHAR(100) REFERENCES rail_participants(participant_id),
    signature TEXT NOT NULL,
    payload_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Clearing Positions
CREATE TABLE clearing_positions (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id VARCHAR(100) REFERENCES rail_participants(participant_id),
    currency VARCHAR(10) NOT NULL,
    net_amount DECIMAL(19,4) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, SETTLING, SETTLED, FAILED
    cycle_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clearing_obligations (
    obligation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) REFERENCES rail_transactions(rail_transaction_id),
    position_id UUID REFERENCES clearing_positions(position_id),
    amount DECIMAL(19,4) NOT NULL,
    type VARCHAR(20) NOT NULL, -- DEBIT, CREDIT
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- External Settlement Integration
CREATE TABLE external_settlement_requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) REFERENCES rail_transactions(rail_transaction_id),
    provider_id VARCHAR(100) NOT NULL,
    instruction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    beneficiary_details JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, SUBMITTED, CONFIRMED, FAILED, CANCELLED
    provider_reference VARCHAR(255),
    submitted_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Reconciliation
CREATE TABLE reconciliation_records (
    reconciliation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rail_transaction_id VARCHAR(100) REFERENCES rail_transactions(rail_transaction_id),
    internal_ledger_ref VARCHAR(255),
    clearing_position_id UUID REFERENCES clearing_positions(position_id),
    settlement_request_id UUID REFERENCES external_settlement_requests(request_id),
    status VARCHAR(50) NOT NULL, -- MATCHED, MISMATCH_AMOUNT, MISMATCH_CURRENCY, MISSING_SETTLEMENT, QUARANTINED
    discrepancy_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Production Readiness
CREATE TABLE production_readiness_checks (
    check_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_name VARCHAR(100) NOT NULL, -- SECURITY, COMPLIANCE, LIQUIDITY, FX, RECONCILIATION
    evaluator VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- PASS, FAIL, WARNING, NOT_READY
    reason TEXT,
    evidence_ref VARCHAR(255),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
