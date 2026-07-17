const mongoose = require('mongoose')

const panierSchema = new mongoose.Schema({

  chariot_id: String,

  produit: String,

  prix: Number,

  poids: Number,

  total: Number,

  created_at: {
    type: Date,
    default: Date.now
  }

})

module.exports =
mongoose.model(
  'Panier',
  panierSchema
)