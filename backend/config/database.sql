-- ============================================
-- SMART CART SUPERMARKET - Base de Données
-- ============================================

CREATE DATABASE IF NOT EXISTS smartcart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartcart_db;

-- Table Administrateurs
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_complet VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'staff') DEFAULT 'admin',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Chariots Intelligents
CREATE TABLE IF NOT EXISTS chariots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,          -- SC-001, SC-002 ...
  statut ENUM('actif', 'inactif', 'maintenance', 'charge') DEFAULT 'inactif',
  niveau_batterie INT DEFAULT 100,           -- 0-100%
  force_signal ENUM('excellent', 'bon', 'faible', 'aucun') DEFAULT 'excellent',
  emplacement_actuel VARCHAR(100) DEFAULT 'Entrée',
  firmware_version VARCHAR(20) DEFAULT '1.0.0',
  date_mise_en_service DATE DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Clients
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom_complet VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE DEFAULT NULL,
  telephone VARCHAR(20) DEFAULT NULL,
  carte_fidelite VARCHAR(50) UNIQUE DEFAULT NULL,
  total_achats DECIMAL(10,3) DEFAULT 0.000,
  nombre_visites INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table Sessions d'Achat
CREATE TABLE IF NOT EXISTS sessions_achat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chariot_id INT NOT NULL,
  client_id INT DEFAULT NULL,
  statut ENUM('active', 'terminee', 'abandonnee') DEFAULT 'active',
  heure_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  heure_fin TIMESTAMP NULL DEFAULT NULL,
  montant_total DECIMAL(10,3) DEFAULT 0.000,
  nombre_articles INT DEFAULT 0,
  FOREIGN KEY (chariot_id) REFERENCES chariots(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Table Produits
CREATE TABLE IF NOT EXISTS produits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code_barre VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(200) NOT NULL,
  categorie ENUM('epicerie','boissons','boucherie','legumes','produits_laitiers','electronique','hygiene','autre') DEFAULT 'autre',
  prix DECIMAL(10,3) NOT NULL,
  stock INT DEFAULT 0,
  unite VARCHAR(20) DEFAULT 'unité',
  image_url VARCHAR(255) DEFAULT NULL,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table Articles dans Panier (session_items)
CREATE TABLE IF NOT EXISTS panier_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  produit_id INT NOT NULL,
  quantite INT DEFAULT 1,
  prix_unitaire DECIMAL(10,3) NOT NULL,
  prix_total DECIMAL(10,3) NOT NULL,
  scanne_a TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions_achat(id) ON DELETE CASCADE,
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
);

-- Table Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('batterie_faible','nouvelle_session','alerte_systeme','paiement','maintenance') DEFAULT 'alerte_systeme',
  titre VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  chariot_id INT DEFAULT NULL,
  lu BOOLEAN DEFAULT FALSE,
  priorite ENUM('info','warning','critique') DEFAULT 'info',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chariot_id) REFERENCES chariots(id) ON DELETE SET NULL
);

-- Table Ventes (agrégat journalier pour stats rapides)
CREATE TABLE IF NOT EXISTS ventes_journalieres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_vente DATE UNIQUE NOT NULL,
  montant_total DECIMAL(12,3) DEFAULT 0.000,
  nombre_transactions INT DEFAULT 0,
  nombre_chariots_utilises INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================

-- Admin par défaut (mot de passe: admin123)
INSERT INTO admins (nom_complet, email, mot_de_passe, role) VALUES
('Admin User', 'admin@smartcart.tn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Chariots
INSERT INTO chariots (code, statut, niveau_batterie, force_signal, emplacement_actuel) VALUES
('SC-001', 'actif',    19,  'excellent', 'Allée 4'),
('SC-002', 'inactif',  31,  'bon',       'Caisse 2'),
('SC-003', 'actif',    18,  'faible',    'Allée 12'),
('SC-004', 'inactif',  13,  'excellent', 'Entrée'),
('SC-005', 'actif',    87,  'excellent', 'Allée 7'),
('SC-006', 'actif',    10,  'bon',       'Allée 2'),
('SC-007', 'maintenance', 55, 'aucun',   'Atelier'),
('SC-008', 'charge',   45,  'excellent', 'Zone Charge'),
('SC-009', 'actif',    72,  'excellent', 'Allée 1'),
('SC-010', 'inactif',  98,  'excellent', 'Entrée'),
('SC-015', 'actif',    63,  'bon',       'Allée 5'),
('SC-021', 'actif',    41,  'excellent', 'Allée 9'),
('SC-031', 'actif',    55,  'bon',       'Caisse 1'),
('SC-033', 'actif',    29,  'faible',    'Allée 3'),
('SC-042', 'actif',    78,  'excellent', 'Allée 6'),
('SC-045', 'inactif',  90,  'excellent', 'Entrée');

-- Clients
INSERT INTO clients (nom_complet, email, telephone, carte_fidelite, total_achats, nombre_visites) VALUES
('Ahmed Ben Ali',    'ahmed.benali@email.tn',  '+216 71 234 567', 'FL-001090', 1250.500, 23),
('Sonia Mansour',   'sonia.mansour@email.tn', '+216 98 765 432', 'FL-001072', 875.250,  15),
('Karim Dridi',     'karim.dridi@email.tn',   '+216 55 111 222', 'FL-001067', 2100.750, 41),
('Leila Trabelsi',  'leila.trabelsi@email.tn','+216 22 333 444', 'FL-001081', 650.000,  12),
('Mohamed Sassi',   'med.sassi@email.tn',     '+216 50 555 666', 'FL-001086', 3200.900, 67);

-- Produits
INSERT INTO produits (code_barre, nom, categorie, prix, stock, unite) VALUES
('3017620422003', 'Nutella 400g',           'epicerie',         8.500,  150, 'unité'),
('3228857000166', 'Lait Viva 1L',           'produits_laitiers',1.800,  300, 'litre'),
('7622210449283', 'Café Nescafé 200g',      'boissons',         12.900, 80,  'unité'),
('3175680011534', 'Huile Oliva 1L',         'epicerie',         15.500, 200, 'litre'),
('5449000000996', 'Coca-Cola 1.5L',         'boissons',         2.500,  400, 'litre'),
('3560070976324', 'Pain de mie Harry\'s',   'epicerie',         3.200,  120, 'unité'),
('3564700234617', 'Yaourt Nature Activia',  'produits_laitiers',0.900,  250, 'unité'),
('3017620401006', 'Pâtes Barilla 500g',     'epicerie',         2.100,  180, 'unité'),
('8076809513388', 'Riz Uncle Ben\'s 1kg',   'epicerie',         5.800,  160, 'kg'),
('3228021180055', 'Beurre President 250g',  'produits_laitiers',4.200,  90,  'unité'),
('3245390051266', 'Savon Dove 100g',        'hygiene',          3.500,  200, 'unité'),
('8711600877406', 'Shampooing Pantene',     'hygiene',          9.900,  75,  'unité');

-- Sessions actives
INSERT INTO sessions_achat (chariot_id, client_id, statut, heure_debut, montant_total, nombre_articles) VALUES
(1,  1, 'active', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 39.954,  1),
(15, 2, 'active', DATE_SUB(NOW(), INTERVAL 45 MINUTE), 173.643, 15),
(3,  3, 'active', DATE_SUB(NOW(), INTERVAL 61 MINUTE), 108.373, 3),
(4,  4, 'active', DATE_SUB(NOW(), INTERVAL 25 MINUTE), 125.515, 6),
(5,  5, 'active', DATE_SUB(NOW(), INTERVAL 8  MINUTE), 31.142,  2);

-- Notifications
INSERT INTO notifications (type, titre, message, chariot_id, lu, priorite) VALUES
('batterie_faible',  'Batterie Faible',  'Le chariot SC-003 est à 18%',              3,  FALSE, 'warning'),
('batterie_faible',  'Batterie Faible',  'Un client a démarré une session sur SC-031',14, FALSE, 'warning'),
('nouvelle_session', 'Nouvelle Session', 'Le chariot SC-006 est à 10%',              7,  FALSE, 'critique'),
('nouvelle_session', 'Nouvelle Session', 'Un client a démarré une session sur SC-045',16, FALSE, 'info'),
('paiement',         'Paiement Terminé', 'Sonia Mansour — SC-015 — 173.643 TND',    15, TRUE,  'info'),
('batterie_faible',  'Batterie Critique','Le chariot SC-004 est à 13%',              4,  FALSE, 'critique');

-- Ventes des 7 derniers jours
INSERT INTO ventes_journalieres (date_vente, montant_total, nombre_transactions, nombre_chariots_utilises) VALUES
(DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1320.500, 45, 8),
(DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1750.250, 62, 12),
(DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1580.900, 55, 10),
(DATE_SUB(CURDATE(), INTERVAL 3 DAY), 2100.750, 78, 15),
(DATE_SUB(CURDATE(), INTERVAL 2 DAY), 2450.300, 89, 18),
(DATE_SUB(CURDATE(), INTERVAL 1 DAY), 3150.600, 112, 21),
(CURDATE(),                           6488.000, 134, 22);
