// routes/sessions.js
const express = require('express');
const router = express.Router();

const Session = require('../models/Session');
const Chariot = require('../models/Chariot');
const Produit = require('../models/Produit');

const auth = require('../middleware/auth');


// =====================================================
// GET /api/sessions
// Toutes les sessions
// =====================================================
router.get('/', async (req, res) => {

  try {

    const { statut } = req.query;

    let filter = {};

    if (statut) {
      filter.statut = statut;
    }

    const sessions = await Session.find(filter)
      .sort({ heure_debut: -1 });

    res.json({
      success: true,
      data: sessions
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
// GET /api/sessions/:id
// Détail d'une session
// =====================================================
router.get('/:id', auth, async (req, res) => {

  try {

    const session = await Session.findById(req.params.id);

    if (!session) {

      return res.status(404).json({
        success: false,
        message: 'Session introuvable.'
      });
    }

    res.json({
      success: true,
      data: session
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
// DELETE /api/sessions/:id
// Supprimer session
// =====================================================
router.delete('/:id', auth, async (req, res) => {

  try {

    const session = await Session.findById(req.params.id);

    if (!session) {

      return res.status(404).json({
        success: false,
        message: 'Session introuvable.'
      });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Session supprimée.'
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