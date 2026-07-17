const express = require('express');
const router = express.Router();

let cartData = {
  chariot_id: "SC-001",
  produit: "Coca-Cola",
  prix: 2.500,
  poids: 1.2,
  total: 12.800
};

// GET DATA POUR ESP32
router.get('/data', (req, res) => {
  res.json(cartData);
});

// UPDATE DATA
router.post('/update', (req, res) => {

  cartData = req.body;

  res.json({
    success: true,
    message: "Données mises à jour"
  });

});

module.exports = router;