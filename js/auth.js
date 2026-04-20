// ═══════════════════════════════════════════════
// auth.js — Register, Login, Logout, Session
// ═══════════════════════════════════════════════

function doRegister() {
  const name  = val('regName').trim();
  const email = val('regEmail').trim().toLowerCase();
  const pass  = val('regPass');
  const pass2 = val('regPass2');
  const loc   = val('regLocation').trim();

  const err = document.getElementById('regError');
  const suc = document.getElementById('regSuccess');
  err.style.display = 'none';
  suc.style.display = 'none';

  if (!name || !email || !pass)
    return showErr(err, 'Please fill in all required fields.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return showErr(err, 'Invalid email address.');
  if (pass.length < 6)
    return showErr(err, 'Password must be at least 6 characters.');
  if (pass !== pass2)
    return showErr(err, 'Passwords do not match.');
  if (state.users.find(u => u.email === email))
    return showErr(err, 'An account with this email already exists.');

  const user = {
    id: Date.now().toString(),
    name, email, pass, loc,
    avatar: state.avatarDataURL || null,
    createdAt: new Date().toISOString(),
  };
  state.users.push(user);
  save();

  suc.style.display = 'block';
  suc.textContent   = '✅ Account created! Redirecting to login...';
  setTimeout(() => { window.location.href = 'login.html'; }, 1500);
}

function doLogin() {
  const email = val('loginEmail').trim().toLowerCase();
  const pass  = val('loginPass');
  const err   = document.getElementById('loginError');
  err.style.display = 'none';

  if (!email || !pass) return showErr(err, 'Please fill in all fields.');

  const user = state.users.find(u => u.email === email && u.pass === pass);
  if (!user) return showErr(err, 'Invalid email or password.');

  setLoggedIn(user);
  showToast('Welcome back, ' + user.name + '! 👋');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

function setLoggedIn(user) {
  state.currentUser = user;
  localStorage.setItem('ta_loggedIn', user.email);
  updateNavUser();
}

function logout() {
  state.currentUser = null;
  localStorage.removeItem('ta_loggedIn');
  updateNavUser();
  showToast('Signed out successfully');
  setTimeout(() => { window.location.href = 'index.html'; }, 800);
}

function restoreSession() {
  const savedEmail = localStorage.getItem('ta_loggedIn');
  if (savedEmail) {
    const u = state.users.find(u => u.email === savedEmail);
    if (u) {
      state.currentUser = u;
      updateNavUser();
    }
  }
}

function requireLoginRedirect() {
  if (!state.currentUser) {
    showToast('Please sign in first', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return false;
  }
  return true;
}

function previewAvatar(input) {
  if (!input.files[0]) return;
  const r = new FileReader();
  r.onload = e => {
    state.avatarDataURL = e.target.result;
    const preview = document.getElementById('regAvatarPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="">`;
  };
  r.readAsDataURL(input.files[0]);
}
