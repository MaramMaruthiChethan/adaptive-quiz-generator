CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'learner',
    subject_preferences JSONB NOT NULL DEFAULT '[]'::jsonb,
    difficulty_preference VARCHAR(20) NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    source_value TEXT,
    raw_text TEXT NOT NULL,
    cleaned_text TEXT NOT NULL,
    chunks JSONB NOT NULL DEFAULT '[]'::jsonb,
    keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    concepts JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    question_type VARCHAR(30) NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    answer TEXT NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium',
    chunk_index INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    current_difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium',
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    score NUMERIC(5,2) NOT NULL DEFAULT 0,
    accuracy NUMERIC(5,4) NOT NULL DEFAULT 0,
    average_response_time NUMERIC(8,2) NOT NULL DEFAULT 0,
    max_questions INTEGER NOT NULL DEFAULT 10,
    asked_question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE user_responses (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    response_time NUMERIC(8,2) NOT NULL DEFAULT 0,
    difficulty_at_time VARCHAR(20) NOT NULL DEFAULT 'Medium',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_questions_content ON questions(content_id);
CREATE INDEX idx_quizzes_user ON quizzes(user_id);
CREATE INDEX idx_responses_quiz ON user_responses(quiz_id);
