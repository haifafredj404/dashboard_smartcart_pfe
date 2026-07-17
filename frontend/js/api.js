// js/api.js — Smart Cart API Helper
const API_BASE = 'http://localhost:5000/api';

function getToken() { return localStorage.getItem('sc_token'); }
function getAdmin()  { return JSON.parse(localStorage.getItem('sc_admin') || '{}'); }

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

async function apiRequest(method, endpoint, body) {
  try {
    var opts = { method: method, headers: authHeaders() };
    if (body) opts.body = JSON.stringify(body);
    var res  = await fetch(API_BASE + endpoint, opts);
    var data = await res.json();
    if (res.status === 401 || res.status === 403) {
      logout();
      return null;
    }
    return data;
  } catch (err) {
    console.error('API Error:', err);
    return null;
  }
}

var api = {
  get:    function(ep)       { return apiRequest('GET',    ep, null); },
  post:   function(ep, body) { return apiRequest('POST',   ep, body); },
  put:    function(ep, body) { return apiRequest('PUT',    ep, body); },
  delete: function(ep)       { return apiRequest('DELETE', ep, null); }
};

function checkAuth() {
  var token = getToken();
  if (!token) { window.location.href = '/pages/login.html'; return false; }
  return true;
}

function logout() {
  localStorage.removeItem('sc_token');
  localStorage.removeItem('sc_admin');
  window.location.href = '/pages/login.html';
}

function showToast(msg, type) {
  if (!type) type = 'success';
  var container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  var toast = document.createElement('div');
  toast.className = 'toast ' + (type !== 'success' ? type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3500);
}

function formatCurrency(n) {
  return parseFloat(n || 0).toLocaleString('fr-TN', { minimumFractionDigits: 3 }) + ' TND';
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function formatRelativeTime(d) {
  var diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60)    return 'À l\'instant';
  if (diff < 3600)  return 'il y a ' + Math.floor(diff/60) + ' min';
  if (diff < 86400) return 'il y a ' + Math.floor(diff/3600) + ' heure(s)';
  return 'il y a ' + Math.floor(diff/86400) + ' jour(s)';
}

function initAdminUI() {
  var admin = getAdmin();
  if (!admin.nom) return;
  var initials = admin.nom.split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);
  document.querySelectorAll('.js-admin-name').forEach(function(el)   { el.textContent = admin.nom; });
  document.querySelectorAll('.js-admin-role').forEach(function(el)   { el.textContent = 'Responsable du Magasin'; });
  document.querySelectorAll('.js-admin-avatar').forEach(function(el) { el.textContent = initials; });
}

async function loadNotifCount() {
  var data = await api.get('/notifications');
  if (data && data.success) {
    var badge = document.querySelector('.notif-badge');
    if (badge) badge.style.display = data.non_lues > 0 ? 'block' : 'none';
    document.querySelectorAll('.js-notif-count').forEach(function(el) {
      el.textContent = data.non_lues + ' Nouvelles';
    });
  }
}

async function loadNotifDropdown() {
  var data = await api.get('/notifications');
  if (!data || !data.success) return;
  var list = document.getElementById('notifList');
  if (!list) return;

  var iconMap = { batterie_faible:'🔋', nouvelle_session:'🛒', alerte_systeme:'⚠️', paiement:'✅', maintenance:'🔧' };
  var typeMap = { batterie_faible:'warning', nouvelle_session:'info', alerte_systeme:'danger', paiement:'info', maintenance:'warning' };

  var html  = '';
  var items = data.data.slice(0, 5);
  for (var i = 0; i < items.length; i++) {
    var n = items[i];
    html += '<div class="notif-item" onclick="markNotifRead(' + n.id + ')">' +
      '<div class="notif-item-icon ' + (typeMap[n.type] || 'info') + '">' + (iconMap[n.type] || '🔔') + '</div>' +
      '<div>' +
        '<div class="notif-item-title">' + n.titre + '</div>' +
        '<div class="notif-item-msg">' + n.message + '</div>' +
        '<div class="notif-item-time">🕐 ' + formatRelativeTime(n.created_at) + '</div>' +
      '</div>' +
    '</div>';
  }
  list.innerHTML = html || '<div style="padding:20px;text-align:center;color:#94a3b8">Aucune notification</div>';
}

async function markNotifRead(id) {
  await api.put('/notifications/' + id + '/lire');
  loadNotifCount();
}

function toggleNotifDropdown() {
  var dropdown = document.getElementById('notifDropdown');
  if (!dropdown) return;
  dropdown.classList.toggle('show');
  if (dropdown.classList.contains('show')) loadNotifDropdown();
}

document.addEventListener('click', function(e) {
  var dropdown = document.getElementById('notifDropdown');
  var btn      = document.getElementById('notifBtn');
  if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('show');
  }
  // Fermer recherche si clic en dehors
  var searchBox = document.querySelector('.search-box');
  if (searchBox && !searchBox.contains(e.target)) {
    closeSearchDropdown();
  }
});

// ── Recherche Globale ──────────────────────────────────────
function doGlobalSearch(query) {
  query = query.trim().toLowerCase();
  closeSearchDropdown();
  if (query.length < 2) return;

  var pages = [
    { label:'Tableau de Bord',       href:'dashboard.html',     icon:'📊', keywords:['dashboard','tableau','bord','ventes','statistiques'] },
    { label:'Produits',              href:'produits.html',      icon:'📦', keywords:['produit','stock','prix','catalogue','code barre','article'] },
    { label:'Chariots Intelligents', href:'chariots.html',      icon:'🛒', keywords:['chariot','batterie','signal','actif','maintenance','inactif'] },
    { label:'Sessions Actives',      href:'sessions.html',      icon:'〰️', keywords:['session','client','achat','panier','historique','terminee'] },
    { label:'Statistiques',          href:'statistiques.html',  icon:'📈', keywords:['stat','graphique','analyse','rapport','revenus','heures'] },
    { label:'Notifications',         href:'notifications.html', icon:'🔔', keywords:['notification','alerte','message','batterie faible','paiement'] },
    { label:'Paramètres',            href:'parametres.html',    icon:'⚙️', keywords:['parametre','profil','mot de passe','configuration','email'] },
  ];

  var results = pages.filter(function(p) {
    return p.label.toLowerCase().includes(query) ||
           p.keywords.some(function(k) { return k.includes(query); });
  });

  var searchBox = document.querySelector('.search-box');
  if (!searchBox) return;

  var dropdown  = document.createElement('div');
  dropdown.id   = 'searchDropdown';
  dropdown.style.cssText = 'position:absolute;top:calc(100% + 6px);left:0;right:0;background:white;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;overflow:hidden;min-width:260px';

  if (results.length === 0) {
    dropdown.innerHTML = '<div style="padding:14px;font-size:0.82rem;color:#94a3b8;text-align:center">Aucun résultat pour "' + query + '"</div>';
  } else {
    var html = '<div style="padding:8px 12px;font-size:0.72rem;color:#94a3b8;font-weight:600;text-transform:uppercase;border-bottom:1px solid #f1f5f9">Pages trouvées</div>';
    results.forEach(function(r) {
      html += '<div onclick="window.location.href=\'' + r.href + '\'" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background 0.15s" onmouseenter="this.style.background=\'#f8fafc\'" onmouseleave="this.style.background=\'\'">' +
        '<span style="font-size:1.1rem">' + r.icon + '</span>' +
        '<div>' +
          '<div style="font-size:0.85rem;font-weight:600;color:#1e293b">' + r.label + '</div>' +
          '<div style="font-size:0.72rem;color:#94a3b8">' + r.keywords.slice(0,3).join(', ') + '</div>' +
        '</div>' +
      '</div>';
    });
    dropdown.innerHTML = html;
  }

  searchBox.appendChild(dropdown);
}

function closeSearchDropdown() {
  var old = document.getElementById('searchDropdown');
  if (old) old.remove();
}

// ── WebSocket Client ───────────────────────────────────────
var alertesDejaVues = {};

function initWebSocket() {
  var script = document.createElement('script');
  script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
  script.onload = function() {
    var socket = io('http://localhost:5000');

    socket.on('connect', function() {
      console.log('⚡ WebSocket connecté');
      var indicator = document.getElementById('wsIndicator');
      if (indicator) {
        indicator.style.background = '#10b981';
        indicator.title = 'Temps réel actif ✓';
      }
    });

    socket.on('disconnect', function() {
      console.log('❌ WebSocket déconnecté');
      var indicator = document.getElementById('wsIndicator');
      if (indicator) {
        indicator.style.background = '#ef4444';
        indicator.title = 'Temps réel déconnecté';
      }
    });

    socket.on('dashboard:update', function(data) {
      var el1 = document.getElementById('statVentes');
      if (el1) el1.textContent = formatCurrency(data.ventes_jour);
      var el2 = document.getElementById('statChariots');
      if (el2) el2.textContent = data.chariots_actifs;
      var el3 = document.getElementById('statAlertes');
      if (el3) el3.textContent = data.notifs_non_lues;
      var badge = document.querySelector('.notif-badge');
      if (badge) badge.style.display = data.notifs_non_lues > 0 ? 'block' : 'none';
    });

    socket.on('alerte:batterie', function(data) {
      var maintenant     = Date.now();
      var derniereAlerte = alertesDejaVues[data.code];
      if (!derniereAlerte || (maintenant - derniereAlerte) > 600000) {
        alertesDejaVues[data.code] = maintenant;
        showToast(data.message, 'warning');
      }
    });

    socket.on('sessions:update', function(sessions) {
      if (typeof renderTableFromSocket === 'function') {
        renderTableFromSocket(sessions);
      }
    });

    socket.on('chariots:update', function(chariots) {
      if (typeof renderChariotsFromSocket === 'function') {
        renderChariotsFromSocket(chariots);
      }
    });

    window._socket = socket;
  };
  document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('sc_token')) {
    initWebSocket();
  }
});