// models/PanierItem.js

const mongoose = require('mongoose');

const panierItemSchema = new mongoose.Schema({

  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionAchat'
  },

  produit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  },

  quantite: {
    type: Number,
    default: 1
  },

  prix_total: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'PanierItem',
  panierItemSchema
);