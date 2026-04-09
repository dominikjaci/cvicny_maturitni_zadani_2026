using PoznamkyApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Supabase configuration
var supabaseUrl = builder.Configuration["Supabase:Url"] ?? "https://vszxyyvieexgbkjsbuqb.supabase.co";
var supabaseKey = builder.Configuration["Supabase:Key"] ?? "sb_publishable_0ouThm0oBtn0P1jkwiBzjw_Nd8YdxjV";

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddHttpClient();
builder.Services.AddScoped<ISupabaseService>(sp => new SupabaseService(supabaseUrl, supabaseKey, sp.GetRequiredService<IHttpClientFactory>()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseSession();
app.UseRouting();
app.UseAuthorization();

app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
