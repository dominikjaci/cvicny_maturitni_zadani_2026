using PoznamkyApp.Models;

namespace PoznamkyApp.Services;

public interface ISupabaseService
{
    Task<User?> RegisterAsync(string username, string email, string password);
    Task<User?> LoginAsync(string username, string password);
    Task<bool> DeleteUserAsync(int userId, string password);
    Task<List<Note>> GetUserNotesAsync(int userId);
    Task<Note?> CreateNoteAsync(int userId, string title, string content);
    Task<Note?> UpdateNoteAsync(int noteId, string title, string content);
    Task<bool> DeleteNoteAsync(int noteId);
    Task<bool> UserExistsAsync(string username);
}
