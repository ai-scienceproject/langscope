-- Seed data for Langscope

-- Insert sample domains
INSERT INTO domains (name, slug, description, icon, featured, confidence_score) VALUES
('Code Generation', 'code-generation', 'Generate, complete, and debug code across multiple programming languages', '💻', true, 92.5),
('Creative Writing', 'creative-writing', 'Creative storytelling, poetry, and narrative generation', '✍️', true, 88.3),
('Mathematics', 'mathematics', 'Solve complex mathematical problems and provide step-by-step solutions', '🔢', true, 90.1),
('Data Analysis', 'data-analysis', 'Analyze data, create insights, and generate visualizations', '📊', false, 85.7),
('Legal', 'legal', 'Legal document analysis and contract review', '⚖️', false, 87.2),
('Medical', 'medical', 'Medical information and healthcare advisory', '🏥', false, 86.9),
('Translation', 'translation', 'Multilingual translation and localization', '🌐', false, 91.3),
('Question Answering', 'question-answering', 'General knowledge and factual question answering', '❓', true, 89.4),
('Summarization', 'summarization', 'Text summarization and content compression', '📝', false, 88.6),
('Sentiment Analysis', 'sentiment-analysis', 'Analyze sentiment and emotional tone in text', '😊', false, 84.2),
('Chat & Conversation', 'chat-conversation', 'Natural conversational interactions', '💬', true, 91.8),
('SEO & Marketing', 'seo-marketing', 'SEO optimization and marketing content generation', '📈', false, 83.5);

-- Insert sample models
INSERT INTO models (name, slug, provider, description, type, context_length, cost_per_1m_tokens, verified, release_date) VALUES
('GPT-4 Turbo', 'gpt-4-turbo', 'OpenAI', 'Most capable GPT-4 model with 128K context window', 'proprietary', 128000, 10.00, true, '2023-11-06'),
('GPT-3.5 Turbo', 'gpt-3.5-turbo', 'OpenAI', 'Fast and efficient model for most tasks', 'proprietary', 16385, 0.50, true, '2023-03-01'),
('Claude 3 Opus', 'claude-3-opus', 'Anthropic', 'Most powerful Claude model for complex tasks', 'proprietary', 200000, 15.00, true, '2024-03-04'),
('Claude 3 Sonnet', 'claude-3-sonnet', 'Anthropic', 'Balanced performance and speed', 'proprietary', 200000, 3.00, true, '2024-03-04'),
('Claude 3 Haiku', 'claude-3-haiku', 'Anthropic', 'Fastest Claude model for simple tasks', 'proprietary', 200000, 0.25, true, '2024-03-04'),
('Gemini Pro', 'gemini-pro', 'Google', 'Google''s advanced reasoning model', 'proprietary', 32000, 0.50, true, '2023-12-13'),
('Llama 3 70B', 'llama-3-70b', 'Meta', 'Open source model with strong performance', 'open-source', 8192, 0.90, true, '2024-04-18'),
('Llama 3 8B', 'llama-3-8b', 'Meta', 'Smaller, faster open source model', 'open-source', 8192, 0.20, true, '2024-04-18'),
('Mixtral 8x7B', 'mixtral-8x7b', 'Mistral AI', 'Mixture of experts model with excellent performance', 'open-source', 32000, 0.70, true, '2023-12-11'),
('Command R+', 'command-r-plus', 'Cohere', 'Enterprise-focused model with RAG capabilities', 'proprietary', 128000, 3.00, true, '2024-03-11');

-- Insert sample test cases for Code Generation domain
WITH code_domain AS (SELECT id FROM domains WHERE slug = 'code-generation' LIMIT 1)
INSERT INTO test_cases (domain_id, prompt, expected_criteria, difficulty, category) 
SELECT 
    code_domain.id,
    'Write a Python function that implements binary search on a sorted array',
    ARRAY['correctness', 'efficiency', 'readability', 'edge cases'],
    'medium',
    'algorithms'
FROM code_domain
UNION ALL
SELECT 
    code_domain.id,
    'Create a React component for a reusable button with variants',
    ARRAY['functionality', 'typescript', 'props handling', 'styling'],
    'medium',
    'frontend'
FROM code_domain
UNION ALL
SELECT 
    code_domain.id,
    'Implement a simple REST API endpoint using Node.js and Express',
    ARRAY['correctness', 'error handling', 'best practices', 'documentation'],
    'easy',
    'backend'
FROM code_domain;

-- Insert sample test cases for Creative Writing domain
WITH writing_domain AS (SELECT id FROM domains WHERE slug = 'creative-writing' LIMIT 1)
INSERT INTO test_cases (domain_id, prompt, expected_criteria, difficulty, category)
SELECT 
    writing_domain.id,
    'Write a short story about a robot discovering emotions',
    ARRAY['creativity', 'coherence', 'character development', 'emotional depth'],
    'hard',
    'fiction'
FROM writing_domain
UNION ALL
SELECT 
    writing_domain.id,
    'Compose a haiku about autumn',
    ARRAY['format', 'imagery', 'seasonal reference', 'emotional resonance'],
    'easy',
    'poetry'
FROM writing_domain;

-- Create admin user (password: admin123)
INSERT INTO users (email, name, role, email_verified, password_hash) VALUES
('admin@langscope.ai', 'Admin User', 'admin', true, '$2b$10$rKjUZHlYpRoFNDvWXH6ZBuCXwB8KQRpFHV7jU9VmX8YYW8yJ6kH8K');

-- Create demo organization
INSERT INTO organizations (name, slug, plan, api_key, battles_limit) VALUES
('Demo Company', 'demo-company', 'pro', 'demo_api_key_' || gen_random_uuid()::text, 10000);

