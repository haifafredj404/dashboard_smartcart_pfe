// models/Admin.js

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  nom_complet: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  mot_de_passe: {
    type: String,
    required: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);