using PoznamkyApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Supabase configuration
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "https://vszxyyvieexgbkjsbuqb.supabase.co";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? "sb_publishable_0ouThm0oBtn0P1jkwiBzjw_Nd8YdxjV";

// Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddHttpClient();
builder.Services.AddScoped<ISupabaseService>(sp => new SupabaseService(supabaseUrl, supabaseKey, sp.GetRequiredService<IHttpClientFactory>(), sp.GetRequiredService<ILogger<SupabaseService>>()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // Disable HTTPS redirect on Render - it's handled by reverse proxy
    // app.UseHsts();
}
else
{
    app.UseHsts();
}

// Don't use UseHttpsRedirection on Render - it causes port binding issues
// The reverse proxy handles SSL/TLS
if (!app.Environment.IsProduction() || Environment.GetEnvironmentVariable("ASPNETCORE_URLS") == null)
{
    app.UseHttpsRedirection();
}

app.UseStaticFiles();
app.UseSession();
app.UseRouting();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
