// server.js — Smart Cart Backend avec MongoDB + WebSockets
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// ✅ Connexion MongoDB
const connectDB = require('./config/db');
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }
});

// Rendre io accessible dans les routes
app.set('io', io);

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/chariots', require('./routes/chariots'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/produits', require('./routes/produits'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/statistiques', require('./routes/statistiques'));
app.use('/api/esp32', require('./routes/esp32'));
app.use('/api/sync', require('./routes/sync'));
// ─────────────────────────────────────────────
// WebSocket Events
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Client connecté :', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client déconnecté :', socket.id);
  });
});

// ─────────────────────────────────────────────
// Frontend
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// Page login
app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/pages/login.html')
  );
});

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart Cart API opérationnelle 🚀',
    timestamp: new Date()
  });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🛒 Smart Cart Server running on http://localhost:${PORT}`);
  console.log('⚡ WebSockets activés');
  console.log(`📊 API disponible sur http://localhost:${PORT}/api`);
});