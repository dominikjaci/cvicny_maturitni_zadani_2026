# Zvolena verze .NET 8 (pokud používáš .NET 9, přepiš 8.0 na 9.0)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=build /app/publish .

# Spuštění zkompilované aplikace
ENTRYPOINT ["dotnet", "PoznamkyApp.dll"]