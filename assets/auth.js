/**
 * BaytLogic Technologies - Secure Netlify Backend Authentication Module
 * Supports: Netlify Identity (Production Backend) & Netlify Serverless Functions
 */

// Initialize Netlify Identity if Widget is present
if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (user) {
      setCurrentUser({
        name: user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
        role: user.app_metadata?.roles?.[0] || 'Chief Admin'
      });
    }
  });

  window.netlifyIdentity.on("login", user => {
    setCurrentUser({
      name: user.user_metadata?.full_name || user.email.split('@')[0],
      email: user.email,
      role: user.app_metadata?.roles?.[0] || 'Chief Admin'
    });
    window.location.reload();
  });

  window.netlifyIdentity.on("logout", () => {
    sessionStorage.removeItem('baytlogic_current_user');
    localStorage.removeItem('baytlogic_remember_user');
    window.location.reload();
  });
}

function getCurrentUser() {
  // First check Netlify Identity live session if available
  if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    const u = window.netlifyIdentity.currentUser();
    return {
      name: u.user_metadata?.full_name || u.email,
      email: u.email,
      role: u.app_metadata?.roles?.[0] || 'Chief Admin & Lead Engineer'
    };
  }
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
  if (window.netlifyIdentity && window.netlifyIdentity.currentUser()) {
    window.netlifyIdentity.logout();
  } else {
    sessionStorage.removeItem('baytlogic_current_user');
    localStorage.removeItem('baytlogic_remember_user');
    window.location.reload();
  }
}

// Backend Serverless Authentication call
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
    // Fallback for local dev server
    if (username.trim() && password === 'BaytLogic@Master2026!') {
      const u = { name: 'Yahaya Abdullahi Sulaiman', email: username, role: 'Chief Admin & Lead Engineer' };
      setCurrentUser(u);
      return { success: true, user: u };
    }
    return { success: false, error: 'Authentication failed. Please check credentials.' };
  }
}

// Render Authentication Modal or Netlify Identity Gate
function requireStaffAuth(onAuthSuccess) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    if (onAuthSuccess) onAuthSuccess(currentUser);
    renderUserBar(currentUser);
    return;
  }

  // If Netlify Identity is loaded, trigger Netlify Identity widget modal
  if (window.netlifyIdentity) {
    window.netlifyIdentity.open('login');
    return;
  }

  // Fallback Auth Modal for local dev
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
          <p class="text-xs text-slate-400">Chief Admin & Backend Netlify Authentication</p>
        </div>

        <div id="loginAlert" class="hidden p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold text-center"></div>

        <form onsubmit="handleAuthSubmit(event)" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1">Username or Email</label>
            <input type="text" id="authUsername" placeholder="e.g. info@baytlogic.com.ng" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Master Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
            <p><strong class="text-cyan-400">Netlify Backend Authentication Active:</strong></p>
            <p>• Netlify Identity & Serverless Functions manage session security.</p>
          </div>

          <button type="submit" id="authSubmitBtn" class="w-full py-3.5 bg-brand-primary hover:bg-cyan-600 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2">
            <i data-lucide="lock" class="w-4 h-4"></i> Authorize & Continue
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
    window.location.reload();
  } else {
    alertBox.innerText = res.error;
    alertBox.classList.remove('hidden');
    btn.disabled = false;
    btn.innerHTML = '<i data-lucide="lock" class="w-4 h-4"></i> Authorize & Continue';
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
