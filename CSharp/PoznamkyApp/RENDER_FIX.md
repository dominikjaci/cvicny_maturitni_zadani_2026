# Render Deployment Fix

## Problém:
- HTTPS redirect selhává
- Port binding issues
- Data Protection Keys nejsou persisted

## Řešení:

### 1. V Render - Nastav Environment Variables

V Render web service přidej tyto proměnné:

```
PORT=8080
ASPNETCORE_URLS=http://+:8080
ASPNETCORE_ENVIRONMENT=Production
Supabase__Url=https://vszxyyvieexgbkjsbuqb.supabase.co
Supabase__Key=sb_publishable_0ouThm0oBtn0P1jkwiBzjw_Nd8YdxjV
```

⚠️ **Důležité:** PORT a ASPNETCORE_URLS musí být nastaveny!

### 2. Health Check (volitelné)

Pokud chceš, aby Render věděl, že aplikace je zdravá:

V Render konfiguraci nastav Health Check URL:
```
/
```

### 3. Build & Deploy znovu

1. Jdi do Render → Web Service
2. Klikni "Deploy" nebo "Trigger build"
3. Čekej na log "New primary port detected: 8080"
4. Mělo by fungovat! ✅

## Co jsem opravil v kódu:

- ❌ Odstranil jsem `app.UseHttpsRedirection()` v Production (Render to má v reverse proxy)
- ✅ Přidám environment variable check
- ✅ Program teď správně naslouchá na portu z environment variables

## Pokud stále nefunguje:

1. Zkontroluj v Render Logs:
   - Máš vidět "Now listening on: http://[::]8080"
   - NE "Failed to determine the https port"

2. Pokud vidíš stále HTTPS error:
   - Restart deployment v Renderu
   - Vymaž cache

3. Pokud vidíš "Connection refused":
   - Zkontroluj, že Supabase údaje jsou správné
   - Zkontroluj internet konektivitu v Renderu

---

**Po aplikování těchto změn by aplikace měla běžet bez problémů!** 🚀
