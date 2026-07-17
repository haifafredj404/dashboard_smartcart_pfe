// models/VenteJournaliere.js

const mongoose = require('mongoose');

const venteJournaliereSchema = new mongoose.Schema({

  date_vente: {
    type: Date,
    default: Date.now
  },

  montant_total: {
    type: Number,
    default: 0
  },

  nombre_transactions: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'VenteJournaliere',
  venteJournaliereSchema
);