/**
 * BaytLogic Technologies - Secure Staff & Admin Authentication Module
 * Enforces strict access control: Unauthenticated users are blocked and redirected.
 */

// Automatically set Netlify site URL for local development testing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  if (!localStorage.getItem('netlifySiteURL')) {
    localStorage.setItem('netlifySiteURL', 'https://baytlogic.com.ng');
  }
}

// Master session getter
function getCurrentUser() {
  // Check Netlify Identity session first
  if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    const u = window.netlifyIdentity.currentUser();
    return {
      name: u.user_metadata?.full_name || u.email.split('@')[0],
      email: u.email,
      role: u.app_metadata?.roles?.[0] || 'Chief Admin & Lead Engineer'
    };
  }

  // Check local session
  const sess = sessionStorage.getItem('baytlogic_current_user') || localStorage.getItem('baytlogic_remember_user');
  return sess ? JSON.parse(sess) : null;
}

function setCurrentUser(user, remember = true) {
  sessionStorage.setItem('baytlogic_current_user', JSON.stringify(user));
  if (remember) {
    localStorage.setItem('baytlogic_remember_user', JSON.stringify(user));
  }
}

function logoutUser() {
  sessionStorage.removeItem('baytlogic_current_user');
  localStorage.removeItem('baytlogic_remember_user');
  if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    window.netlifyIdentity.logout();
  }
  window.location.href = "index.html";
}

// Initialize Netlify Identity listeners if available
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("login", user => {
    const formattedUser = {
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email,
      role: user.app_metadata?.roles?.[0] || 'Chief Admin'
    };
    setCurrentUser(formattedUser);
    
    // Unhide page and render user bar without endless reload loops
    document.querySelectorAll('main').forEach(m => m.style.display = '');
    renderUserBar(formattedUser);

    const modal = document.getElementById('staffAuthModal');
    if (modal) modal.remove();
  });

  window.netlifyIdentity.on("logout", () => {
    sessionStorage.removeItem('baytlogic_current_user');
    localStorage.removeItem('baytlogic_remember_user');
    window.location.href = "index.html";
  });

  window.netlifyIdentity.on("close", () => {
    // If user closes Netlify dialog without being logged in, redirect away to index.html!
    if (!getCurrentUser()) {
      window.location.href = "index.html";
    }
  });
}

// Backend Serverless Authentication call for local or custom auth
async function authenticateBackend(username, password) {
  try {
    const response = await fetch('/.netlify/functions/staff-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok && data.user) {
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch (err) {
    // Check localStorage custom staff accounts created in Admin Studio first
    const storedAccounts = JSON.parse(localStorage.getItem('baytlogic_accounts') || '[]');
    const customMatch = storedAccounts.find(a => (a.username.toLowerCase() === username.trim().toLowerCase() || (a.email && a.email.toLowerCase() === username.trim().toLowerCase())) && a.password === password);
    if (customMatch) {
      const u = { name: customMatch.name, email: customMatch.username, role: customMatch.role };
      setCurrentUser(u);
      return { success: true, user: u };
    }

    // Fallback default admin credentials
    const validUsers = [
      { user: 'baytlogic@gmail.com', pass: 'BaytLogic@Master2026!', name: 'Yahaya Abdullahi Sulaiman', role: 'Chief Admin & Lead Engineer' },
      { user: 'admin', pass: 'BaytLogic2026', name: 'Yahaya Abdullahi Sulaiman', role: 'Chief Admin & Lead Engineer' },
      { user: 'info@baytlogic.com.ng', pass: 'BaytLogic2026', name: 'Yahaya Abdullahi Sulaiman', role: 'Chief Admin & Lead Engineer' },
      { user: 'amzak', pass: 'amzak@2025', name: 'Ahmad Adamu Zakari', role: 'Field Operations Engineer' }
    ];

    const match = validUsers.find(v => (v.user.toLowerCase() === username.trim().toLowerCase()) && v.pass === password);
    if (match) {
      const u = { name: match.name, email: match.user, role: match.role };
      setCurrentUser(u);
      return { success: true, user: u };
    }
    return { success: false, error: 'Invalid username or password.' };
  }
}

// Strict Authorization Gate: Hides page content until authenticated
function requireStaffAuth(onAuthSuccess) {
  const currentUser = getCurrentUser();

  if (currentUser) {
    // User is authorized: Show page content & user bar
    document.querySelectorAll('main').forEach(m => m.style.display = '');
    if (onAuthSuccess) onAuthSuccess(currentUser);
    renderUserBar(currentUser);
    return;
  }

  // Hide main page content completely to prevent any sneak peek
  document.querySelectorAll('main').forEach(m => m.style.display = 'none');

  // If Netlify Identity Widget is available, open Netlify modal
  if (window.netlifyIdentity) {
    window.netlifyIdentity.open('login');
    return;
  }

  // Fallback Auth Modal for Local Server Testing
  let authModal = document.getElementById('staffAuthModal');
  if (!authModal) {
    authModal = document.createElement('div');
    authModal.id = 'staffAuthModal';
    authModal.className = 'fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    authModal.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
        
        <div class="text-center space-y-2">
          <img src="assets/baytlogic-icon-cyan.png" alt="BaytLogic" class="h-12 w-auto mx-auto mb-3" />
          <h2 class="text-2xl font-extrabold text-white tracking-wide">Staff Authorization Portal</h2>
          <p class="text-xs text-slate-400">Chief Admin & Staff Access Only</p>
        </div>

        <div id="loginAlert" class="hidden p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold text-center"></div>

        <form onsubmit="handleAuthSubmit(event)" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1">Username or Email</label>
            <input type="text" id="authUsername" placeholder="e.g. baytlogic@gmail.com or admin" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <button type="submit" id="authSubmitBtn" class="w-full py-3.5 bg-brand-primary hover:bg-cyan-600 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2">
            <i data-lucide="lock" class="w-4 h-4"></i> Authorize & Access Studio
          </button>
        </form>

        <div class="text-center">
          <a href="index.html" class="text-xs text-slate-500 hover:text-slate-300 transition">&larr; Return to Public Website</a>
        </div>

      </div>
    `;
    document.body.appendChild(authModal);
    if (window.lucide) lucide.createIcons();
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;
  const alertBox = document.getElementById('loginAlert');
  const btn = document.getElementById('authSubmitBtn');

  btn.disabled = true;
  btn.innerText = 'Authenticating...';

  const res = await authenticateBackend(username, password);
  if (res.success) {
    const authModal = document.getElementById('staffAuthModal');
    if (authModal) authModal.remove();

    // Unhide main page content and render user bar cleanly
    document.querySelectorAll('main').forEach(m => m.style.display = '');
    renderUserBar(res.user);

    if (window.onAuthSuccessCallback) {
      window.onAuthSuccessCallback(res.user);
    }
  } else {
    alertBox.innerText = res.error;
    alertBox.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Authorize & Access Studio';
    if (window.lucide) lucide.createIcons();
  }
}

function renderUserBar(user) {
  const headers = document.querySelectorAll('header');
  headers.forEach(header => {
    let userBar = header.querySelector('.staff-user-bar');
    if (!userBar) {
      const container = header.querySelector('.max-w-7xl');
      if (container) {
        userBar = document.createElement('div');
        userBar.className = 'staff-user-bar flex items-center gap-3 text-xs bg-slate-800/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80';
        userBar.innerHTML = `
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-slate-300 font-medium">Logged in: <strong class="text-white">${user.name}</strong> (${user.role})</span>
          <button onclick="logoutUser()" class="ml-2 px-2 py-0.5 bg-red-900/40 hover:bg-red-800 text-red-300 rounded text-[11px] font-semibold transition">Logout</button>
        `;
        container.appendChild(userBar);
      }
    }
  });
}
