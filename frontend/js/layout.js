// js/layout.js — Injects shared sidebar + topbar into every page

function getPageName() {
  return window.location.pathname.split('/').pop().replace('.html','');
}

function renderSidebar(activePage) {
  const nav = [
    { id:'dashboard',    label:'Tableau de Bord',      icon:'📊', href:'dashboard.html' },
    { id:'produits',     label:'Produits',              icon:'📦', href:'produits.html' },
    { id:'chariots',     label:'Chariots Intelligents', icon:'🛒', href:'chariots.html' },
    { id:'sessions',     label:'Sessions Actives',      icon:'〰️', href:'sessions.html' },
    { id:'statistiques', label:'Statistiques',          icon:'📈', href:'statistiques.html' },
    { id:'notifications',label:'Notifications',         icon:'🔔', href:'notifications.html' },
    { id:'parametres',   label:'Paramètres',            icon:'⚙️', href:'parametres.html' },
  ];

  return '<aside class="sidebar">' +
    '<div class="sidebar-logo">' +
      '<div class="logo-icon">🛒</div>' +
      '<div class="logo-text"><h2>Smart Cart</h2><span>Supermarket · Admin</span></div>' +
    '</div>' +
    '<nav class="sidebar-nav">' +
      nav.map(function(item) {
        return '<a href="' + item.href + '" class="nav-item ' + (activePage === item.id ? 'active' : '') + '">' +
          '<span class="nav-icon">' + item.icon + '</span>' + item.label + '</a>';
      }).join('') +
    '</nav>' +
    '<div class="sidebar-footer">' +
      '<div class="system-status">' +
        '<p>Statut du Système</p>' +
        '<div class="status-indicator"><div class="dot-green"></div>Tous les systèmes sont opérationnels</div>' +
      '</div>' +
      '<button class="btn-logout" onclick="confirmLogout()"><span>🔓</span> Déconnexion</button>' +
    '</div>' +
  '</aside>';
}

function renderTopbar(title) {
  return '<header class="topbar">' +
    '<div class="topbar-left">' +
      '<h1>' + title + '</h1>' +
      '<div class="topbar-date js-today-date"></div>' +
    '</div>' +
    '<div class="topbar-right">' +
      '<div class="search-box" style="position:relative">' +
        '<span class="search-icon">🔍</span>' +
        '<input type="text" placeholder="Rechercher..." id="globalSearchInput" oninput="doGlobalSearch(this.value)" onkeydown="if(event.key===\'Escape\'){this.value=\'\';closeSearchDropdown();}">' +
      '</div>' +
      '<div style="position:relative">' +
        '<button class="notif-btn" id="notifBtn" onclick="toggleNotifDropdown()">🔔' +
          '<span class="notif-badge" style="display:none"></span>' +
        '</button>' +
        '<div class="notif-dropdown" id="notifDropdown">' +
          '<div class="notif-header">' +
            '<span>Notifications</span>' +
            '<span class="notif-count js-notif-count">0 Nouvelles</span>' +
          '</div>' +
          '<div class="notif-list" id="notifList">' +
            '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:0.82rem">Chargement...</div>' +
          '</div>' +
          '<div class="notif-footer" onclick="window.location.href=\'notifications.html\'">Voir toutes les notifications</div>' +
        '</div>' +
      '</div>' +
      '<div class="admin-info">' +
        '<div>' +
          '<div class="admin-name js-admin-name">Admin User</div>' +
          '<div class="admin-role js-admin-role">Responsable du Magasin</div>' +
        '</div>' +
        '<div class="admin-avatar js-admin-avatar">AU</div>' +
      '</div>' +
    '</div>' +
  '</header>' +
  '<div id="wsIndicator" title="Connexion temps réel en attente..." style="position:fixed;bottom:20px;right:20px;width:12px;height:12px;background:#f59e0b;border-radius:50%;z-index:9999;box-shadow:0 0 8px rgba(0,0,0,0.3);transition:background 0.3s;" onclick="showWsStatus()"></div>';
}

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
  var dropdown  = document.createElement('div');
  dropdown.id   = 'searchDropdown';
  dropdown.style.cssText = 'position:absolute;top:calc(100% + 6px);left:0;right:0;background:white;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;overflow:hidden;min-width:240px';

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

function updateDateTime() {
  var now     = new Date();
  var dateStr = now.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  var h = String(now.getHours()).padStart(2,'0');
  var m = String(now.getMinutes()).padStart(2,'0');
  var s = String(now.getSeconds()).padStart(2,'0');
  document.querySelectorAll('.js-today-date').forEach(function(el) {
    el.textContent = dateStr + ' — ' + h + ':' + m + ':' + s;
  });
}

function showWsStatus() {
  var ind = document.getElementById('wsIndicator');
  if (ind && ind.style.background.includes('10b981')) {
    showToast('⚡ Temps réel actif', 'success');
  } else if (ind && ind.style.background.includes('ef4444')) {
    showToast('❌ Temps réel déconnecté', 'error');
  } else {
    showToast('🟡 Connexion en cours...', 'warning');
  }
}

function confirmLogout() {
  document.getElementById('logoutModal').classList.add('show');
}
function cancelLogout() {
  document.getElementById('logoutModal').classList.remove('show');
}
function doLogout() {
  logout();
}

function renderLogoutModal() {
  return '<div class="modal-overlay" id="logoutModal">' +
    '<div class="modal">' +
      '<div class="modal-icon danger">🔓</div>' +
      '<h3>Confirmer la déconnexion</h3>' +
      '<p>Êtes-vous sûr de vouloir vous déconnecter de votre session ?</p>' +
      '<div class="modal-btns">' +
        '<button class="btn btn-danger" onclick="doLogout()">Oui, se déconnecter</button>' +
        '<button class="btn btn-outline" onclick="cancelLogout()">Annuler</button>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function initLayout(pageId, title) {
  checkAuth();
  document.getElementById('sidebar-mount').innerHTML = renderSidebar(pageId);
  document.getElementById('topbar-mount').innerHTML  = renderTopbar(title);
  document.getElementById('logout-mount').innerHTML  = renderLogoutModal();

  updateDateTime();
  setInterval(updateDateTime, 1000);

  initAdminUI();
  loadNotifCount();

  // Fermer dropdown si clic en dehors
  document.addEventListener('click', function(e) {
    var searchBox = document.querySelector('.search-box');
    if (searchBox && !searchBox.contains(e.target)) {
      closeSearchDropdown();
    }
  });
}