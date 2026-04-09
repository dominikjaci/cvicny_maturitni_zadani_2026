-- Vytvoření tabulky uživatelů
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření tabulky poznámek
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vytvoření indexu na user_id pro rychlejší vyhledávání
CREATE INDEX idx_notes_user_id ON notes(user_id);

-- Nastavení RLS (Row Level Security) - volitelné, ale doporučené
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Vytvořit policy pro notes tabulku
CREATE POLICY "Users can only see their own notes" ON notes
    FOR SELECT
    USING (auth.uid()::text = user_id::text);
