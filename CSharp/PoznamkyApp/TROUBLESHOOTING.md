# 🔧 Troubleshooting - Řešení běžných problémů

## Chyba: "Registrace selhala" - nic se nestane

### Příčiny:
1. Supabase databáze není dostupná
2. RLS politiky blokují operace
3. Nesprávná URL nebo API klíč
4. Tabulky neexistují v databázi

### Řešení:

#### Krok 1: Ověřte tabulky v Supabase
V Supabase SQL editoru spusťte:
```sql
-- Zobrazit všechny tabulky
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ověřit strukturu users tabulky
SELECT * FROM users LIMIT 1;
```

**Měli byste vidět:**
- Tabulka `users` s sloupci: id, username, email, password_hash, created_at
- Tabulka `notes` s sloupci: id, user_id, title, content, created_at, updated_at

Pokud tabulky neexistují, spusťte `DATABASE_SETUP.sql`.

#### Krok 2: Ověřte RLS politiky
```sql
-- Zobrazit aktuální politiky
SELECT * FROM pg_policies 
WHERE tablename IN ('users', 'notes');

-- Zkontrolovat RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'notes');
```

**Měli byste vidět:**
- RLS je ENABLED (true)
- Existují politiky "Allow all operations on users" a "Allow all operations on notes"

Pokud politiky chybí nebo jsou špatně, spusťte:
```sql
-- Resetovat policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
DROP POLICY IF EXISTS "Users can only see their own notes" ON notes;

-- Vytvořit správné policies
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true) WITH CHECK (true);
```

#### Krok 3: Ověřte appsettings.json
```json
{
  "Supabase": {
    "Url": "https://vszxyyvieexgbkjsbuqb.supabase.co",
    "Key": "sb_publishable_0ouThm0oBtn0P1jkwiBzjw_Nd8YdxjV"
  }
}
```

⚠️ **Poznámka:** V produkci byste měli používat environment variables, ne appsettings.json!

#### Krok 4: Zkontrolujte síť
V konzoli (Output window) byste měli vidět:
```
[INF] Registering user: jmeno
```

Pokud tuto zprávu nevidíte, přihlášení se vůbec nespustilo.
Pokud vidíte, ale bez odpovědi, Supabase není dostupná.

---

## Chyba: "Tabulka neexistuje" - 404 REST not found

### Příčina:
Supabase REST API není povolena pro vaši tabulku.

### Řešení:
1. V Supabase jděte do **SQL editoru**
2. Spusťte `DATABASE_SETUP.sql` znovu - tím se tabulky vytvoří

Pokud problém přetrvává:
```sql
-- Ověřit, že tabulka existuje
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS notes CASCADE;

-- Spustit celý skript znovu
-- [obsah z DATABASE_SETUP.sql]
```

---

## Chyba: "Unauthorized" - 401

### Příčina:
API klíč je nesprávný nebo vypršel.

### Řešení:
1. V Supabase jděte do **Settings → API**
2. Zkopírujte si nový API klíč (Anon key)
3. Vložte do `appsettings.json`
4. Restartujte aplikaci

---

## Chyba: "Username already exists"

### Příčina:
Uživatelské jméno je již v databázi registrované.

### Řešení:
Jednoduše zkuste jiné uživatelské jméno.

Pokud chcete smazat všechny uživatele a začít od nuly:
```sql
DELETE FROM users;
```

---

## Chyba: "Hesla se nehodují"

### Příčina:
Zadali jste dvě různá hesla v registraci.

### Řešení:
Ověřte, že obě hesla jsou shodná. Hesla jsou case-sensitive (rozlišují VELKÁ/malá písmena).

---

## Chyba: "Neplatné přihlašovací údaje" - selhalo přihlášení

### Příčina:
Uživatelské jméno nebo heslo je špatné.

### Řešení:
1. Zkontrolujte, že uživatel existuje:
```sql
SELECT * FROM users WHERE username = 'vase_jmeno';
```

2. Zkontrolujte heslo - zkuste si je resetovat smazáním uživatele a registrací znovu:
```sql
DELETE FROM users WHERE username = 'vase_jmeno';
```

---

## Chyba: "Poznámka se neukládá" - CREATE note failed

### Příčina:
1. Nejste přihlášeni (user_id je null)
2. user_id neexistuje v users tabulce
3. RLS politiky blokují zápis

### Řešení:
```sql
-- Ověřit, že poznámky existují
SELECT * FROM notes;

-- Ověřit, že user_id existuje
SELECT id FROM users;

-- Pokud problém přetrvává, resetovat RLS:
CREATE POLICY "Allow all operations on notes" ON notes
    FOR ALL USING (true) WITH CHECK (true);
```

---

## Chyba: "500 Internal Server Error"

### Příčina:
Neočekávaná chyba na serveru.

### Řešení:
1. Zkontrolujte **Output window** (Build → Output) na chybové zprávy
2. Zkontrolujte síť (jste připojeni?)
3. Restartujte aplikaci

---

## Chyba: "Connection timeout"

### Příčina:
Aplikace se nemůže připojit k Supabase.

### Řešení:
1. Zkontrolujte internet konektivitu
2. Zkontrolujte, že Supabase URL je správná
3. Ověřte, že Supabase projekt je aktivní
4. Zkuste ping na Supabase:
```bash
ping vszxyyvieexgbkjsbuqb.supabase.co
```

---

## Chyba: "CORS error" - Cross-Origin Request Blocked

### Příčina:
Webový prohlížeč blokuje request z bezpečnostních důvodů.

### Řešení:
Toto by se nemělo stát, protože aplikace běží na stejné doméně.
Pokud se stane, zkontrolujte:

1. V Supabase jděte do **Settings → API**
2. Ověřte "CORS" nastavení - mělo by být povoleno

---

## Chyba: "Invalid JSON"

### Příčina:
Aplikace odesílá nebo přijímá špatně formátovaný JSON.

### Řešení:
Jedná se o vývojářskou chybu. Zkontrolujte:
1. Model User a Note - mají správné typy?
2. Hashování hesla - vrací správný string?
3. Logování - co se odesílá?

```csharp
// V SupabaseService.cs:
var json = JsonSerializer.Serialize(user);
Console.WriteLine(json); // Debug - vypsat JSON
```

---

## Chyba: "Session expired"

### Příčina:
Vaše session byla uzavřena (po 30 minutách neaktivity).

### Řešení:
Jednoduše se znovu přihlaste. Je to normální chování.

Pokud chcete zvýšit timeout, upravte v Program.cs:
```csharp
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(1); // 1 hodina místo 30 minut
});
```

---

## Chyba při nasazení na Render

### Chyba: "Build failed"

### Řešení:
1. Zkontrolujte, že `Dockerfile` je v root projektu
2. Zkontrolujte, že `PoznamkyApp.csproj` existuje
3. Pushněte všechny změny na GitHub
4. Restartujte build v Render

### Chyba: "Application crashed"

### Řešení:
1. V Render jděte na **Logs** - tam byste měli vidět chybu
2. Zkontrolujte, že proměnné `Supabase__Url` a `Supabase__Key` jsou nastaveny
3. Ověřte, že Supabase URL je bez `http://` - měla by začínat `https://`

---

## Nejčastější chyby:

| Chyba | Příčina | Řešení |
|-------|---------|--------|
| "Registrace selhala" | Supabase není dostupná | Zkontrolujte Supabase konfiguraci |
| "Tabulka neexistuje" | DATABASE_SETUP.sql nebyla spuštěna | Spusťte DATABASE_SETUP.sql |
| "RLS error" | RLS politiky blokují operace | Resetujte politiky (viz výše) |
| "Unauthorized" | API klíč je nesprávný | Zkopírujte nový klíč ze Supabase |
| "Connection refused" | Supabase není dostupná | Ověřte internet a URL |

---

## Jak debugovat:

### 1. Zapněte logging
V `appsettings.json`:
```json
"Logging": {
  "LogLevel": {
    "Default": "Debug"
  }
}
```

### 2. Zkontrolujte Output window
**View → Output (Ctrl+Alt+O)** - zde vidíte všechny zprávy

### 3. Použijte Supabase dashboard
V Supabase SQL editoru spusťte dotazy a ověřte data:
```sql
SELECT * FROM users;
SELECT * FROM notes;
```

### 4. Přidejte breakpoints
V Visual Studiu klikněte na číslo řádku - objeví se červená tečka.
Pak spusťte s F5 (Debug mode).

---

**Máte stále problém? Zkontrolujte si:**
- ✅ Je Supabase URL správná a bez http://?
- ✅ Je API klíč správný a zaregistrovaný?
- ✅ Jsou tabulky vytvořeny v Supabase?
- ✅ Jsou RLS politiky nastaveny správně?
- ✅ Vidíte chyby v Output window?
