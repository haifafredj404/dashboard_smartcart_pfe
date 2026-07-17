// models/Chariot.js

const mongoose = require('mongoose');

const chariotSchema = new mongoose.Schema({

  code: {
    type: String,
    required: true,
    unique: true
  },

  statut: {
    type: String,
    default: 'inactif'
  },

  niveau_batterie: {
    type: Number,
    default: 100
  },

  force_signal: {
    type: String,
    default: 'excellent'
  },

  emplacement_actuel: {
    type: String,
    default: 'Entrée'
  },

  firmware_version: {
    type: String,
    default: '1.0.0'
  },

  notes: {
    type: String,
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Chariot',
  chariotSchema
);