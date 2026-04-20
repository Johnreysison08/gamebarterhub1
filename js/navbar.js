// ═══════════════════════════════════════════════
// navbar.js — Nav User Display, Dropdown, Mobile Menu
// Notification badge updates delegated to notification.js
// ═══════════════════════════════════════════════

function updateNavUser() {
  const u              = state.currentUser;
  const authBtns       = document.getElementById('navAuthBtns');
  const loggedInArea   = document.getElementById('navLoggedInArea');
  const mobileAuth     = document.getElementById('mobileAuthLink');
  const mobileLogout   = document.getElementById('mobileLogoutLink');
  const mobileNotifBtn = document.getElementById('mobileNotifBtn');

  if (!authBtns) return;

  if (u) {
    authBtns.style.display        = 'none';
    loggedInArea.style.display    = 'flex';

    // Set username and avatar
    document.getElementById('navUsername').textContent = u.name.split(' ')[0];
    const av = document.getElementById('navAvatar');
    if (u.avatar) av.innerHTML  = `<img src="${u.avatar}" alt="">`;
    else          av.textContent = u.name[0].toUpperCase();

    if (mobileAuth)     mobileAuth.style.display     = 'none';
    if (mobileLogout)   mobileLogout.style.display   = 'block';
    if (mobileNotifBtn) mobileNotifBtn.style.display = 'block';

    // Sync notification badge
    updateNotifBadge();
  } else {
    authBtns.style.display        = 'flex';
    loggedInArea.style.display    = 'none';

    if (mobileAuth)     mobileAuth.style.display     = 'block';
    if (mobileLogout)   mobileLogout.style.display   = 'none';
    if (mobileNotifBtn) mobileNotifBtn.style.display = 'none';
  }
}

// updateNotifBadge is defined in notification.js and also syncs the
// mobile badge element below:
const _origUpdateNotifBadge = typeof updateNotifBadge === 'function'
  ? updateNotifBadge : null;

// Extend updateNotifBadge to also handle the mobile inline badge
function updateNotifBadge() {
  const u = state.currentUser;
  const count = u ? unreadNotifCount(u.email) : 0;

  // Desktop bell badge (notification.js handles #notifBadge & #notifUnreadChip)
  const badge = document.getElementById('notifBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Unread chip in panel header
  const chip = document.getElementById('notifUnreadChip');
  if (chip) {
    if (count > 0) {
      chip.textContent = count + ' new';
      chip.classList.remove('hidden');
    } else {
      chip.classList.add('hidden');
    }
  }

  // Mobile menu badge
  const mobileBadge = document.getElementById('mobileNotifBadge');
  if (mobileBadge) {
    if (count > 0) {
      mobileBadge.textContent  = count > 9 ? '9+' : count;
      mobileBadge.style.display = 'inline';
    } else {
      mobileBadge.style.display = 'none';
    }
  }
}

function toggleDropdown() {
  document.getElementById('profileDropdown')?.classList.toggle('open');
}

function closeDropdown() {
  document.getElementById('profileDropdown')?.classList.remove('open');
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu')?.classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-user-wrap')) closeDropdown();
});

function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
}
