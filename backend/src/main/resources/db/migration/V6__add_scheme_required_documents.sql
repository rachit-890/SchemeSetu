ALTER TABLE schemes ADD COLUMN required_documents JSONB DEFAULT '[]'::jsonb;
