# Databáze poznámek (Note Database)

Tato aplikace byla vyvinuta podle cvičného maturitního zadání.

## Požadavky

- Node.js
- MongoDB (lokálně běžící na portu 27017 nebo MongoDB Atlas)

## Instalace

1. Otevřete terminál ve složce projektu (`JavaScript`).
2. Nainstalujte závislosti:
   ```bash
   npm install
   ```

## Spuštění (Lokálně)

1. Ujistěte se, že vám běží MongoDB:
   - Pokud máte Docker: `docker run -d -p 27017:27017 mongo`
   - Nebo spusťte službu MongoDB ve vašem OS.

2. Spusťte server:
   ```bash
   npm start
   ```
   nebo
   ```bash
   node server.js
   ```

3. Aplikace poběží na `http://localhost:3000`.

## Funkce

- **Registrace/Přihlášení**: Uživatelé se mohou registrovat a přihlásit.
- **Vytváření poznámek**: Přihlášený uživatel může přidávat poznámky.
- **Seznam poznámek**: Poznámky se řadí od nejnovějších.
- **Důležité poznámky**: Poznámky lze označit jako důležité a filtrovat.
- **Mazání**: Lze mazat jednotlivé poznámky.
- **Zrušení účtu**: Uživatel může po zadání hesla smazat svůj účet (včetně všech poznámek).

## Struktura projektu

- `server.js`: Hlavní soubor serveru (Express), API endpointy.
- `models/`: Mongoose modely (User, Note).
- `public/`: Statické soubory frontendu (HTML, CSS, JS).
- `.env`: Konfigurace prostředí (DB URI, PORT).

## Deployment

Aplikace je připravena pro nasazení na Render (Backend) a MongoDB Atlas (Databáze). Stačí nastavit proměnnou prostředí `MONGODB_URI` v cloudu na connection string z Atlasu.
