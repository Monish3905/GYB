-- Milestone 27: GYB Real-World Remittance Application
-- 017_remittance_application.sql

BEGIN;

-- Web Application Users
CREATE TABLE web_users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'CUSTOMER', -- CUSTOMER, OPERATIONS, COMPLIANCE, ADMIN
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, LOCKED, SUSPENDED
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Customer Profiles
CREATE TABLE customer_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    nationality VARCHAR(50),
    phone_number VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(10),
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED', -- UNVERIFIED, PENDING, VERIFIED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- KYC Verification Cases
CREATE TABLE kyc_cases (
    case_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES customer_profiles(profile_id),
    provider VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    document_references JSONB,
    provider_case_id VARCHAR(255),
    decision_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Beneficiaries UI Mapping (extends MS26 beneficiary concepts)
CREATE TABLE customer_beneficiaries (
    beneficiary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id) ON DELETE CASCADE,
    external_account_id UUID NOT NULL, -- Refers to MS26 external_accounts
    nickname VARCHAR(100),
    relationship VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Remittance Orders (Customer facing abstraction of GYB Rail Transaction)
CREATE TABLE remittance_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id),
    rail_transaction_id VARCHAR(100) NOT NULL, -- Links to MS25 rail_transactions
    quote_id UUID NOT NULL, -- Links to MS26 fx_quotes
    beneficiary_id UUID REFERENCES customer_beneficiaries(beneficiary_id),
    source_amount DECIMAL(19,4) NOT NULL,
    destination_amount DECIMAL(19,4) NOT NULL,
    fee_amount DECIMAL(19,4) NOT NULL,
    total_cost DECIMAL(19,4) NOT NULL,
    customer_status VARCHAR(50) NOT NULL, -- Map from rail state to UI state
    estimated_delivery_at TIMESTAMP WITH TIME ZONE,
    purpose_of_remittance VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Sessions
CREATE TABLE customer_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(512) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE customer_notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id),
    type VARCHAR(50) NOT NULL, -- EMAIL, SMS, IN_APP
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES web_users(user_id),
    order_id UUID REFERENCES remittance_orders(order_id),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, WAITING_FOR_CUSTOMER, RESOLVED, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Operations Audit Actions (UI layer specific actions)
CREATE TABLE operation_actions (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES web_users(user_id),
    action_type VARCHAR(100) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
