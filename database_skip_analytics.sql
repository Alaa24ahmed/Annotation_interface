-- Add template_skips table to track skipped templates
-- Run this SQL in your Supabase dashboard or via psql

CREATE TABLE IF NOT EXISTS template_skips (
    id SERIAL PRIMARY KEY,
    template_id INTEGER NOT NULL,
    reasoning_category VARCHAR(255),
    cultural_aspect VARCHAR(255),
    original_template TEXT,
    user_id VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    user_ip VARCHAR(45),
    is_prolific_user BOOLEAN DEFAULT FALSE,
    skip_reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
