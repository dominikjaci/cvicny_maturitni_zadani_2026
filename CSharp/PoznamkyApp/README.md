# Aplikace pro správu poznámek (PoznamkyApp)

Bezpečná webová aplikace pro správu osobních textových poznámek s cloudovou databází Supabase.

## Funkcionality

✅ **Registrace a přihlášení** - Uživatelé se mohou zaregistrovat a přihlášovat s uživatelským jménem a heslem
✅ **Správa poznámek** - Vytváření, úpravy a mazání vlastních poznámek
✅ **Cloudová databáze** - Poznámky jsou uloženy v Supabase databázi
✅ **Bezpečnost** - Hesla jsou bezpečně hashovaná, každý uživatel vidí pouze své vlastní poznámky
✅ **Rušení účtu** - Uživatelé mohou smazat svůj účet a všechny své poznámky

## Požadavky

- .NET 10.0 nebo vyšší
- Supabase projekt
- Render účet (pro nasazení v produkci)

## Instalace a spuštění

### 1. Příprava Supabase databáze

1. Přejděte na [Supabase](https://supabase.io/)
2. Vytvořte nový projekt
3. V SQL editoru v Supabase spusťte obsah souboru `DATABASE_SETUP.sql`
4. Zkopírujte si vaši Supabase URL a API klíč

### 2. Konfigurace aplikace

1. Otevřete `appsettings.json`
2. Aktualizujte Supabase URL a klíč:
```json
"Supabase": {
    "Url": "https://your-project.supabase.co",
    "Key": "your-api-key"
}
```

### 3. Lokální spuštění

```bash
dotnet restore
dotnet run
```

Aplikace bude dostupná na `https://localhost:5001`

## Nasazení

### Nasazení v Renderu

1. Pushněte kód na GitHub
2. Přejděte na [Render.com](https://render.com/)
3. Vytvořte nový Web Service
4. Propojte GitHub repozitář
5. Nastavte Build command: `dotnet publish -c Release -o /app/publish`
6. Nastavte Start command: `dotnet PoznamkyApp.dll`
7. Přidejte environment variables:
   - `Supabase__Url` = vaše Supabase URL
   - `Supabase__Key` = váš Supabase API klíč

## Struktura projektu

```
PoznamkyApp/
├── Controllers/           # MVC kontrolery
│   ├── AuthController.cs  # Registrace, přihlášení, rušení účtu
│   ├── NotesController.cs # CRUD operace na poznámky
│   └── HomeController.cs  # Domovská stránka
├── Models/               # Datové modely
│   ├── User.cs
│   ├── Note.cs
│   └── ErrorViewModel.cs
├── Services/            # Business logika
│   ├── ISupabaseService.cs
│   └── SupabaseService.cs
├── Views/              # Razor views
│   ├── Auth/           # Registrace, přihlášení, smazání účtu
│   ├── Notes/          # Správa poznámek
│   ├── Home/           # Domovská stránka
│   └── Shared/         # Sdílené components
├── Program.cs          # Startup konfigurace
├── appsettings.json    # Nastavení aplikace
└── Dockerfile          # Docker konfigurace
```

## Technologie

- **Backend**: ASP.NET Core 10 (Razor Pages)
- **Databáze**: Supabase (PostgreSQL)
- **Frontend**: Bootstrap 5
- **Autentifikace**: Session-based authentication
- **Deployment**: Docker, Render

## Bezpečnostní upozornění

⚠️ Toto je školní projekt. V produkčním prostředí byste měli zvážit:
- Implementaci HTTPS/TLS
- Lepší hashování hesel (bcrypt, PBKDF2)
- CSRF ochranu
- CORS bezpečnost
- Input validaci a sanitaci

## Troubleshooting

### Chyba: "Databáze není dostupná"
- Zkontrolujte, že Supabase URL a klíč jsou správné
- Ověřte, že máte internet připojení
- Ověřte, že Supabase projekt je aktivní

### Chyba: "Tabulky neexistují"
- Spusťte SQL skript z `DATABASE_SETUP.sql` v Supabase SQL editoru

### Chyba: "Hesla se nehodují"
- Ujistěte se, že obě hesla v registraci jsou identická

## Licence

Školní projekt - 2026
