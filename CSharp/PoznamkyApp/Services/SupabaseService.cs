using System.Text;
using System.Text.Json;
using PoznamkyApp.Models;

namespace PoznamkyApp.Services;

public class SupabaseService : ISupabaseService
{
    private readonly string _url;
    private readonly string _key;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SupabaseService> _logger;

    public SupabaseService(string url, string key, IHttpClientFactory httpClientFactory, ILogger<SupabaseService> logger)
    {
        _url = url.TrimEnd('/');
        _key = key;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    private HttpClient GetClient()
    {
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("apikey", _key);
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_key}");
        client.DefaultRequestHeaders.Add("Content-Type", "application/json");
        client.DefaultRequestHeaders.Add("Prefer", "return=representation");
        return client;
    }

    public async Task<User?> RegisterAsync(string username, string email, string password)
    {
        try
        {
            var client = GetClient();
            var passwordHash = HashPassword(password);

            var user = new
            {
                username,
                email,
                password_hash = passwordHash
            };

            var json = JsonSerializer.Serialize(user);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation($"Registering user: {username}");
            var response = await client.PostAsync($"{_url}/rest/v1/users", content);

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Registration successful for {username}");
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var users = JsonSerializer.Deserialize<List<User>>(responseBody, options);
                return users?.FirstOrDefault();
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Registration failed for {username}: {response.StatusCode} - {errorBody}");
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration error: {ex.Message}");
            return null;
        }
    }

    public async Task<User?> LoginAsync(string username, string password)
    {
        try
        {
            var client = GetClient();
            var passwordHash = HashPassword(password);

            _logger.LogInformation($"Login attempt for user: {username}");
            var response = await client.GetAsync(
                $"{_url}/rest/v1/users?username=eq.{Uri.EscapeDataString(username)}&password_hash=eq.{Uri.EscapeDataString(passwordHash)}");

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var users = JsonSerializer.Deserialize<List<User>>(responseBody, options);

                if (users != null && users.Count > 0)
                {
                    _logger.LogInformation($"Login successful for {username}");
                    return users.FirstOrDefault();
                }
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Login failed for {username}: {response.StatusCode}");
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteUserAsync(int userId, string password)
    {
        try
        {
            var client = GetClient();

            // First verify password
            var response = await client.GetAsync(
                $"{_url}/rest/v1/users?id=eq.{userId}");

            if (!response.IsSuccessStatusCode)
                return false;

            var responseBody = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var users = JsonSerializer.Deserialize<List<User>>(responseBody, options);

            if (users == null || users.Count == 0)
                return false;

            var user = users[0];
            var passwordHash = HashPassword(password);

            if (user.PasswordHash != passwordHash)
                return false;

            // Delete user
            var deleteResponse = await client.DeleteAsync($"{_url}/rest/v1/users?id=eq.{userId}");
            _logger.LogInformation($"User {userId} deleted: {deleteResponse.IsSuccessStatusCode}");
            return deleteResponse.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete user error: {ex.Message}");
            return false;
        }
    }

    public async Task<List<Note>> GetUserNotesAsync(int userId)
    {
        try
        {
            var client = GetClient();
            var response = await client.GetAsync($"{_url}/rest/v1/notes?user_id=eq.{userId}&order=created_at.desc");

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<List<Note>>(responseBody, options) ?? new List<Note>();
            }

            return new List<Note>();
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get notes error: {ex.Message}");
            return new List<Note>();
        }
    }

    public async Task<Note?> CreateNoteAsync(int userId, string title, string content)
    {
        try
        {
            var client = GetClient();
            var now = DateTime.UtcNow;

            var note = new
            {
                user_id = userId,
                title,
                content,
                created_at = now,
                updated_at = now
            };

            var json = JsonSerializer.Serialize(note);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            _logger.LogInformation($"Creating note for user {userId}");
            var response = await client.PostAsync($"{_url}/rest/v1/notes", httpContent);

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var notes = JsonSerializer.Deserialize<List<Note>>(responseBody, options);
                return notes?.FirstOrDefault();
            }
            else
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Create note failed: {response.StatusCode} - {errorBody}");
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Create note error: {ex.Message}");
            return null;
        }
    }

    public async Task<Note?> UpdateNoteAsync(int noteId, string title, string content)
    {
        try
        {
            var client = GetClient();
            var now = DateTime.UtcNow;

            var note = new
            {
                title,
                content,
                updated_at = now
            };

            var json = JsonSerializer.Serialize(note);
            var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PatchAsync($"{_url}/rest/v1/notes?id=eq.{noteId}", httpContent);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Note {noteId} updated");
                return new Note { Id = noteId, Title = title, Content = content, UpdatedAt = now };
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Update note error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteNoteAsync(int noteId)
    {
        try
        {
            var client = GetClient();
            var response = await client.DeleteAsync($"{_url}/rest/v1/notes?id=eq.{noteId}");
            _logger.LogInformation($"Note {noteId} deleted: {response.IsSuccessStatusCode}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Delete note error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UserExistsAsync(string username)
    {
        try
        {
            var client = GetClient();
            var response = await client.GetAsync($"{_url}/rest/v1/users?username=eq.{Uri.EscapeDataString(username)}");

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var users = JsonSerializer.Deserialize<List<User>>(responseBody, options);
                return users != null && users.Count > 0;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError($"User exists check error: {ex.Message}");
            return false;
        }
    }

    private static string HashPassword(string password)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }
}
