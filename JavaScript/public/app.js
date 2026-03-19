const API_URL = '/api';

// State
let currentUser = null;
let onlyImportant = false;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');

// Auth Containers
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');
const showRegisterLink = document.getElementById('show-register-link');
const showLoginLink = document.getElementById('show-login-link');

const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addNoteForm = document.getElementById('add-note-form');
const notesList = document.getElementById('notes-list');
const logoutBtn = document.getElementById('logout-btn');
const showImportantBtn = document.getElementById('show-important-btn');
const showAllBtn = document.getElementById('show-all-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteModal = document.getElementById('delete-modal');
const closeModal = document.querySelector('.close');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const deleteConfirmPassword = document.getElementById('delete-confirm-password');

// --- Initialization ---
async function init() {
    console.log("App initializing...");
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (currentUser && currentUser._id) {
                console.log("Restoring session for:", currentUser.username);
                showDashboard();
            } else {
                showAuth();
            }
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            localStorage.removeItem('user');
            showAuth();
        }
    } else {
        showAuth();
    }
}

// --- UI Functions ---
function showAuth() {
    dashboardSection.style.display = 'none';
    userInfo.style.display = 'none';
    authSection.style.display = 'flex';
    // Reset to login view by default
    loginContainer.style.display = 'block';
    registerContainer.style.display = 'none';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    userInfo.style.display = 'flex';
    usernameDisplay.textContent = `Uživatel: ${currentUser.username}`;
    fetchNotes();
}

function renderNotes(notes) {
    notesList.innerHTML = '';
    
    if (!notes || notes.length === 0) {
        notesList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 2rem;">Zatím nemáte žádné poznámky.</p>';
        return;
    }

    notes.forEach(note => {
        const date = new Date(note.createdAt).toLocaleString('cs-CZ', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        const card = document.createElement('div');
        card.className = `note-card ${note.isImportant ? 'important' : ''}`;
        
        // Escape content safely
        const safeTitle = escapeHtml(note.title);
        const safeContent = escapeHtml(note.content);
        
        card.innerHTML = `
            <div class="note-header">
                <h3>${safeTitle}</h3>
                <span class="note-date">${date}</span>
            </div>
            <div class="note-content">${safeContent}</div>
            <div class="note-actions">
                <button onclick="window.toggleImportance('${note._id}', ${!note.isImportant})" title="${note.isImportant ? 'Zrušit označení důležité' : 'Označit jako důležité'}">
                    ${note.isImportant ? '★ Důležité' : '☆ Důležité'}
                </button>
                <button class="danger" onclick="window.deleteNote('${note._id}')">Smazat</button>
            </div>
        `;
        notesList.appendChild(card);
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}

// --- API Calls ---

async function fetchNotes() {
    try {
        let url = `${API_URL}/notes?userId=${currentUser._id}`;
        if (onlyImportant) {
            url += '&important=true';
        }

        const res = await fetch(url);
        if (!res.ok) {
            // Handle specific status codes if needed
            if(res.status === 404) {
                 renderNotes([]);
                 return;
            }
            if (res.status === 503) {
                 throw new Error("Databáze není dostupná.");
            }
            throw new Error(`Server responded with ${res.status}`);
        }
        const notes = await res.json();
        renderNotes(notes);
    } catch (err) {
        console.error("Fetch notes error:", err);
        notesList.innerHTML = `<p style="color: red; text-align: center;">Chyba načítání: ${err.message}</p>`;
    }
}

async function login(username, password) {
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';
    
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok) {
            currentUser = data;
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
            loginForm.reset();
        } else {
            errorEl.textContent = data.message || 'Neplatné jméno nebo heslo.';
        }
    } catch (e) {
        console.error("Login error:", e);
        errorEl.textContent = 'Nelze se připojit k serveru.';
    }
}

async function register(username, password) {
    const errorEl = document.getElementById('register-error');
    errorEl.textContent = '';

    // Validation
    if (password.length < 6) {
        errorEl.textContent = 'Heslo musí mít alespoň 6 znaků.';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Registrace úspěšná! Nyní se prosím přihlaste.');
            showLoginView();
            document.getElementById('login-username').value = username;
            document.getElementById('login-password').focus();
            registerForm.reset();
        } else {
            errorEl.textContent = data.message || 'Registrace se nezdařila.';
        }
    } catch (e) {
        console.error("Register error:", e);
        errorEl.textContent = 'Nelze se připojit k serveru.';
    }
}

async function addNote(title, content) {
    try {
        const res = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser._id,
                title,
                content
            })
        });

        if (res.ok) {
            fetchNotes(); // Refresh list
            addNoteForm.reset();
        } else {
            const data = await res.json();
            alert(data.message || 'Chyba při přidávání poznámky');
        }
    } catch (e) {
        console.error(e);
        alert('Chyba komunikace se serverem');
    }
}

async function deleteNote(noteId) {
    if (!confirm('Opravdu chcete smazat tuto poznámku?')) return;

    try {
        const res = await fetch(`${API_URL}/notes/${noteId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            fetchNotes(); // Refresh list to remove the item
        } else {
            alert('Chyba při mazání poznámky');
        }
    } catch (e) {
        console.error(e);
        alert('Chyba při mazání');
    }
}

async function toggleImportance(noteId, isImportant) {
    try {
        const res = await fetch(`${API_URL}/notes/${noteId}/importance`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isImportant })
        });

        if (res.ok) {
            fetchNotes(); // Refresh list to update order/styling
        } else {
            alert('Chyba při změně důležitosti');
        }
    } catch (e) {
        console.error(e);
        alert('Chyba při komunikaci se serverem');
    }
}

async function deleteAccount(password) {
    try {
        const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await res.json();
        if (res.ok) {
            alert('Účet byl úspěšně smazán.');
            logout();
            deleteModal.style.display = 'none';
            deleteConfirmPassword.value = '';
        } else {
            alert(data.message || 'Chyba při mazání účtu (špatné heslo?)');
        }
    } catch (e) {
        console.error(e);
        alert('Chyba při komunikaci se serverem');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    showAuth();
    // Clear forms for security
    loginForm.reset();
    registerForm.reset();
}

// --- View Switching ---
function showRegisterView(e) {
    if(e) e.preventDefault();
    loginContainer.style.display = 'none';
    registerContainer.style.display = 'block';
    // Clear errors or inputs if needed
}

function showLoginView(e) {
    if(e) e.preventDefault();
    registerContainer.style.display = 'none';
    loginContainer.style.display = 'block';
}

// --- Event Listeners ---

// Auth Switching
if(showRegisterLink) showRegisterLink.addEventListener('click', showRegisterView);
if(showLoginLink) showLoginLink.addEventListener('click', showLoginView);

// Forms
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    login(u, p);
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('register-username').value;
    const p = document.getElementById('register-password').value;
    register(u, p);
});

addNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const t = document.getElementById('note-title').value;
    const c = document.getElementById('note-content').value;
    addNote(t, c);
});

// Controls
logoutBtn.addEventListener('click', logout);

showImportantBtn.addEventListener('click', () => {
    onlyImportant = true;
    showImportantBtn.style.display = 'none';
    showAllBtn.style.display = 'inline-block';
    fetchNotes();
});

showAllBtn.addEventListener('click', () => {
    onlyImportant = false;
    showAllBtn.style.display = 'none';
    showImportantBtn.style.display = 'inline-block';
    fetchNotes();
});

// Modal Logic
deleteAccountBtn.onclick = function() {
    deleteModal.style.display = "block";
    deleteConfirmPassword.focus();
}

closeModal.onclick = function() {
    deleteModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == deleteModal) {
        deleteModal.style.display = "none";
    }
}

confirmDeleteBtn.addEventListener('click', () => {
    const password = deleteConfirmPassword.value;
    if (password) {
        deleteAccount(password);
    } else {
        alert('Zadejte heslo pro potvrzení');
    }
});

// Use global window functions for inline onclick in renderNotes (simple and effective)
window.toggleImportance = toggleImportance;
window.deleteNote = deleteNote;

// Start
document.addEventListener('DOMContentLoaded', init);