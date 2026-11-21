/**
 * BaytLogic Technologies - Secure Staff & Admin Authentication Module
 * Uses Netlify Serverless + Netlify Blobs cloud persistence so staff accounts
 * work across ALL devices and NEVER disappear.
 */

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  if (!localStorage.getItem('netlifySiteURL')) {
    localStorage.setItem('netlifySiteURL', 'https://baytlogic.com.ng');
  }
}

function isChiefAdmin(user) {
  if (!user) return false;
  if (user.isChief === true) return true;
  if (user.role && user.role.toLowerCase().includes('chief admin')) return true;
  const em = (user.email || user.username || '').toLowerCase();
  if (em === 'baytlogic@gmail.com' || em === 'aburuqayyah001@gmail.com') return true;
  return false;
}

function getCurrentUser() {
  const sess = sessionStorage.getItem('baytlogic_current_user') || localStorage.getItem('baytlogic_remember_user');
  return sess ? JSON.parse(sess) : null;
}

function getAuthToken() {
  return sessionStorage.getItem('baytlogic_auth_token') || localStorage.getItem('baytlogic_auth_token') || '';
}

function setCurrentUser(user, token = '', remember = true) {
  sessionStorage.setItem('baytlogic_current_user', JSON.stringify(user));
  if (token) sessionStorage.setItem('baytlogic_auth_token', token);
  if (remember) {
    localStorage.setItem('baytlogic_remember_user', JSON.stringify(user));
    if (token) localStorage.setItem('baytlogic_auth_token', token);
  }
}

function logoutUser() {
  sessionStorage.removeItem('baytlogic_current_user');
  sessionStorage.removeItem('baytlogic_auth_token');
  localStorage.removeItem('baytlogic_remember_user');
  localStorage.removeItem('baytlogic_auth_token');
  window.location.href = 'index.html';
}

// Toggle password visibility helper (works for login & modals)
function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (btnEl) {
    btnEl.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    btnEl.innerHTML = isPassword
      ? '<i data-lucide="eye-off" class="w-4 h-4"></i>'
      : '<i data-lucide="eye" class="w-4 h-4"></i>';
    if (window.lucide) lucide.createIcons();
  }
}
window.togglePasswordVisibility = togglePasswordVisibility;

// Backend Serverless Authentication call (Cloud-First with Local Dev Fallback)
async function authenticateBackend(username, password) {
  const cleanUser = (username || '').trim().toLowerCase();

  try {
    const response = await fetch('/.netlify/functions/staff-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: cleanUser, password })
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data.user) {
      setCurrentUser(data.user, data.token || '');
      return { success: true, user: data.user, token: data.token };
    }

    // If server responded with 401/400, still check legacy localStorage only as offline fallback
    if (response.status === 401 || response.status === 400) {
      const storedAccounts = JSON.parse(localStorage.getItem('baytlogic_accounts') || '[]');
      const customMatch = storedAccounts.find(a =>
        ((a.username || '').toLowerCase() === cleanUser || (a.email && a.email.toLowerCase() === cleanUser)) &&
        a.password && a.password !== '••••••••' && a.password === password
      );
      if (customMatch) {
        const u = { name: customMatch.name, email: customMatch.username, username: customMatch.username, role: customMatch.role };
        setCurrentUser(u, '');
        return { success: true, user: u };
      }
      return { success: false, error: data.error || 'Invalid username or password.' };
    }
  } catch (err) {
    // Offline / local static server fallback
    const storedAccounts = JSON.parse(localStorage.getItem('baytlogic_accounts') || '[]');
    const customMatch = storedAccounts.find(a =>
      ((a.username || '').toLowerCase() === cleanUser || (a.email && a.email.toLowerCase() === cleanUser)) &&
      a.password && a.password !== '••••••••' && a.password === password
    );
    if (customMatch) {
      const u = { name: customMatch.name, email: customMatch.username, username: customMatch.username, role: customMatch.role };
      setCurrentUser(u, '');
      return { success: true, user: u };
    }
  }

  return { success: false, error: 'Invalid username or password.' };
}

// Strict Authorization Gate: Hides page content until authenticated
function requireStaffAuth(onAuthSuccess) {
  if (typeof onAuthSuccess === 'function') {
    window.onAuthSuccessCallback = onAuthSuccess;
  }

  const currentUser = getCurrentUser();

  if (currentUser) {
    document.querySelectorAll('main').forEach(m => m.style.display = '');
    if (onAuthSuccess) onAuthSuccess(currentUser);
    renderUserBar(currentUser);
    return;
  }

  document.querySelectorAll('main').forEach(m => m.style.display = 'none');

  let authModal = document.getElementById('staffAuthModal');
  if (!authModal) {
    authModal = document.createElement('div');
    authModal.id = 'staffAuthModal';
    authModal.className = 'fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex items-center justify-center p-4';
    authModal.innerHTML = `
      <div class="bg-slate-900 border border-cyan-500/20 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-500 to-amber-400"></div>

        <div class="text-center space-y-2 pt-1">
          <img src="assets/baytlogic-icon-cyan.png" alt="BaytLogic" class="h-12 w-auto mx-auto mb-3" />
          <h2 class="text-2xl font-extrabold text-white tracking-wide">Staff Authorization Portal</h2>
          <p class="text-xs text-slate-400">Chief Admin &amp; Authorized Staff Access Only</p>
        </div>
        <div id="loginAlert" class="hidden p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold text-center"></div>

        <form onsubmit="handleAuthSubmit(event)" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1.5">Username or Email</label>
            <input type="text" id="authUsername" autocomplete="username" placeholder="e.g. staff@baytlogic.com.ng" required
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 transition font-medium" />
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1.5">Password</label>
            <div class="relative">
              <input type="password" id="authPassword" autocomplete="current-password" placeholder="Enter your password" required
                class="w-full pl-4 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 transition font-medium" />
              <button type="button" onclick="togglePasswordVisibility('authPassword', this)"
                aria-label="Show password" title="Show / Hide Password"
                class="absolute inset-y-0 right-0 px-3.5 flex items-center text-slate-400 hover:text-cyan-400 transition focus:outline-none">
                <i data-lucide="eye" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <button type="submit" id="authSubmitBtn"
            class="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
            <i data-lucide="lock" class="w-4 h-4"></i> Authorize &amp; Access Studio
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

  alertBox.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = 'Authenticating...';

  const res = await authenticateBackend(username, password);
  if (res.success) {
    const authModal = document.getElementById('staffAuthModal');
    if (authModal) authModal.remove();

    document.querySelectorAll('main').forEach(m => m.style.display = '');
    renderUserBar(res.user);

    if (typeof window.onAuthSuccessCallback === 'function') {
      window.onAuthSuccessCallback(res.user);
    }
  } else {
    alertBox.innerText = res.error;
    alertBox.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Authorize &amp; Access Studio';
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
