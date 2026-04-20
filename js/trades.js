// ═══════════════════════════════════════════════
// trades.js — Trade Card Rendering, Modal, Like, Comment
// ═══════════════════════════════════════════════

/* ── BUILD TRADE CARD HTML ── */
function tradeCardHTML(t, showOwnerControls) {
  const game = GAMES.find(g => g.id === t.game) || { name: t.game, icon: '🎮' };
  const isOwner = showOwnerControls ||
    (state.currentUser && state.currentUser.email === t.userEmail);

  const imgContent = t.img
    ? (t.img.startsWith('data:') || t.img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        ? `<img src="${t.img}" style="width:100%;height:100%;object-fit:cover;border-radius:0" alt="">`
        : `<span style="font-size:4rem">${t.img}</span>`)
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-card2);color:var(--text-muted);font-size:0.8rem;flex-direction:column;gap:6px"><span style="font-size:2.5rem">🖼️</span><span>No image</span></div>`;

  const ownerActions = isOwner ? `
    <div class="owner-controls" onclick="event.stopPropagation()" style="display:flex;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
      <button class="action-btn edit-btn" onclick="openEditModal(${t.id})" style="flex:1;background:rgba(0,212,255,0.1);color:var(--accent-cyan);border:1px solid rgba(0,212,255,0.3)">
        ✏️ Edit
      </button>
      <button class="action-btn delete-btn" onclick="deleteTrade(${t.id})" style="flex:1;background:rgba(255,59,59,0.1);color:#ff5555;border:1px solid rgba(255,59,59,0.3)">
        🗑️ Delete
      </button>
    </div>` : '';

  return `
  <div class="trade-card" onclick="openTradeModal(${t.id})">
    <div class="trade-card-img">
      ${imgContent}
      <div class="trade-card-img-overlay"></div>
      <div class="trade-category-badge">${game.name}</div>
    </div>
    <div class="trade-card-body">
      <div class="trade-card-user">
        <div class="mini-avatar" onclick="event.stopPropagation();viewUserProfile('${t.userEmail||''}','${escapeHtml(t.user)}')" style="cursor:pointer">${getAvatarEl(t.user)}</div>
        <span class="trade-username" onclick="event.stopPropagation();viewUserProfile('${t.userEmail||''}','${escapeHtml(t.user)}')" style="cursor:pointer;text-decoration:none;transition:color 0.2s" onmouseover="this.style.color='var(--accent-cyan)'" onmouseout="this.style.color=''">${t.user}</span>
        <span class="trade-time">${t.time}</span>
      </div>
      <div class="trade-title">${t.title}</div>
      <div class="trade-desc">${t.desc}</div>
      ${t.offer ? `<div class="trade-offer"><span>Offer: </span>${t.offer}</div>` : ''}
      <div class="trade-actions" onclick="event.stopPropagation()">
        <button class="action-btn ${t.likedByMe ? 'liked' : ''}" onclick="toggleLike(${t.id})">
          ${t.likedByMe ? '❤️' : '🤍'} ${t.likes}
        </button>
        <button class="action-btn" onclick="openTradeModal(${t.id})">
          💬 ${(t.comments || []).length}
        </button>
        ${isOwner ? '' : `<button class="trade-contact" onclick="goContact('${t.user}','${t.userEmail||''}')">Contact</button>`}
      </div>
      ${ownerActions}
    </div>
  </div>`;
}

/* ── DELETE TRADE ── */
function deleteTrade(id) {
  if (!state.currentUser) return;
  const t = state.trades.find(tr => tr.id === id);
  if (!t || t.userEmail !== state.currentUser.email) {
    showToast('Not authorised', 'error'); return;
  }
  if (!confirm('Delete this trade post? This cannot be undone.')) return;
  state.trades = state.trades.filter(tr => tr.id !== id);
  save();
  showToast('🗑️ Trade deleted.');
  if (typeof renderLatestTrades === 'function') renderLatestTrades();
  if (typeof renderBrowseGrid   === 'function') renderBrowseGrid();
  if (typeof renderMyTrades     === 'function') { renderMyTrades(); typeof renderProfile === 'function' && renderProfile(); }
}

/* ── OPEN EDIT TRADE MODAL ── */
function openEditModal(id) {
  const t = state.trades.find(tr => tr.id === id);
  if (!t || !state.currentUser || t.userEmail !== state.currentUser.email) return;

  const gameOpts = GAMES.map(g =>
    `<option value="${g.id}" ${g.id === t.game ? 'selected' : ''}>${g.icon} ${g.name}</option>`
  ).join('');

  // Image preview — even if no image was originally set, show upload area
  const imgPreview = t.img
    ? (t.img.startsWith('data:') || t.img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        ? `<img id="editImgPreviewEl" src="${t.img}" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px" alt="">`
        : `<div id="editImgPreviewEl" style="font-size:3rem;text-align:center;padding:12px;background:var(--bg-card2);border-radius:8px;margin-top:8px">${t.img}</div>`)
    : `<img id="editImgPreviewEl" style="display:none;width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px" alt="">`;

  const noImgHint = !t.img
    ? `<div id="editNoImgHint" style="text-align:center;padding:16px;color:var(--text-muted);font-size:0.82rem">📷 No image yet — click to add one</div>`
    : '';

  const removeBtn = t.img
    ? `<button onclick="clearEditImg(${id})" style="margin-top:6px;background:none;border:none;color:#ff5555;cursor:pointer;font-size:0.8rem">✕ Remove image</button>`
    : '';

  const overlay = document.getElementById('editTradeOverlay');
  if (!overlay) { buildEditTradeOverlay(); }

  document.getElementById('editTradeOverlay').innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div class="modal-header">
        <div class="modal-title">✏️ Edit Trade Post</div>
        <button class="modal-close" onclick="closeEditTradeModal()">✕</button>
      </div>
      <div style="padding:0 4px">
        <div class="form-group">
          <label class="form-label">Game Category *</label>
          <select class="form-input" id="editPostGame">${gameOpts}</select>
        </div>
        <div class="form-group">
          <label class="form-label">Post Title *</label>
          <input class="form-input" id="editPostTitle" type="text" value="${escapeHtml(t.title)}">
        </div>
        <div class="form-group">
          <label class="form-label">Description *</label>
          <textarea class="form-input" id="editPostDesc" style="min-height:100px">${escapeHtml(t.desc)}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Trade Offer / Price</label>
          <input class="form-input" id="editPostOffer" type="text" value="${escapeHtml(t.offer || '')}">
        </div>
        <div class="form-group">
          <label class="form-label">Post Image</label>
          <div class="post-img-upload" style="min-height:80px;padding:12px;cursor:pointer" onclick="document.getElementById('editImgInput').click()">
            <input type="file" accept="image/*" id="editImgInput" style="display:none" onchange="previewEditImg(this,${id})">
            ${noImgHint}
            ${imgPreview}
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:6px;text-align:center">${t.img ? 'Click to replace image' : ''}</div>
          </div>
          <div id="editImgBtnWrap">${removeBtn}</div>
        </div>
        <div class="error-msg" id="editTradeError"></div>
        <div style="display:flex;gap:12px;margin-top:16px">
          <button class="btn btn-ghost" onclick="closeEditTradeModal()" style="flex:1">Cancel</button>
          <button class="btn btn-primary" onclick="saveEditedTrade(${id})" style="flex:2;padding:12px">💾 Save Changes</button>
        </div>
      </div>
    </div>`;

  document.getElementById('editTradeOverlay').classList.add('open');
  state._editImgDataURL = t.img || null;
}

function buildEditTradeOverlay() {
  const ov = document.createElement('div');
  ov.id = 'editTradeOverlay';
  ov.className = 'modal-overlay';
  ov.onclick = (e) => { if (e.target === ov) closeEditTradeModal(); };
  document.body.appendChild(ov);
}

function closeEditTradeModal() {
  const ov = document.getElementById('editTradeOverlay');
  if (ov) ov.classList.remove('open');
  state._editImgDataURL = null;
}

function previewEditImg(input, id) {
  if (!input.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    state._editImgDataURL = e.target.result;
    const el = document.getElementById('editImgPreviewEl');
    const hint = document.getElementById('editNoImgHint');
    if (hint) hint.style.display = 'none';
    if (el) {
      el.src = e.target.result;
      el.style.display = 'block';
    }
    // Show remove button
    const btnWrap = document.getElementById('editImgBtnWrap');
    if (btnWrap && !btnWrap.querySelector('button')) {
      btnWrap.innerHTML = `<button onclick="clearEditImg(${id})" style="margin-top:6px;background:none;border:none;color:#ff5555;cursor:pointer;font-size:0.8rem">✕ Remove image</button>`;
    }
  };
  r.readAsDataURL(input.files[0]);
}

function clearEditImg(id) {
  state._editImgDataURL = '';
  const el = document.getElementById('editImgPreviewEl');
  if (el) { el.src = ''; el.style.display = 'none'; }
  const hint = document.getElementById('editNoImgHint');
  if (hint) hint.style.display = 'block';
  const btnWrap = document.getElementById('editImgBtnWrap');
  if (btnWrap) btnWrap.innerHTML = '';
}

function saveEditedTrade(id) {
  const t = state.trades.find(tr => tr.id === id);
  if (!t || !state.currentUser || t.userEmail !== state.currentUser.email) return;

  const game  = document.getElementById('editPostGame').value;
  const title = document.getElementById('editPostTitle').value.trim();
  const desc  = document.getElementById('editPostDesc').value.trim();
  const offer = document.getElementById('editPostOffer').value.trim();
  const err   = document.getElementById('editTradeError');

  err.style.display = 'none';
  if (!game)  { showErr(err, 'Please select a game.'); return; }
  if (!title) { showErr(err, 'Title is required.'); return; }
  if (!desc)  { showErr(err, 'Description is required.'); return; }

  t.game  = game;
  t.title = title;
  t.desc  = desc;
  t.offer = offer;
  // _editImgDataURL null = unchanged, '' = removed, string = new image
  if (state._editImgDataURL !== null) t.img = state._editImgDataURL || null;
  t.edited = true;

  save();
  closeEditTradeModal();
  showToast('✅ Trade updated!');

  if (typeof renderLatestTrades === 'function') renderLatestTrades();
  if (typeof renderBrowseGrid   === 'function') renderBrowseGrid();
  if (typeof renderMyTrades     === 'function') { renderMyTrades(); typeof renderProfile === 'function' && renderProfile(); }
}

/* ── HTML ESCAPE HELPER ── */
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── TRADE DETAIL MODAL ── */
function openTradeModal(id) {
  const t = state.trades.find(tr => tr.id === id);
  if (!t) return;

  const game = GAMES.find(g => g.id === t.game) || { name: t.game, icon: '🎮' };

  const imgBlock = t.img
    ? (t.img.startsWith('data:') || t.img.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
        ? `<img src="${t.img}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px" alt="">`
        : `<div style="font-size:5rem;text-align:center;padding:20px;background:var(--bg-card2);border-radius:8px;margin-bottom:16px">${t.img}</div>`)
    : '';

  const isOwner = state.currentUser && state.currentUser.email === t.userEmail;
  const ownerModalControls = isOwner ? `
    <div style="display:flex;gap:10px;margin-bottom:16px">
      <button class="btn btn-ghost" style="flex:1;font-size:0.82rem;padding:8px" onclick="closeModal();openEditModal(${t.id})">
        ✏️ Edit Post
      </button>
      <button onclick="closeModal();deleteTrade(${t.id})" style="flex:1;font-size:0.82rem;padding:8px;background:rgba(255,59,59,0.1);color:#ff5555;border:1px solid rgba(255,59,59,0.35);border-radius:var(--radius);cursor:pointer;font-family:inherit">
        🗑️ Delete Post
      </button>
    </div>` : '';

  const commentForm = state.currentUser
    ? `<div style="display:flex;gap:10px;align-items:flex-end">
         <textarea class="form-input" id="commentInput" placeholder="Write a comment..."
           style="min-height:60px;border-radius:12px;flex:1"></textarea>
         <button class="btn btn-primary" style="padding:10px 16px;flex-shrink:0"
           onclick="addComment(${t.id})">Send</button>
       </div>`
    : `<p style="font-size:0.82rem;color:var(--text-muted)">
         <a href="login.html" style="color:var(--accent-cyan)">Sign in</a> to comment.
       </p>`;

  document.getElementById('modalTitle').textContent = t.title;
  document.getElementById('modalBody').innerHTML = `
    <div class="tag tag-cyan" style="margin-bottom:14px">${game.icon} ${game.name}</div>
    ${imgBlock}
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <div class="mini-avatar" style="width:34px;height:34px;font-size:0.85rem;cursor:pointer" onclick="closeModal();viewUserProfile('${t.userEmail||''}','${t.user}')">${getAvatarEl(t.user)}</div>
      <div>
        <div style="font-size:0.88rem;font-weight:600;cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='var(--accent-cyan)'" onmouseout="this.style.color=''" onclick="closeModal();viewUserProfile('${t.userEmail||''}','${t.user}')">${t.user}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">${t.time}</div>
      </div>
      ${!isOwner && state.currentUser ? `<button class="trade-contact" style="margin-left:auto" onclick="goContact('${t.user}','${t.userEmail||''}');closeModal()">
        Contact Trader
      </button>` : ''}
    </div>
    <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.7;margin-bottom:14px">${t.desc}</p>
    ${t.offer ? `<div class="trade-offer" style="margin-bottom:18px"><span>Trade Offer: </span>${t.offer}</div>` : ''}
    <div class="divider"></div>
    ${ownerModalControls}
    <div style="display:flex;gap:16px;margin-bottom:20px">
      <button class="action-btn ${t.likedByMe ? 'liked' : ''}" style="font-size:0.88rem"
        onclick="toggleLike(${t.id});openTradeModal(${t.id})">
        ${t.likedByMe ? '❤️' : '🤍'} ${t.likes} Likes
      </button>
      <span style="color:var(--text-muted);font-size:0.85rem">💬 ${(t.comments || []).length} Comments</span>
    </div>
    <div style="font-family:'Rajdhani',sans-serif;font-size:1rem;font-weight:700;margin-bottom:14px">Comments</div>
    <div class="comments-list">${renderComments(t.comments, t.id)}</div>
    ${commentForm}
  `;

  document.getElementById('modalOverlay').classList.add('open');
}

/* ── RENDER COMMENTS ── */
function renderComments(comments, tradeId) {
  if (!comments || !comments.length)
    return `<p style="font-size:0.82rem;color:var(--text-muted);padding:8px 0">No comments yet. Be the first!</p>`;

  return comments.map((c, idx) => {
    const repliesHtml = (c.replies || []).map(r => `
      <div class="reply">
        <div class="mini-avatar" style="width:26px;height:26px;font-size:0.7rem;flex-shrink:0">${getAvatarEl(r.user)}</div>
        <div class="reply-body">
          <div class="comment-header">
            <span class="comment-user">${r.user}</span>
            <span class="comment-time">${r.time}</span>
          </div>
          <div class="comment-text">${r.text}</div>
        </div>
      </div>`).join('');

    const replyFormId = `replyForm_${tradeId}_${idx}`;
    const replyForm = state.currentUser ? `
      <div class="reply-input-wrap" id="${replyFormId}" style="display:none">
        <textarea class="form-input" id="replyInput_${tradeId}_${idx}" placeholder="Write a reply..." style="min-height:48px;font-size:0.8rem;border-radius:8px;flex:1"></textarea>
        <button class="btn btn-primary" style="font-size:0.78rem;padding:8px 12px" onclick="addReply(${tradeId},${idx})">↩ Reply</button>
      </div>` : '';

    return `
    <div class="comment">
      <div class="mini-avatar" style="flex-shrink:0">${getAvatarEl(c.user)}</div>
      <div class="comment-body" style="flex:1">
        <div class="comment-header">
          <span class="comment-user">${c.user}</span>
          <span class="comment-time">${c.time}</span>
        </div>
        <div class="comment-text">${c.text}</div>
        ${state.currentUser ? `<button class="comment-reply-btn" onclick="toggleReplyForm('${replyFormId}')">↩ Reply${c.replies && c.replies.length ? ` (${c.replies.length})` : ''}</button>` : ''}
        ${repliesHtml ? `<div class="replies-list">${repliesHtml}</div>` : ''}
        ${replyForm}
      </div>
    </div>`;
  }).join('');
}

/* ── TOGGLE REPLY FORM ── */
function toggleReplyForm(id) {
  const form = document.getElementById(id);
  if (!form) return;
  form.style.display = form.style.display === 'none' ? 'flex' : 'none';
  if (form.style.display === 'flex') form.querySelector('textarea')?.focus();
}

/* ── ADD REPLY ── */
function addReply(tradeId, commentIdx) {
  if (!state.currentUser) return;
  const input = document.getElementById(`replyInput_${tradeId}_${commentIdx}`);
  const text = input?.value.trim();
  if (!text) return;

  const t = state.trades.find(tr => tr.id === tradeId);
  if (!t || !t.comments[commentIdx]) return;

  const c = t.comments[commentIdx];
  c.replies = c.replies || [];
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  c.replies.push({ user: state.currentUser.name, text, time });

  // Notify the comment author (if not same user)
  if (c.userEmail && c.userEmail !== state.currentUser.email) {
    pushNotification(c.userEmail, {
      type: 'comment',
      tradeId: t.id,
      tradeTitle: t.title,
      fromUser: state.currentUser.name,
      text: `replied: ${text.length > 50 ? text.slice(0, 50) + '…' : text}`,
      time,
    });
  }
  // Also notify trade owner if different
  if (t.userEmail && t.userEmail !== state.currentUser.email && t.userEmail !== c.userEmail) {
    pushNotification(t.userEmail, {
      type: 'comment',
      tradeId: t.id,
      tradeTitle: t.title,
      fromUser: state.currentUser.name,
      text: `replied to a comment: ${text.length > 50 ? text.slice(0, 50) + '…' : text}`,
      time,
    });
  }

  save();
  openTradeModal(tradeId);
}

/* ── ADD COMMENT ── */
function addComment(tradeId) {
  const text = document.getElementById('commentInput').value.trim();
  if (!text) return;

  const t = state.trades.find(tr => tr.id === tradeId);
  if (!t) return;

  t.comments = t.comments || [];
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  t.comments.push({ user: state.currentUser.name, userEmail: state.currentUser.email, text, time });

  // Notify post owner (if not same user)
  if (t.userEmail && t.userEmail !== state.currentUser.email) {
    pushNotification(t.userEmail, {
      type: 'comment',
      tradeId: t.id,
      tradeTitle: t.title,
      fromUser: state.currentUser.name,
      text: text.length > 60 ? text.slice(0, 60) + '…' : text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  save();
  openTradeModal(tradeId);
}

/* ── TOGGLE LIKE ── */
function toggleLike(id) {
  if (!state.currentUser) { showToast('Sign in to like posts', 'error'); return; }

  const t = state.trades.find(tr => tr.id === id);
  if (!t) return;

  const wasLiked = t.likedByMe;
  t.likedByMe = !wasLiked;
  t.likes    += t.likedByMe ? 1 : -1;

  // Notify post owner when liking (not unliking)
  if (!wasLiked && t.userEmail && t.userEmail !== state.currentUser.email) {
    pushNotification(t.userEmail, {
      type: 'like',
      tradeId: t.id,
      tradeTitle: t.title,
      fromUser: state.currentUser.name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  save();

  if (typeof renderLatestTrades === 'function') renderLatestTrades();
  if (typeof renderBrowseGrid   === 'function') renderBrowseGrid();
  if (typeof renderMyTrades     === 'function') renderMyTrades();
}

/* ── CONTACT HELPER ── */
function goContact(username, userEmail) {
  if (!state.currentUser) {
    showToast('Sign in to contact traders', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return;
  }
  if (username === state.currentUser.name) {
    showToast("You can't message yourself!", 'error');
    return;
  }
  // Ensure convo exists
  const targetEmail = userEmail || (state.users.find(u => u.name === username) || {}).email || username;
  getOrCreateConvo(state.currentUser.email, targetEmail);
  save();
  localStorage.setItem('ta_openChat', targetEmail);
  window.location.href = 'messages.html';
}
