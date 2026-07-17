// models/Notification.js

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({

  type: {
    type: String,
    default: 'info'
  },

  titre: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  chariot_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chariot',
    default: null
  },

  priorite: {
    type: String,
    default: 'info'
  },

  lu: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
});

module.exports = mongoose.model(
  'Notification',
  notificationSchema
);