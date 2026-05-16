// auth.js – handles login/logout and session checks
'use strict';

const Auth = (() => {
  const KEY = 'ct_user';

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; }
  }
  function setUser(u) { sessionStorage.setItem(KEY, JSON.stringify(u)); }
  function clearUser() { sessionStorage.removeItem(KEY); }

  async function login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Kirish muvaffaqiyatsiz');
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    clearUser();
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.location.href = '/login.html';
  }

  async function requireAuth() {
    let user = getUser();
    if (!user) {
      // try server session
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) { user = await res.json(); setUser(user); }
      } catch {}
    }
    if (!user) { window.location.href = '/login.html'; return null; }
    return user;
  }

  function requireRole(roles) {
    const user = getUser();
    if (!user) { window.location.href = '/login.html'; return false; }
    if (!roles.includes(user.role)) return false;
    return true;
  }

  return { login, logout, requireAuth, requireRole, getUser, setUser };
})();
