const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({

  chariot_code: {
    type: String,
    required: true
  },

  client_nom: {
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

  items: [
    {
      nom: String,
      prix: Number,
      quantite: Number
    }
  ],

  heure_debut: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Session', SessionSchema);