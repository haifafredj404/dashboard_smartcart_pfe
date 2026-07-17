// models/SessionAchat.js

const mongoose = require('mongoose');

const sessionAchatSchema = new mongoose.Schema({

  chariot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chariot',
    required: true
  },

  client_nom: {
    type: String,
    default: null
  },
  
  client_email: {
  type: String,
  default: null
},

  statut: {
    type: String,
    default: 'active'
  },

  montant_total: {
    type: Number,
    default: 0
  },

  nombre_articles: {
    type: Number,
    default: 0
  },

  heure_debut: {
    type: Date,
    default: Date.now
  },

  heure_fin: {
    type: Date,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'SessionAchat',
  sessionAchatSchema
);