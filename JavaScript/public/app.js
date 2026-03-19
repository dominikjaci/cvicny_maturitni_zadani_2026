const API_URL = '/api';

// State
let currentUser = null;
let onlyImportant = false;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
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
function init() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showAuth();
    }
}

// --- UI Functions ---
function showAuth() {
    dashboardSection.style.display = 'none';
    userInfo.style.display = 'none';
    authSection.style.display = 'block';
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    userInfo.style.display = 'flex';
    usernameDisplay.textContent = `Přihlášen: ${currentUser.username}`;
    fetchNotes();
}

function renderNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const date = new Date(note.createdAt).toLocaleString('cs-CZ');
        const card = document.createElement('div');
        card.className = `note-card ${note.isImportant ? 'important' : ''}`;
        
        card.innerHTML = `
            <div class="note-header">
                <h3>${escapeHtml(note.title)}</h3>
                <span class="note-date">${date}</span>
            </div>
            <p>${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button onclick="toggleImportance('${note._id}', ${!note.isImportant})">
                    ${note.isImportant ? 'Zrušit důležité' : 'Označit jako důležité'}
                </button>
                <button class="danger" onclick="deleteNote('${note._id}')">Smazat</button>
            </div>
        `;
        notesList.appendChild(card);
    });
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// --- API Calls ---

async function fetchNotes() {
    try {
        let url = `${API_URL}/notes?userId=${currentUser._id}`;
        if (onlyImportant) {
            url += '&important=true';
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch notes');
        const notes = await res.json();
        renderNotes(notes);
    } catch (err) {
        console.error(err);
        alert('Chyba při načítání poznámek');
    }
}

async function login(username, password) {
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
    } else {
        alert(data.message);
    }
}

async function register(username, password) {
    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
        alert('Registrace úspěšná, nyní se můžete přihlásit.');
        loginForm.reset();
        registerForm.reset();
    } else {
        alert(data.message);
    }
}

async function addNote(title, content) {
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
        fetchNotes();
        addNoteForm.reset();
    } else {
        alert('Chyba při přidávání poznámky');
    }
}

async function deleteNote(noteId) {
    if (!confirm('Opravdu chcete smazat tuto poznámku?')) return;

    const res = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE'
    });

    if (res.ok) {
        fetchNotes();
    } else {
        alert('Chyba při mazání poznámky');
    }
}

async function toggleImportance(noteId, isImportant) {
    const res = await fetch(`${API_URL}/notes/${noteId}/importance`, {
        method: 'PUT', // Using PUT as defined in server.js
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isImportant })
    });

    if (res.ok) {
        fetchNotes();
    } else {
        alert('Chyba při změně důležitosti');
    }
}

async function deleteAccount(password) {
    const res = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (res.ok) {
        alert('Účet byl smazán.');
        logout();
        deleteModal.style.display = 'none';
        deleteConfirmPassword.value = '';
    } else {
        alert(data.message);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    showAuth();
}

// --- Event Listeners ---

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

// Start
init();