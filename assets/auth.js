/**
 * BaytLogic Technologies - Staff & Admin Authentication Module
 */

const DEFAULT_ACCOUNTS = [
  {
    id: 'usr-admin-01',
    name: 'Yahaya Abdullahi Sulaiman',
    username: 'admin',
    email: 'info@baytlogic.com.ng',
    password: 'BaytLogic2026',
    role: 'Chief Admin & Lead Engineer'
  },
  {
    id: 'usr-tech-02',
    name: 'Engr. Abdulkadir',
    username: 'abdulkadir',
    email: 'tech@baytlogic.com.ng',
    password: 'BaytLogicField2026',
    role: 'Field Operations Engineer'
  }
];

// Initialize accounts if missing
if (!localStorage.getItem('baytlogic_accounts')) {
  localStorage.setItem('baytlogic_accounts', JSON.stringify(DEFAULT_ACCOUNTS));
}

function getAccounts() {
  return JSON.parse(localStorage.getItem('baytlogic_accounts')) || DEFAULT_ACCOUNTS;
}

function saveAccount(acc) {
  const accounts = getAccounts();
  const existingIndex = accounts.findIndex(a => a.username.toLowerCase() === acc.username.toLowerCase());
  if (existingIndex >= 0) {
    accounts[existingIndex] = acc;
  } else {
    accounts.push(acc);
  }
  localStorage.setItem('baytlogic_accounts', JSON.stringify(accounts));
}

function deleteAccount(id) {
  let accounts = getAccounts();
  accounts = accounts.filter(a => a.id !== id && a.username !== 'admin');
  localStorage.setItem('baytlogic_accounts', JSON.stringify(accounts));
}

function getCurrentUser() {
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
  window.location.reload();
}

function authenticate(username, password) {
  const accounts = getAccounts();
  const user = accounts.find(a => 
    (a.username.toLowerCase() === username.trim().toLowerCase() || a.email.toLowerCase() === username.trim().toLowerCase()) && 
    a.password === password
  );
  if (user) {
    setCurrentUser(user);
    return { success: true, user };
  }
  return { success: false, error: 'Invalid username or password.' };
}

// Render Login Modal Gate if not authenticated
function requireStaffAuth(onAuthSuccess) {
  const currentUser = getCurrentUser();
  if (currentUser) {
    if (onAuthSuccess) onAuthSuccess(currentUser);
    renderUserBar(currentUser);
    return;
  }

  // Create Auth Modal Element
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
          <p class="text-xs text-slate-400">Chief Admin & Field Operations Access Only</p>
        </div>

        <div id="loginAlert" class="hidden p-3 bg-red-900/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold text-center"></div>

        <form onsubmit="handleAuthSubmit(event)" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-300 font-semibold mb-1">Username or Email</label>
            <input type="text" id="authUsername" placeholder="e.g. admin or info@baytlogic.com.ng" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <div>
            <label class="block text-slate-300 font-semibold mb-1">Password</label>
            <input type="password" id="authPassword" placeholder="••••••••" required class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:border-brand-primary transition font-medium" />
          </div>

          <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] text-slate-400 space-y-1">
            <p><strong class="text-cyan-400">Default Chief Admin Login:</strong></p>
            <p>• Username: <code class="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono">admin</code></p>
            <p>• Password: <code class="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono">BaytLogic2026</code></p>
          </div>

          <button type="submit" class="w-full py-3.5 bg-brand-primary hover:bg-cyan-600 text-white font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2">
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

function handleAuthSubmit(e) {
  e.preventDefault();
  const username = document.getElementById('authUsername').value;
  const password = document.getElementById('authPassword').value;
  const alertBox = document.getElementById('loginAlert');

  const res = authenticate(username, password);
  if (res.success) {
    const authModal = document.getElementById('staffAuthModal');
    if (authModal) authModal.remove();
    window.location.reload();
  } else {
    alertBox.innerText = res.error;
    alertBox.classList.remove('hidden');
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
