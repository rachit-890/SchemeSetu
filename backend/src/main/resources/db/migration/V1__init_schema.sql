CREATE TABLE schemes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    issuing_body VARCHAR(255),
    source_url TEXT,
    application_process TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE eligibility_rules (
    id BIGSERIAL PRIMARY KEY,
    scheme_id BIGINT NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
    field VARCHAR(50) NOT NULL,
    operator VARCHAR(20) NOT NULL,
    value TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schemes_status ON schemes(status);
CREATE INDEX idx_eligibility_rules_scheme_id ON eligibility_rules(scheme_id);
