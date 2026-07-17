# 🛒 Smart Cart Supermarket — Dashboard Administrateur
**PFE — Système de Chariots Intelligents**

---

## 📁 Structure du Projet

```
smartcart/
├── backend/
│   ├── config/
│   │   ├── db.js           → Connexion MySQL
│   │   └── database.sql    → Schéma + données démo
│   ├── middleware/
│   │   └── auth.js         → Authentification JWT
│   ├── routes/
│   │   ├── auth.js         → POST /api/auth/login
│   │   ├── dashboard.js    → GET  /api/dashboard/stats
│   │   ├── chariots.js     → CRUD /api/chariots
│   │   ├── sessions.js     → GET  /api/sessions
│   │   ├── produits.js     → CRUD /api/produits
│   │   ├── notifications.js→ GET  /api/notifications
│   │   └── statistiques.js → GET  /api/statistiques
│   ├── .env                → Variables d'environnement
│   ├── package.json
│   └── server.js           → Point d'entrée Express
│
└── frontend/
    ├── css/
    │   └── style.css       → Styles globaux
    ├── js/
    │   ├── api.js          → Helper API + utils
    │   └── layout.js       → Sidebar + topbar partagés
    └── pages/
        ├── login.html          → Page connexion
        ├── dashboard.html      → Tableau de bord
        ├── chariots.html       → Gestion chariots
        ├── sessions.html       → Sessions actives
        ├── statistiques.html   → Graphiques
        ├── produits.html       → Catalogue produits
        ├── notifications.html  → Historique alertes
        └── parametres.html     → Configuration
```

---

## ⚙️ Installation

### 1. Prérequis
- Node.js 18+
- MySQL 8.0+
- npm

### 2. Base de Données MySQL

Ouvrez MySQL et exécutez :
```sql
-- Dans MySQL Workbench ou CLI
source /chemin/vers/smartcart/backend/config/database.sql
```

Ou via la CLI :
```bash
mysql -u root -p < backend/config/database.sql
```

### 3. Backend

```bash
cd backend
npm install
```

Configurez `.env` si nécessaire :
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=smartcart_db
JWT_SECRET=smartcart_secret_key_2026
```

Démarrez le serveur :
```bash
npm run dev    # Mode développement (nodemon)
# ou
npm start      # Mode production
```

Le serveur sera disponible sur : http://localhost:5000

### 4. Frontend

Le frontend est servi directement par Express (fichiers statiques).
Ouvrez votre navigateur sur : **http://localhost:5000**

---

## 🔑 Accès Démo

| Champ        | Valeur                  |
|-------------|-------------------------|
| Email        | admin@smartcart.tn      |
| Mot de passe | admin123                |

---

## 📡 API Endpoints

### Authentification
| Méthode | Route             | Description         |
|---------|-------------------|---------------------|
| POST    | /api/auth/login   | Connexion admin     |
| GET     | /api/auth/me      | Profil connecté     |

### Dashboard
| Méthode | Route                              | Description             |
|---------|------------------------------------|-------------------------|
| GET     | /api/dashboard/stats               | KPIs principaux         |
| GET     | /api/dashboard/ventes-semaine      | Évolution 7 jours       |
| GET     | /api/dashboard/activite-recente    | Dernières actions       |
| GET     | /api/dashboard/distribution-categories | Répartition ventes |

### Chariots
| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| GET     | /api/chariots      | Liste tous les chariots|
| GET     | /api/chariots/:id  | Détail + sessions     |
| POST    | /api/chariots      | Ajouter               |
| PUT     | /api/chariots/:id  | Modifier              |
| DELETE  | /api/chariots/:id  | Supprimer             |

### Sessions
| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| GET     | /api/sessions      | Liste sessions        |
| GET     | /api/sessions/:id  | Détail + panier       |

### Produits
| Méthode | Route              | Description           |
|---------|--------------------|-----------------------|
| GET     | /api/produits      | Liste produits        |
| POST    | /api/produits      | Ajouter               |
| PUT     | /api/produits/:id  | Modifier              |
| DELETE  | /api/produits/:id  | Désactiver            |

### Notifications
| Méthode | Route                          | Description         |
|---------|--------------------------------|---------------------|
| GET     | /api/notifications             | Toutes              |
| PUT     | /api/notifications/:id/lire    | Marquer lue         |
| PUT     | /api/notifications/lire-tout   | Tout marquer lu     |

### Statistiques
| Méthode | Route                                  | Description            |
|---------|----------------------------------------|------------------------|
| GET     | /api/statistiques/heures-pointe        | Trafic par heure       |
| GET     | /api/statistiques/revenus-categories   | Revenus par catégorie  |
| GET     | /api/statistiques/performance-chariots | Performance chariots   |

---

## 🎨 Design

- **Palette** : Bleu Marine `#1e3a8a` + Blanc + Gris clair
- **Police** : Plus Jakarta Sans (Google Fonts)
- **Composants** : CSS pur (sans framework)
- **Graphiques** : Chart.js 4.4
- **Auth** : JWT (8h d'expiration)

---

## 📋 Pages Disponibles

| Page            | Description                                |
|-----------------|--------------------------------------------|
| Login           | Authentification sécurisée JWT             |
| Tableau de Bord | KPIs + graphiques + activité récente       |
| Chariots        | Grille avec batterie, statut, emplacement  |
| Sessions        | Liste temps réel des clients actifs        |
| Statistiques    | Heures de pointe + revenus catégories      |
| Produits        | Catalogue CRUD avec filtres               |
| Notifications   | Historique + actions                      |
| Paramètres      | Config profil + système                   |

---

*© 2026 Projet d'Ingénierie Smart Cart — PFE*
