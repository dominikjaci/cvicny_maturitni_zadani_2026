using Microsoft.AspNetCore.Mvc;
using PoznamkyApp.Models;
using PoznamkyApp.Services;

namespace PoznamkyApp.Controllers;

public class AuthController : Controller
{
    private readonly ISupabaseService _supabaseService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ISupabaseService supabaseService, ILogger<AuthController> logger)
    {
        _supabaseService = supabaseService;
        _logger = logger;
    }

    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Register(string username, string email, string password, string confirmPassword)
    {
        try
        {
            if (password != confirmPassword)
            {
                ModelState.AddModelError("", "Hesla se nehodují");
                return View();
            }

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                ModelState.AddModelError("", "Uživatelské jméno a heslo jsou povinné");
                return View();
            }

            _logger.LogInformation($"Checking if user {username} exists");
            var userExists = await _supabaseService.UserExistsAsync(username);
            if (userExists)
            {
                ModelState.AddModelError("", "Uživatelské jméno již existuje");
                return View();
            }

            _logger.LogInformation($"Registering user {username}");
            var user = await _supabaseService.RegisterAsync(username, email, password);
            if (user == null)
            {
                _logger.LogError($"Registration returned null for user {username}");
                ModelState.AddModelError("", "Registrace selhala - Supabase je nedostupná. Zkontrolujte, zda jsou tabulky vytvořeny v Supabase!");
                return View();
            }

            _logger.LogInformation($"User {username} registered successfully with ID {user.Id}");
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);

            return RedirectToAction("Index", "Notes");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration error: {ex.Message}");
            ModelState.AddModelError("", $"Chyba: {ex.Message}");
            return View();
        }
    }

    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(string username, string password)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                ModelState.AddModelError("", "Uživatelské jméno a heslo jsou povinné");
                return View();
            }

            _logger.LogInformation($"Login attempt for user {username}");
            var user = await _supabaseService.LoginAsync(username, password);
            if (user == null)
            {
                _logger.LogWarning($"Login failed for user {username}");
                ModelState.AddModelError("", "Neplatné přihlašovací údaje nebo Supabase není dostupná");
                return View();
            }

            _logger.LogInformation($"User {username} logged in successfully");
            HttpContext.Session.SetInt32("UserId", user.Id);
            HttpContext.Session.SetString("Username", user.Username);

            return RedirectToAction("Index", "Notes");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            ModelState.AddModelError("", $"Chyba: {ex.Message}");
            return View();
        }
    }

    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return RedirectToAction("Index", "Home");
    }

    public IActionResult DeleteAccount()
    {
        var userId = HttpContext.Session.GetInt32("UserId");
        if (userId == null)
        {
            return RedirectToAction("Login");
        }
        
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> DeleteAccount(string password)
    {
        try
        {
            var userId = HttpContext.Session.GetInt32("UserId");
            if (userId == null)
            {
                return RedirectToAction("Login");
            }

            var success = await _supabaseService.DeleteUserAsync(userId.Value, password);

            if (!success)
            {
                ModelState.AddModelError("", "Heslo je nesprávné");
                return View();
            }

            HttpContext.Session.Clear();
            return RedirectToAction("Index", "Home");
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete account error: {ex.Message}");
            ModelState.AddModelError("", $"Chyba: {ex.Message}");
            return View();
        }
    }
}
