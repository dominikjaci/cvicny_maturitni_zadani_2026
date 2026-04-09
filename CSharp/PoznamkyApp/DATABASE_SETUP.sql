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

-- Povolení RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy pro users - všichni mohou čtení a zápis (bez omezení pro registraci/přihlášení)
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- RLS Policy pro notes - všichni mohou čtení a zápis
CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL
    USING (true)
    WITH CHECK (true);
