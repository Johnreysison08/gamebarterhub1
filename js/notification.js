// ═══════════════════════════════════════════════
// notification.js — Notification Button, Panel,
// Badge Updates, Filtering, and Event Handlers
// ═══════════════════════════════════════════════

// ── TOGGLE PANEL ──
function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;

  const isOpen = panel.classList.contains('notif-panel-open');
  if (isOpen) {
    closeNotifPanel();
  } else {
    openNotifPanel();
  }
}

function openNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.style.display = 'block';
  // Force reflow before adding class for animation
  panel.getBoundingClientRect();
  panel.classList.add('notif-panel-open');
  renderNotifList();
}

function closeNotifPanel() {
  const panel = document.getElementById('notifPanel');
  if (!panel) return;
  panel.classList.remove('notif-panel-open');
  // Hide after animation
  setTimeout(() => {
    if (!panel.classList.contains('notif-panel-open')) {
      panel.style.display = 'none';
    }
  }, 180);
}

// ── RENDER NOTIFICATION LIST ──
// activeFilter: 'all' | 'unread' | 'likes' | 'comments'
let _notifFilter = 'all';

function renderNotifList(filter) {
  if (filter !== undefined) _notifFilter = filter;

  const u = state.currentUser;
  const el = document.getElementById('notifList');
  if (!el) return;

  if (!u) {
    el.innerHTML = `
      <div class="notif-empty">
        <div class="notif-empty-icon">🔔</div>
        <p>Sign in to see your notifications</p>
      </div>`;
    return;
  }

  let notifs = (state.notifications[u.email] || []).slice(0, 50);

  // Apply filter
  if (_notifFilter === 'unread') {
    notifs = notifs.filter(n => !n.read);
  } else if (_notifFilter === 'likes') {
    notifs = notifs.filter(n => n.type === 'like');
  } else if (_notifFilter === 'comments') {
    notifs = notifs.filter(n => n.type === 'comment');
  }

  if (!notifs.length) {
    const msgs = {
      all:      ['No notifications yet.', 'Likes and comments on your trades will appear here.'],
      unread:   ['All caught up!', 'No unread notifications.'],
      likes:    ['No likes yet.', 'When someone likes your trade, it shows here.'],
      comments: ['No comments yet.', 'Comments on your trades will appear here.'],
    };
    const [title, sub] = msgs[_notifFilter] || msgs.all;
    el.innerHTML = `
      <div class="notif-empty">
        <div class="notif-empty-icon">🔔</div>
        <p>${title}</p>
        <small>${sub}</small>
      </div>`;
    return;
  }

  el.innerHTML = notifs.map(n => {
    const isLike    = n.type === 'like';
    const icon      = isLike ? '❤️' : '💬';
    const iconClass = isLike ? 'type-like' : 'type-comment';
    const msg       = isLike
      ? `<b>${escapeHtml(n.fromUser)}</b> liked your trade <i>"${escapeHtml(n.tradeTitle)}"</i>`
      : `<b>${escapeHtml(n.fromUser)}</b> commented on <i>"${escapeHtml(n.tradeTitle)}"</i>: ${escapeHtml(n.text || '')}`;

    return `
    <div class="notif-item${n.read ? '' : ' unread'}"
         onclick="openTradeModalFromNotif(${n.tradeId}, '${n.id}')">
      <div class="notif-icon-wrap ${iconClass}">${icon}</div>
      <div class="notif-content">
        <div class="notif-msg">${msg}</div>
        <div class="notif-time">${n.time || ''}</div>
      </div>
      ${!n.read ? `<span class="notif-dot"></span>` : ''}
    </div>`;
  }).join('');
}

// ── OPEN TRADE FROM NOTIFICATION ──
function openTradeModalFromNotif(tradeId, notifId) {
  const u = state.currentUser;
  if (u && state.notifications[u.email]) {
    const n = state.notifications[u.email].find(x => String(x.id) === String(notifId));
    if (n) {
      n.read = true;
      save();
      updateNotifBadge();
    }
  }
  closeNotifPanel();
  if (typeof openTradeModal === 'function') openTradeModal(tradeId);
}

// ── MARK ALL READ ──
function markAllNotifsRead() {
  const u = state.currentUser;
  if (!u) return;
  (state.notifications[u.email] || []).forEach(n => (n.read = true));
  save();
  updateNotifBadge();
  renderNotifList();
}

// ── CLEAR ALL NOTIFICATIONS ──
function clearAllNotifs() {
  const u = state.currentUser;
  if (!u) return;
  state.notifications[u.email] = [];
  save();
  updateNotifBadge();
  renderNotifList();
}

// ── UPDATE BADGE ──
function updateNotifBadge() {
  const u = state.currentUser;

  // Desktop badge (on button)
  const badge = document.getElementById('notifBadge');
  // Legacy text badge (kept for backward compat)
  const badgeTxt = document.getElementById('navNotifBadgeText');
  // Unread count chip in panel header
  const unreadChip = document.getElementById('notifUnreadChip');

  const count = u ? unreadNotifCount(u.email) : 0;

  if (badge) {
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Keep legacy badge in sync (navbar-template nav-link badge)
  if (badgeTxt) {
    if (count > 0) {
      badgeTxt.textContent    = count > 9 ? '9+' : count;
      badgeTxt.style.display  = 'inline-block';
    } else {
      badgeTxt.style.display  = 'none';
    }
  }

  if (unreadChip) {
    if (count > 0) {
      unreadChip.textContent = count + ' new';
      unreadChip.classList.remove('hidden');
    } else {
      unreadChip.classList.add('hidden');
    }
  }
}

// ── FILTER TAB CLICK ──
function setNotifFilter(filter, tabEl) {
  _notifFilter = filter;
  // Update tab active state
  document.querySelectorAll('.notif-filter-tab').forEach(t => t.classList.remove('active'));
  if (tabEl) tabEl.classList.add('active');
  renderNotifList(filter);
}

// ── CLOSE ON OUTSIDE CLICK ──
document.addEventListener('click', function(e) {
  const panel   = document.getElementById('notifPanel');
  const btn     = document.getElementById('notifBtn');
  const mobileBtn = document.getElementById('mobileNotifBtn');

  if (!panel) return;
  if (!panel.classList.contains('notif-panel-open')) return;

  const clickedInside =
    panel.contains(e.target) ||
    (btn && btn.contains(e.target)) ||
    (mobileBtn && mobileBtn.contains(e.target));

  if (!clickedInside) closeNotifPanel();
});

// ── SAFE HTML ESCAPE (fallback if not defined elsewhere) ──
if (typeof escapeHtml !== 'function') {
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
