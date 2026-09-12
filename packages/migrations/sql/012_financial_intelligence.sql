-- Milestone 22: Global Financial Intelligence, Data Platform & Decision Intelligence
-- 012_financial_intelligence.sql

BEGIN;

-- Event Ingestion & Storage
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100),
    payload JSONB NOT NULL,
    source_service VARCHAR(100) NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_time ON analytics_events(occurred_at);

CREATE TABLE analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    dimensions JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fact Tables (Star Schema)
CREATE TABLE fact_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(100) NOT NULL,
    customer_id VARCHAR(100),
    merchant_id VARCHAR(100),
    provider_id VARCHAR(100),
    currency VARCHAR(10) NOT NULL,
    amount NUMERIC(20,4) NOT NULL,
    fee_amount NUMERIC(10,4) DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    corridor VARCHAR(20),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    settled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE fact_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id VARCHAR(100) NOT NULL,
    batch_id VARCHAR(100),
    settlement_type VARCHAR(50) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    gross_amount NUMERIC(20,4) NOT NULL,
    net_amount NUMERIC(20,4) NOT NULL,
    participant_count INTEGER,
    settled_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE fact_treasury (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    balance NUMERIC(20,4) NOT NULL,
    movement_amount NUMERIC(20,4),
    movement_type VARCHAR(50),
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fact_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    check_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    result VARCHAR(50) NOT NULL,
    risk_score NUMERIC(5,2),
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fact_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) NOT NULL,
    request_count INTEGER NOT NULL,
    success_count INTEGER NOT NULL,
    failure_count INTEGER NOT NULL,
    avg_latency_ms NUMERIC(10,2),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Dimension Tables
CREATE TABLE dim_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(100) UNIQUE NOT NULL,
    segment VARCHAR(50),
    country VARCHAR(10),
    tier VARCHAR(50),
    first_transaction_at TIMESTAMP WITH TIME ZONE,
    last_transaction_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE dim_merchants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    country VARCHAR(10),
    tier VARCHAR(50),
    onboarded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE dim_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(100) UNIQUE NOT NULL,
    provider_name VARCHAR(255),
    provider_type VARCHAR(50),
    region VARCHAR(50)
);

CREATE TABLE dim_currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_code VARCHAR(10) UNIQUE NOT NULL,
    currency_name VARCHAR(100),
    is_fiat BOOLEAN DEFAULT true
);

CREATE TABLE dim_countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) UNIQUE NOT NULL,
    country_name VARCHAR(100),
    region VARCHAR(50)
);

CREATE TABLE dim_time (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_key DATE UNIQUE NOT NULL,
    year INTEGER,
    quarter INTEGER,
    month INTEGER,
    week INTEGER,
    day_of_week INTEGER
);

-- KPI & Executive
CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_name VARCHAR(100) NOT NULL,
    kpi_value NUMERIC(20,4) NOT NULL,
    period VARCHAR(50) NOT NULL,
    dimensions JSONB,
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE executive_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    period VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE revenue_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    revenue_type VARCHAR(100) NOT NULL,
    amount NUMERIC(20,4) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    period_date DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE liquidity_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id VARCHAR(100),
    currency VARCHAR(10) NOT NULL,
    utilization_pct NUMERIC(5,2),
    idle_capital NUMERIC(20,4),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Intelligence Metrics
CREATE TABLE fraud_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    period_date DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE aml_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    metric_value NUMERIC(20,4) NOT NULL,
    period_date DATE NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE network_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor VARCHAR(20),
    volume NUMERIC(20,4),
    avg_settlement_ms NUMERIC(10,2),
    participant_count INTEGER,
    period_date DATE NOT NULL
);

CREATE TABLE merchant_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id VARCHAR(100) NOT NULL,
    health_score NUMERIC(5,2),
    revenue NUMERIC(20,4),
    volume INTEGER,
    period_date DATE NOT NULL
);

CREATE TABLE customer_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id VARCHAR(100) NOT NULL,
    ltv NUMERIC(20,4),
    activity_score NUMERIC(5,2),
    churn_probability NUMERIC(5,4),
    period_date DATE NOT NULL
);

-- Feature Store (ML)
CREATE TABLE feature_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value NUMERIC(20,6),
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forecasting
CREATE TABLE forecasting_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_type VARCHAR(100) NOT NULL,
    forecast_date DATE NOT NULL,
    predicted_value NUMERIC(20,4) NOT NULL,
    confidence NUMERIC(5,4),
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reporting
CREATE TABLE report_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    format VARCHAR(20) NOT NULL, -- CSV, EXCEL, PDF
    status VARCHAR(50) DEFAULT 'QUEUED',
    parameters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES report_jobs(id) ON DELETE CASCADE,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard
CREATE TABLE dashboard_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    dashboard_type VARCHAR(50) NOT NULL,
    layout JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dashboard_widget_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID REFERENCES dashboard_definitions(id) ON DELETE CASCADE,
    widget_name VARCHAR(100) NOT NULL,
    cached_data JSONB NOT NULL,
    refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit
CREATE TABLE analytics_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
