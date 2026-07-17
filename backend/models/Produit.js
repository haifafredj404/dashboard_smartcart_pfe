// models/Produit.js

const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({

  code_barre: {
    type: String,
    required: true,
    unique: true
  },

  nom: {
    type: String,
    required: true
  },

  categorie: {
    type: String,
    default: 'autre'
  },

  prix: {
    type: Number,
    required: true
  },

  stock: {
    type: Number,
    default: 0
  },

  unite: {
    type: String,
    default: 'unité'
  },

  actif: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Produit',
  produitSchema
);