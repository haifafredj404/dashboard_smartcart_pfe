const express = require('express');
const router = express.Router();

const Chariot = require('../models/Chariot');
const SessionAchat = require('../models/SessionAchat');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// =====================================
// ROUTE ESP32
// =====================================
router.get('/esp32/current', async (req, res) => {

  try {

    const chariot = await Chariot
      .findOne()
      .sort({ createdAt: -1 });

    if (!chariot) {

      return res.status(404).json({
        success: false,
        message: 'Aucun chariot'
      });

    }

    res.json({
      success: true,
      code: chariot.code
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

// =====================================
// GET ALL CHARIOTS
// =====================================
router.get('/', auth, async (req, res) => {

  try {

    const { statut, search } = req.query;

    let filter = {};

    if (statut && statut !== 'tous') {
      filter.statut = statut;
    }

    if (search) {

      filter.code = {
        $regex: search,
        $options: 'i'
      };

    }

    const chariots = await Chariot
      .find(filter)
      .sort({ code: 1 });

    res.json({
      success: true,
      data: chariots,
      total: chariots.length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

// =====================================
// GET ONE CHARIOT
// =====================================
router.get('/:id', auth, async (req, res) => {

  try {

    if (
      !req.params.id ||
      req.params.id === 'undefined'
    ) {

      return res.status(400).json({
        success: false,
        message: 'ID invalide'
      });

    }

    const chariot =
      await Chariot.findById(req.params.id);

    if (!chariot) {

      return res.status(404).json({
        success: false,
        message: 'Chariot introuvable'
      });

    }

    res.json({
      success: true,
      data: chariot
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

// =====================================
// CREATE CHARIOT
// =====================================
router.post('/', auth, async (req, res) => {

  try {

    const {
      code,
      statut,
      niveau_batterie,
      force_signal,
      emplacement_actuel,
      firmware_version,
      notes
    } = req.body;

    if (!code) {

      return res.status(400).json({
        success: false,
        message: 'Code requis'
      });

    }

    const existing =
      await Chariot.findOne({ code });

    if (existing) {

      return res.status(409).json({
        success: false,
        message: 'Code déjà existant'
      });

    }

    const chariot = new Chariot({
       code,
       statut:
        statut || 'inactif',
       niveau_batterie:
        niveau_batterie || 100,

       force_signal:
        force_signal || 'excellent',

       emplacement_actuel:
        emplacement_actuel || 'Entrée',

       firmware_version:
        firmware_version || '1.0.0',

       notes:
        notes || null
    });

  await chariot.save();

  await Notification.create({
    type: 'ajout',
    titre: 'Nouveau chariot ajouté',
    message: `Le chariot ${chariot.code} a été ajouté au système`,
    chariot_id: chariot._id,
    priorite: 'info',
    lu: false
  });

  res.status(201).json({
    success: true,
    message:
    `Chariot ${code} créé avec succès`,
     data: chariot
  });

  res.status(500).json({
    success: false,
    message: 'Erreur serveur'
  });

  }
  catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

// =====================================
// UPDATE CHARIOT
// =====================================
router.put('/:id', auth, async (req, res) => {

  try {

    const updated =
      await Chariot.findByIdAndUpdate(

        req.params.id,

        req.body,

        { new: true }

      );

    if (!updated) {

      return res.status(404).json({
        success: false,
        message: 'Chariot introuvable'
      });

    }
    await Notification.create({

  type: 'modification',

  titre: 'Chariot modifié',

  message: `Le chariot ${updated.code} a été mis à jour`,

  chariot_id: updated._id,

  priorite: 'info',

  lu: false

});

    res.json({

      success: true,

      message:
        'Chariot mis à jour',

      data: updated

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

// =====================================
// DELETE CHARIOT
// =====================================
router.delete('/:id', auth, async (req, res) => {

  try {

    const deleted = await Chariot.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {

      return res.status(404).json({
        success: false,
        message: 'Chariot introuvable'
      });

    }

    await Notification.create({

      type: 'suppression',

      titre: 'Chariot supprimé',

      message: `Le chariot ${deleted.code} a été supprimé avec succès`,

      chariot_id: deleted._id,

      priorite: 'info',

      lu: false

    });

    res.json({

      success: true,

      message: `Chariot ${deleted.code} supprimé`

    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });

  }

});

module.exports = router;