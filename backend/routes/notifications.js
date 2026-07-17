const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// ============================================
// GET /api/notifications
// ============================================
router.get('/', auth, async (req, res) => {

  try {

    const notifications = await Notification
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('chariot_id');

    const nonLues = await Notification.countDocuments({
      lu: false
    });

    const data = notifications.map(notif => ({

      _id: notif._id,

      type: notif.type,

      titre: notif.titre,

      message: notif.message,

      priorite: notif.priorite,

      lu: notif.lu,

      createdAt: notif.createdAt,

      chariot_code:
        notif.chariot_id?.code || null

    }));

    res.json({
      success: true,
      data,
      non_lues: nonLues
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });

  }

});

// ============================================
// PUT /api/notifications/:id/lire
// ============================================
router.put('/:id/lire', auth, async (req, res) => {

  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      {
        lu: true
      }
    );

    res.json({
      success: true,
      message: 'Notification marquée comme lue.'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });

  }

});

// ============================================
// PUT /api/notifications/lire-tout
// ============================================
router.put('/lire-tout', auth, async (req, res) => {

  try {

    await Notification.updateMany(
      {
        lu: false
      },
      {
        lu: true
      }
    );

    res.json({
      success: true,
      message: 'Toutes les notifications marquées comme lues.'
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