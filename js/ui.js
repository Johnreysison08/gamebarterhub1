// ═══════════════════════════════════════════════
// ui.js — Toast, Modal, Shared UI Helpers
// ═══════════════════════════════════════════════

/* ── VALUE HELPER ── */
function val(id) {
  return document.getElementById(id)?.value || '';
}

/* ── VIEW USER PROFILE ── */
function viewUserProfile(userEmail, username) {
  if (!userEmail) {
    // Try to find by username
    const u = state.users.find(u => u.name === username);
    if (u) userEmail = u.email;
  }
  // If it's the logged-in user, go to own profile
  if (state.currentUser && state.currentUser.email === userEmail) {
    window.location.href = 'profile.html';
    return;
  }
  if (userEmail) {
    window.location.href = `user-profile.html?u=${encodeURIComponent(userEmail)}`;
  } else {
    showToast('User profile not available', 'error');
  }
}

/* ── ERROR MESSAGE ── */
function showErr(el, msg) {
  el.textContent  = '⚠️ ' + msg;
  el.style.display = 'block';
}

/* ── TOAST ── */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

/* ── MODAL ── */
function openModal() {
  document.getElementById('modalOverlay')?.classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay')?.classList.remove('open');
}

/* ── AVATAR ELEMENT ── */
function getAvatarEl(username) {
  const u = state.users.find(u => u.name === username);
  if (u && u.avatar) return `<img src="${u.avatar}" alt="">`;
  return username ? username[0].toUpperCase() : '?';
}

/* ── SHARED NAV HTML ── */
// Inject shared navbar into pages that call this
function injectNavbar(activePage = '') {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  nav.style.display = 'flex';
  updateNavUser();
  setActiveNav();
}
