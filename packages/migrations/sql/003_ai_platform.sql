-- Migration 003: AI Platform Schema
-- Global Payment Operating System - Milestone 12

-- AI MODELS
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  model_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MODEL VERSIONS
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id),
  version_tag VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('TRAINING','STAGING','PRODUCTION','ARCHIVED')),
  training_metrics JSONB,
  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FEATURE STORE (Offline)
CREATE TABLE IF NOT EXISTS feature_store (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BEHAVIOR PROFILES (AI enhanced)
CREATE TABLE IF NOT EXISTS behavior_profiles_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE,
  learned_features JSONB NOT NULL DEFAULT '{}',
  risk_drift NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FRAUD PREDICTIONS
CREATE TABLE IF NOT EXISTS fraud_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  model_version_id UUID NOT NULL REFERENCES model_versions(id),
  fraud_probability NUMERIC(5,4) NOT NULL,
  top_features TEXT[] DEFAULT '{}',
  confidence NUMERIC(5,2) NOT NULL,
  predicted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADAPTIVE SCORES
CREATE TABLE IF NOT EXISTS adaptive_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  rule_score INTEGER NOT NULL,
  ml_score INTEGER NOT NULL,
  adaptive_score INTEGER NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GRAPH ENTITIES (Offline projection)
CREATE TABLE IF NOT EXISTS graph_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GRAPH EDGES (Offline projection)
CREATE TABLE IF NOT EXISTS graph_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_entity UUID NOT NULL,
  to_entity UUID NOT NULL,
  relationship_type VARCHAR(50) NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ENTITY MATCHES
CREATE TABLE IF NOT EXISTS entity_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_identity_id UUID NOT NULL,
  matched_identity_id UUID NOT NULL,
  match_score NUMERIC(5,2) NOT NULL,
  match_reasons TEXT[] DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MULE SCORES
CREATE TABLE IF NOT EXISTS mule_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  mule_probability NUMERIC(5,4) NOT NULL,
  flags TEXT[] DEFAULT '{}',
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  recommendation VARCHAR(50) NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  reasoning TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MODEL METRICS
CREATE TABLE IF NOT EXISTS model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID NOT NULL REFERENCES model_versions(id),
  metric_name VARCHAR(50) NOT NULL,
  metric_value NUMERIC(10,4) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- MODEL DRIFT
CREATE TABLE IF NOT EXISTS model_drift (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID NOT NULL REFERENCES model_versions(id),
  feature_name VARCHAR(100) NOT NULL,
  drift_score NUMERIC(10,4) NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRAINING JOBS
CREATE TABLE IF NOT EXISTS training_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ai_models(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING','RUNNING','COMPLETED','FAILED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  logs TEXT
);

-- EMBEDDINGS (pgvector placeholder)
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  -- We use TEXT here instead of real pgvector for compatibility without extensions
  vector_data TEXT NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- VECTOR INDEX (Metadata for embeddings)
CREATE TABLE IF NOT EXISTS vector_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  index_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI AUDIT LOGS
CREATE TABLE IF NOT EXISTS ai_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FEATURE SNAPSHOTS
CREATE TABLE IF NOT EXISTS feature_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  features JSONB NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PREDICTION LOGS
CREATE TABLE IF NOT EXISTS prediction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version_id UUID NOT NULL REFERENCES model_versions(id),
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  latency_ms INTEGER,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- EXPLANATIONS
CREATE TABLE IF NOT EXISTS explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_log_id UUID NOT NULL REFERENCES prediction_logs(id),
  explanation_text TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_fraud_payment ON fraud_predictions(payment_id);
CREATE INDEX IF NOT EXISTS idx_feature_entity ON feature_store(entity_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_payment ON adaptive_scores(payment_id);
