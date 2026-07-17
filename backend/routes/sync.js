const express = require('express');
const router = express.Router();
const axios = require('axios');
const SessionAchat = require('../models/SessionAchat');
const Panier = require('../models/Panier');
const Chariot = require('../models/Chariot');
const Produit = require('../models/Produit');
const VenteJournaliere = require('../models/VenteJournaliere');
router.post('/panier', async (req, res) => {

  try {

    const {
      client_email,
      chariot_code,
      produit,
      prix,
      quantite,
      total
    } = req.body;

    // =====================
    // Chercher le chariot
    // =====================

    let chariot = await Chariot.findOne({
      code: chariot_code
    });
    console.log(req.body);
    console.log("chariot_code =", chariot_code);

    // si absent => création
    if (!chariot) {

      chariot = await Chariot.create({

        code: chariot_code,

        statut: 'actif',

        niveau_batterie: 100

      });

    }

    // =====================
    // Ajouter dans Panier
    // =====================

    await Panier.create({

      chariot_id: chariot._id.toString(),

      produit,

      prix,

      poids: 0,

      total

    });
    let produitExiste = await Produit.findOne({
  nom: produit
});

if (!produitExiste) {

  await Produit.create({

    code_barre:
      Date.now().toString(),

    nom: produit,

    categorie: 'Divers',

    prix: prix,

    stock: 999,

    unite: 'unité',

    actif: true

  });

}

    // =====================
    // Ajouter Session Achat
    // =====================

    let session = await SessionAchat.findOne({

  client_email: client_email,

  chariot_id: chariot._id,

  statut: 'active'

});

if (!session) {

  session = await SessionAchat.create({

    chariot_id: chariot._id,

    client_email,

    client_nom: client_email,

    montant_total: total,

    nombre_articles: quantite,

    statut: 'active'

  });

}
else {

  session.montant_total += total;

  session.nombre_articles += quantite;

  await session.save();


  // =====================
// Mise à jour ventes
// =====================

const aujourdHui = new Date();
aujourdHui.setHours(0, 0, 0, 0);

let venteJour = await VenteJournaliere.findOne({
  date_vente: { $gte: aujourdHui }
});

if (!venteJour) {

  venteJour = await VenteJournaliere.create({
    date_vente: aujourdHui,
    montant_total: total,
    nombre_transactions: 1
  });

}
else {

  venteJour.montant_total += total;
  venteJour.nombre_transactions += 1;

  await venteJour.save();

}

}

    await axios.post(
  'http://localhost:5000/api/esp32/update',
  {
    chariot_id: chariot_code,
    produit: produit,
    prix: prix,
    poids: 0,
    total: total
  }
  );

    res.json({
      success: true
    });

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

module.exports = router;