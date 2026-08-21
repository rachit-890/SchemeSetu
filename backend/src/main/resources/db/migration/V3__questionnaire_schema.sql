CREATE TABLE questionnaire_sessions (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE questionnaire_answers (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES questionnaire_sessions(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    value TEXT NOT NULL,
    answered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questionnaire_sessions_status ON questionnaire_sessions(status);
CREATE INDEX idx_questionnaire_answers_session_id ON questionnaire_answers(session_id);
