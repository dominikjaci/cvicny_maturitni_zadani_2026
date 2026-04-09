# ⚡ Rychlý start - Jak zprovoznit aplikaci

## Nejdůležitější kroky:

### 1️⃣ Supabase - Vytvoření databáze

```
1. Jděte na https://supabase.com
2. Vytvořte nový projekt
3. Zkopírujte si Project URL a API klíč
4. V SQL editoru spusťte obsah z DATABASE_SETUP.sql
```

**❌ Pokud to neuděláte: Registrace/přihlášení nebude fungovat!**

### 2️⃣ Konfigurace - appsettings.json

```json
{
  "Supabase": {
    "Url": "https://YOUR_PROJECT.supabase.co",
    "Key": "your_api_key_here"
  }
}
```

Nahraďte `YOUR_PROJECT` a `your_api_key_here` vašimi údaji ze Supabase.

### 3️⃣ Lokální spuštění

```bash
dotnet restore
dotnet run
```

Aplikace bude na: `https://localhost:5001`

### 4️⃣ Testování

1. Klikněte na "Registrace"
2. Vyplňte údaje
3. Měli byste být přesměrováni na stránku s poznámkami
4. Zkuste vytvořit poznámku

---

## Pokud registrace nefunguje:

### ❌ Problém: "Connection refused" nebo "Request failed"

**Řešení:**
1. Zkontrolujte, že Supabase URL je správná v `appsettings.json`
2. Zkontrolujte, že máte internet
3. Zkontrolujte konzoli na chybové zprávy (měli byste vidět logging)

### ❌ Problém: "Registrace selhala"

**Řešení:**
1. V Supabase SQL editoru spusťte: 
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```
2. Měly byste vidět `users` a `notes` tabulky
3. Pokud ne, spusťte znovu `DATABASE_SETUP.sql`

### ❌ Problém: RLS error

**Řešení:**
Pokud vidíte "new row violates row-level security policy", spusťte v SQL editoru:
```sql
-- Resetovat policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;

-- Vytvořit nové
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true) WITH CHECK (true);
```

---

## Co dělat pokud vše funguje:

1. **Pushněte na GitHub**
```bash
git add .
git commit -m "Aplikace hotova"
git push origin main
```

2. **Nasaďte na Render.com**
   - Jděte na https://render.com
   - Vyberte GitHub repo
   - Přidejte proměnné: `Supabase__Url` a `Supabase__Key`
   - Klikněte Deploy

3. **Aplikace by měla být live!** 🚀

---

## Užitečné příkazy:

```bash
# Kompilace
dotnet build

# Spuštění
dotnet run

# Čistka
dotnet clean

# Publikace (pro produkci)
dotnet publish -c Release
```

---

## Debugging - Jak vidět chyby:

Chyby se budou tisknout v konzoli (Output window v Visual Studiu).

Hledejte zprávy jako:
```
[INF] Registering user: jmeno
[ERR] Registration failed: 400 - ...
```

Tím se dozvíte, co se stalo.

---

**Máte otázku? Zkontrolujte si:**
- ✅ Je Supabase URL správná?
- ✅ Je API klíč správný?
- ✅ Běží tabulky v databázi?
- ✅ Vidíte chyby v konzoli?
