-- Langscope Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'judge')),
    organization_id UUID,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    api_key VARCHAR(255) UNIQUE NOT NULL,
    battles_limit INTEGER DEFAULT 1000,
    battles_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key
ALTER TABLE users ADD CONSTRAINT fk_organization 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    battle_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(5,2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Models table
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    provider VARCHAR(255) NOT NULL,
    logo TEXT,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('open-source', 'proprietary', 'api-only')),
    context_length INTEGER NOT NULL,
    cost_per_1m_tokens DECIMAL(10,4) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    release_date DATE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Model Rankings table (per domain)
CREATE TABLE model_rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    previous_rank INTEGER,
    elo_score DECIMAL(10,2) DEFAULT 1500,
    uncertainty DECIMAL(10,2) DEFAULT 100,
    battle_count INTEGER DEFAULT 0,
    win_count INTEGER DEFAULT 0,
    loss_count INTEGER DEFAULT 0,
    tie_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    last_battle_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(model_id, domain_id)
);

-- Elo History table (for charts)
CREATE TABLE elo_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    elo_score DECIMAL(10,2) NOT NULL,
    uncertainty DECIMAL(10,2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Cases table
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    context TEXT,
    expected_criteria TEXT[],
    difficulty VARCHAR(50) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category VARCHAR(255),
    metadata JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'failed')),
    type VARCHAR(50) DEFAULT 'public' CHECK (type IN ('public', 'private')),
    battle_count INTEGER DEFAULT 0,
    completed_battles INTEGER DEFAULT 0,
    config JSONB NOT NULL,
    results JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Evaluation Models (many-to-many)
CREATE TABLE evaluation_models (
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    PRIMARY KEY (evaluation_id, model_id)
);

-- Battles table
CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    test_case_id UUID NOT NULL REFERENCES test_cases(id) ON DELETE RESTRICT,
    model_a_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    model_b_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response_a TEXT NOT NULL,
    response_b TEXT NOT NULL,
    winner VARCHAR(10) CHECK (winner IN ('A', 'B', 'Tie')),
    metadata JSONB,
    blockchain_verified BOOLEAN DEFAULT FALSE,
    arweave_id VARCHAR(255),
    ipfs_cid VARCHAR(255),
    polygon_checkpoint VARCHAR(255),
    hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Judge Votes table
CREATE TABLE judge_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    judge_id UUID REFERENCES users(id) ON DELETE SET NULL,
    judge_name VARCHAR(255),
    vote VARCHAR(10) NOT NULL CHECK (vote IN ('A', 'B', 'Tie')),
    reasoning TEXT,
    criteria JSONB NOT NULL,
    confidence INTEGER CHECK (confidence BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_domains_slug ON domains(slug);
CREATE INDEX idx_domains_featured ON domains(featured);
CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_provider ON models(provider);
CREATE INDEX idx_model_rankings_domain ON model_rankings(domain_id);
CREATE INDEX idx_model_rankings_rank ON model_rankings(domain_id, rank);
CREATE INDEX idx_elo_history_model_domain ON elo_history(model_id, domain_id);
CREATE INDEX idx_test_cases_domain ON test_cases(domain_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_created_by ON evaluations(created_by);
CREATE INDEX idx_battles_evaluation ON battles(evaluation_id);
CREATE INDEX idx_battles_domain ON battles(domain_id);
CREATE INDEX idx_battles_models ON battles(model_a_id, model_b_id);
CREATE INDEX idx_judge_votes_battle ON judge_votes(battle_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_model_rankings_updated_at BEFORE UPDATE ON model_rankings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verification Records table (replaces blockchain storage)
CREATE TABLE verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type VARCHAR(50) NOT NULL, -- 'evaluation', 'battle', 'ranking'
    record_id UUID NOT NULL,
    data_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of the data
    metadata JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_records_type_id ON verification_records(record_type, record_id);
CREATE INDEX idx_verification_records_hash ON verification_records(data_hash);

CREATE TRIGGER update_verification_records_updated_at BEFORE UPDATE ON verification_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

