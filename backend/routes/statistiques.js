// routes/statistiques.js
const express = require('express');
const router = express.Router();

const Session = require('../models/Session');
const Chariot = require('../models/Chariot');

const auth = require('../middleware/auth');


// =====================================================
// GET /api/statistiques/heures-pointe
// =====================================================
router.get('/heures-pointe', auth, async (req, res) => {

  try {

    const sessions = await Session.find();

    const heures = {};

    sessions.forEach(session => {

      const date = new Date(session.heure_debut);

      const heure = date.getHours();

      heures[heure] = (heures[heure] || 0) + 1;
    });

    const result = Object.keys(heures).map(h => ({
      heure: parseInt(h),
      sessions: heures[h]
    }));

    res.json({
      success: true,
      data: result
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});


// =====================================================
// GET /api/statistiques/revenus-categories
// =====================================================
router.get('/revenus-categories', auth, async (req, res) => {

  try {

    // données démo
    const demoData = [

      {
        categorie: 'epicerie',
        label: 'Épicerie',
        total: 1850,
        pourcentage: 33
      },

      {
        categorie: 'boissons',
        label: 'Boissons',
        total: 980,
        pourcentage: 18
      },

      {
        categorie: 'produits_laitiers',
        label: 'Produits Laitiers',
        total: 760,
        pourcentage: 14
      },

      {
        categorie: 'boucherie',
        label: 'Boucherie',
        total: 650,
        pourcentage: 12
      },

      {
        categorie: 'electronique',
        label: 'Électronique',
        total: 560,
        pourcentage: 10
      },

      {
        categorie: 'hygiene',
        label: 'Hygiène',
        total: 420,
        pourcentage: 8
      },

      {
        categorie: 'legumes',
        label: 'Légumes',
        total: 280,
        pourcentage: 5
      }

    ];

    res.json({
      success: true,
      data: demoData
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});


// =====================================================
// GET /api/statistiques/performance-chariots
// =====================================================
router.get('/performance-chariots', auth, async (req, res) => {

  try {

    const chariots = await Chariot.find();

    const sessions = await Session.find();

    const stats = chariots.map(chariot => {

      const sessionsChariot = sessions.filter(
        s => s.chariot_code === chariot.code
      );

      const nb_sessions = sessionsChariot.length;

      const revenus = sessionsChariot.reduce(
        (total, s) => total + (s.montant_total || 0),
        0
      );

      return {

        code: chariot.code,

        nb_sessions,

        revenus,

        duree_moy: 0
      };
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

module.exports = router;