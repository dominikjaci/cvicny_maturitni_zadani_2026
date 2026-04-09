using Microsoft.AspNetCore.Mvc;
using PoznamkyApp.Models;
using PoznamkyApp.Services;

namespace PoznamkyApp.Controllers;

public class AuthController : Controller
{
    private readonly ISupabaseService _supabaseService;

    public AuthController(ISupabaseService supabaseService)
    {
        _supabaseService = supabaseService;
    }

    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Register(string username, string email, string password, string confirmPassword)
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

        var userExists = await _supabaseService.UserExistsAsync(username);
        if (userExists)
        {
            ModelState.AddModelError("", "Uživatelské jméno již existuje");
            return View();
        }

        var user = await _supabaseService.RegisterAsync(username, email, password);
        if (user == null)
        {
            ModelState.AddModelError("", "Registrace selhala");
            return View();
        }

        HttpContext.Session.SetInt32("UserId", user.Id);
        HttpContext.Session.SetString("Username", user.Username);
        
        return RedirectToAction("Index", "Notes");
    }

    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Login(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            ModelState.AddModelError("", "Uživatelské jméno a heslo jsou povinné");
            return View();
        }

        var user = await _supabaseService.LoginAsync(username, password);
        if (user == null)
        {
            ModelState.AddModelError("", "Neplatné přihlašovací údaje");
            return View();
        }

        HttpContext.Session.SetInt32("UserId", user.Id);
        HttpContext.Session.SetString("Username", user.Username);
        
        return RedirectToAction("Index", "Notes");
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
}
