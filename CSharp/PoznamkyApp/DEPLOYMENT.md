# Deployment Guide - PoznamkyApp

Tato příručka vás provede nasazením aplikace na Supabase a Render.com.

## 1. Příprava Supabase

### 1.1 Vytvoření Supabase projektu

1. Jděte na https://supabase.com
2. Přihlaste se nebo vytvořte účet
3. Klikněte na "New project"
4. Vyplňte:
   - **Project name**: PoznamkyApp (nebo libovolné jméno)
   - **Database password**: silné heslo
   - **Region**: vyberte nejbližší k vám
5. Počkejte na vytvoření projektu (cca 2-3 minuty)

### 1.2 Vytvoření tabulek v Supabase

1. V Supabase dashboardu jděte na "SQL Editor"
2. Klikněte na "New query"
3. Zkopírujte celý obsah souboru `DATABASE_SETUP.sql`
4. Vložte do SQL editoru a klikněte "Run"
5. Měly byste vidět zprávu o úspěchu

### 1.3 Získání API klíčů

1. V Supabase jděte na "Project Settings" (ikona ozubového kola)
2. Vyberte "API"
3. Zkopírujte:
   - **Project URL**: (např. https://vszxyyvieexgbkjsbuqb.supabase.co)
   - **Anon key** nebo **Service Role key** (Anon key je bezpečnější pro veřejné aplikace)

## 2. Lokální testování

### 2.1 Aktualizace konfigurace

1. Otevřete `appsettings.json`
2. Aktualizujte Supabase údaje:
```json
"Supabase": {
    "Url": "https://YOUR_PROJECT_ID.supabase.co",
    "Key": "YOUR_API_KEY"
}
```

### 2.2 Spuštění aplikace

```bash
# Obnovit balíčky
dotnet restore

# Spustit aplikaci
dotnet run
```

Aplikace bude dostupná na: `https://localhost:5001` nebo `http://localhost:5000`

### 2.3 Testování aplikace

1. Registrujte nový účet
2. Přihlaste se
3. Vytvořte poznámku
4. Upravte poznámku
5. Smažte poznámku
6. Vyzkoušejte smazání účtu

## 3. Nasazení na Render.com

### 3.1 Příprava GitHub repozitáře

1. Inicializujte Git (pokud není inicializován):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Vytvořte GitHub repozitář a pushněte kód:
```bash
git remote add origin https://github.com/VASE_JMENO/cvicny_maturitni_zadani_2026
git push -u origin main
```

### 3.2 Vytvoření Render Web Service

1. Jděte na https://render.com
2. Přihlaste se (můžete se přihlásit skrz GitHub)
3. Klikněte na "New +" a vyberte "Web Service"
4. Vyberte GitHub repozitář
5. Vyplňte:
   - **Name**: poznamkyapp (bez mezer, pouze malá písmena)
   - **Environment**: Docker
   - **Region**: vyberte nejbližší
   - **Branch**: main

### 3.3 Nastavení proměnných

1. V Render web service jděte na "Environment"
2. Přidejte tyto proměnné:
   - **Name**: Supabase__Url
     **Value**: vaše Supabase URL
   - **Name**: Supabase__Key
     **Value**: váš Supabase API klíč

3. Klikněte "Save"

### 3.4 Deployment

1. Klikněte "Deploy"
2. Čekejte na build a nasazení (cca 3-5 minut)
3. Když vidíte "Live", aplikace je nasazena!
4. Otevřete veřejnou URL z Render dashboardu

### 3.5 Ověření nasazení

1. Přejděte na veřejnou URL aplikace
2. Otestujte stejné kroky jako v lokálním testování
3. Ověřte, že poznámky se ukládají do databáze

## 4. Kontinuální deployment

Jakmile jste nastavili Render, automaticky se bude nasazovat při každém pushu na main branch:

```bash
git add .
git commit -m "Update aplikace"
git push origin main
```

Render automaticky:
- Detekuje změny
- Provede build Docker image
- Nasadí novou verzi

## 5. Troubleshooting

### Chyba: "Connection refused"
- Ověřte, že Supabase URL je správná
- Ověřte, že máte internet konektivitu
- Zkontrolujte, že Supabase projekt je aktivní

### Chyba: "Relation does not exist"
- Spusťte `DATABASE_SETUP.sql` v Supabase SQL editoru
- Ověřte, že byl skript úspěšně proveden

### Chyba: "Invalid API key"
- Zkontrolujte, že jste zkopírovali správný klíč z Supabase
- Ujistěte se, že v `appsettings.json` nebo proměnných prostředí jsou správné hodnoty

### Aplikace je pomalá
- Render free tier může mít pomalejší performance
- Zvažte upgrade na placený plán

### Chyba při registraci: "Username already exists"
- To je normální - zkuste jiné uživatelské jméno

## 6. Správa databáze

### Backup dat
1. V Supabase jděte na "Settings" → "Backups"
2. Můžete stáhnout manuální backup

### Resetování databáze
1. Jděte na SQL Editor
2. Spusťte:
```sql
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
3. Spusťte znovu obsah z `DATABASE_SETUP.sql`

## 7. Bezpečnostní doporučení

- ⚠️ Nikdy neshare veřejně vaši `appsettings.json` s API klíči
- ✅ Vždy použijte `appsettings.json` v `.gitignore`
- ✅ V produkci použijte environment variables
- ✅ Zvažte implementaci CSRF tokenů pro produkci
- ✅ Zvažte lepší hashování hesel (bcrypt)

## Hotovo! 🎉

Vaše aplikace je nyní nasazena v cloudu a je přístupná veřejnosti!
