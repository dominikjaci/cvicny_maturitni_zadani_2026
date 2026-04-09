using Microsoft.AspNetCore.Mvc;
using PoznamkyApp.Services;

namespace PoznamkyApp.Controllers;

public class NotesController : Controller
{
    private readonly ISupabaseService _supabaseService;

    public NotesController(ISupabaseService supabaseService)
    {
        _supabaseService = supabaseService;
    }

    private int? GetUserId()
    {
        return HttpContext.Session.GetInt32("UserId");
    }

    public async Task<IActionResult> Index()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        var notes = await _supabaseService.GetUserNotesAsync(userId.Value);
        return View(notes);
    }

    public IActionResult Create()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Create(string title, string content)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
        {
            ModelState.AddModelError("", "Název a obsah jsou povinné");
            return View();
        }

        await _supabaseService.CreateNoteAsync(userId.Value, title, content);
        return RedirectToAction("Index");
    }

    public async Task<IActionResult> Edit(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        var notes = await _supabaseService.GetUserNotesAsync(userId.Value);
        var note = notes.FirstOrDefault(n => n.Id == id);
        
        if (note == null)
        {
            return NotFound();
        }

        return View(note);
    }

    [HttpPost]
    public async Task<IActionResult> Edit(int id, string title, string content)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(content))
        {
            ModelState.AddModelError("", "Název a obsah jsou povinné");
            return View();
        }

        await _supabaseService.UpdateNoteAsync(id, title, content);
        return RedirectToAction("Index");
    }

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return RedirectToAction("Login", "Auth");
        }

        await _supabaseService.DeleteNoteAsync(id);
        return RedirectToAction("Index");
    }
}
