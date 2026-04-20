// ═══════════════════════════════════════════════
// data.js — Game data, Sample trades, App State
// ═══════════════════════════════════════════════

const GAMES = [
  { id: 'ml',   name: 'Mobile Legends',   icon: '',  count: 0 },
  { id: 'rb',   name: 'Roblox',           icon: '',  count: 0  },
  { id: 'val',  name: 'Valorant',         icon: '',  count: 0 },
  { id: 'gi',   name: 'Genshin Impact',   icon: '',  count: 0 },
  { id: 'codm', name: 'COD Mobile',       icon: '',  count: 0  },
  { id: 'pubg', name: 'PUBG Mobile',      icon: '',  count: 0  },
  { id: 'fn',   name: 'Fortnite',         icon: '',  count: 0 },
  { id: 'mc',   name: 'Minecraft',        icon: '',  count: 0 },
  { id: 'lol',  name: 'League of Legends',icon: '',  count: 0 },
  { id: 'gta',  name: 'GTA Online',       icon: '',  count: 0 },
];

const SAMPLE_TRADES = [
  {
    id: 1, game: 'val',
    title: 'Valorant Account — Radiant Rank + 30 Skins',
    desc:  'Fully upgraded account with Radiant rank in Episode 7. Includes Prime 2.0, Reaver, and Glitchpop bundles. Linked email available.',
    offer: 'PHP 8,500 or trade for Genshin 5-star account',
    user: 'xX_Dante_Xx', userEmail: 'dante@sample.gbh', time: '2h ago', likes: 0, comments: [], img: 'images/valorant.jpg'
  },
  {
    id: 2, game: 'gi',
    title: 'Genshin Impact AR58 — C2 Raiden, Hu Tao, Kazuha',
    desc:  'Adventure Rank 58 with Raiden Shogun C2, Hu Tao C1, Kazuha C2, Nahida. All with signature weapons.',
    offer: 'Looking for PHP 12,000 or premium MLBB account',
    user: 'StarWalker_PH', userEmail: 'starwalker@sample.gbh', time: '4h ago', likes: 0, comments: [], img: 'images/genshin.jpg'
  },
  {
    id: 3, game: 'ml',
    title: 'MLBB Account — Mythic Glory + 200 Skins',
    desc:  'Mythic Glory rank with 200+ skins including all limited editions. Season 28 skin included. High win rate on Chou and Fanny.',
    offer: 'PHP 5,000 or swap for Valorant Gold+ account',
    user: 'PhoenixRising', userEmail: 'phoenix@sample.gbh', time: '5h ago', likes: 0, comments: [], img: 'images/mlbb.jpg'
  },
  {
    id: 4, game: 'rb',
    title: 'Roblox Account — 100K+ Robux Items + Limiteds',
    desc:  'Premium Roblox account with thousands of limited items. Includes rare headless horseman and classic limiteds. 6-year-old account.',
    offer: 'Trading for 50K Robux or equivalent items',
    user: 'RbxKing99', userEmail: 'rbxking@sample.gbh', time: '6h ago', likes: 0, comments: [], img: 'images/roblox.jpg'
  },
  {
    id: 5, game: 'fn',
    title: 'Fortnite OG Account — Chapter 1 Battle Pass Items',
    desc:  'Rare OG Fortnite account with all Chapter 1 battle pass skins including the Black Knight and Season 2 exclusives.',
    offer: 'USD 150 PayPal or trade for another OG account',
    user: 'V_Bucks_Lord', userEmail: 'vbucks@sample.gbh', time: '8h ago', likes: 0, comments: [], img: 'images/fortnite.webp'
  },
  {
    id: 6, game: 'mc',
    title: 'Minecraft Java Account — Full Hypixel MVP++',
    desc:  'Minecraft Java account with active MVP++ rank on Hypixel. Level 300+ with rare cosmetics. Optifine capes included.',
    offer: 'PHP 2,500 or swap for Roblox Premium account',
    user: 'hotdog', userEmail: 'hotdog@sample.gbh', time: '10h ago', likes: 0, comments: [], img: 'images/minecraft.jpg'
  },
];

// ── GLOBAL STATE ──
const state = {
  currentUser:     null,
  users:           JSON.parse(localStorage.getItem('ta_users')   || '[]'),
  trades:          JSON.parse(localStorage.getItem('ta_trades')  || JSON.stringify(SAMPLE_TRADES)),
  // convos keyed by sorted "emailA::emailB" — shared by both participants
  convos:          JSON.parse(localStorage.getItem('ta_convos')  || '{}'),
  // notifications keyed by user email
  notifications:   JSON.parse(localStorage.getItem('ta_notifs')  || '{}'),
  currentFilter:   'all',
  avatarDataURL:   null,
  postImgDataURL:  null,
  _editImgDataURL: null,
};

// ── CONVO KEY ── sorted so both sides share the same entry
function convoKey(emailA, emailB) {
  return [emailA, emailB].sort().join('::');
}

// ── GET OR CREATE CONVO ──
function getOrCreateConvo(emailA, emailB) {
  const key = convoKey(emailA, emailB);
  if (!state.convos[key]) {
    state.convos[key] = { participants: [emailA, emailB], messages: [] };
  }
  return state.convos[key];
}

// ── PUSH NOTIFICATION ──
function pushNotification(toEmail, notif) {
  if (!state.notifications[toEmail]) state.notifications[toEmail] = [];
  state.notifications[toEmail].unshift({ ...notif, read: false, id: Date.now() + Math.random() });
  save();
}

// ── UNREAD NOTIFICATION COUNT ──
function unreadNotifCount(email) {
  return (state.notifications[email] || []).filter(n => !n.read).length;
}

// ── SAVE TO LOCALSTORAGE ──
function save() {
  localStorage.setItem('ta_users',   JSON.stringify(state.users));
  localStorage.setItem('ta_trades',  JSON.stringify(state.trades));
  localStorage.setItem('ta_convos',  JSON.stringify(state.convos));
  localStorage.setItem('ta_notifs',  JSON.stringify(state.notifications));
  if (state.currentUser) localStorage.setItem('ta_loggedIn', state.currentUser.email);
}
