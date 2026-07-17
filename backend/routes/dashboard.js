// routes/dashboard.js
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const Chariot = require('../models/Chariot');
const Notification = require('../models/Notification');
const SessionAchat = require('../models/SessionAchat');
const VenteJournaliere = require('../models/VenteJournaliere');
const PanierItem = require('../models/PanierItem');
const Produit = require('../models/Produit');


// ============================================
// GET /api/dashboard
// ============================================
router.get('/', async (req, res) => {

  try {

    // Date aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // =====================================
    // Ventes du jour
    // =====================================

    const ventesJour = await VenteJournaliere
      .findOne()
      .sort({ date_vente: -1 });
    console.log("Vente trouvée :", ventesJour);

    // =====================================
    // Chariots
    // =====================================

    const totalChariots = await Chariot.countDocuments();

    const chariotsActifs = await Chariot.countDocuments({
      statut: 'actif'
    });

    // =====================================
    // Notifications
    // =====================================

    const alertes = await Notification.countDocuments();

    const notifs = await Notification.countDocuments({
      lu: false
    });

    // =====================================
    // Sessions aujourd'hui
    // =====================================

    const sessions = await SessionAchat.find();
    console.log("Sessions trouvées :", sessions.length);
    
    let articlesScannes = 0;

    sessions.forEach(session => {
      articlesScannes += session.nombre_articles || 0;
    });
    console.log("Articles scannés :", articlesScannes);


    // =====================================
    // Réponse
    // =====================================

    res.json({
      success: true,

      data: {

        ventes_quotidiennes:
          ventesJour?.montant_total || 0,

        variation_ventes: 0,

        chariots_actifs:
          chariotsActifs,

        chariots_total:
          totalChariots,

        articles_scannes:
          articlesScannes,

        alertes_systeme:
          alertes,

        notifs_non_lues:
          notifs
      }
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
// GET /api/dashboard/ventes-semaine
// ============================================
router.get('/ventes-semaine', auth, async (req, res) => {

  try {

    let ventes = await VenteJournaliere.find()
      .sort({ date_vente: 1 });

    // Si aucune donnée → données de démonstration
    if (ventes.length === 0) {

      ventes = [
        {
          date_vente: new Date('2026-06-05'),
          montant_total: 120
        },
        {
          date_vente: new Date('2026-06-06'),
          montant_total: 180
        },
        {
          date_vente: new Date('2026-06-07'),
          montant_total: 95
        },
        {
          date_vente: new Date('2026-06-08'),
          montant_total: 250
        },
        {
          date_vente: new Date('2026-06-09'),
          montant_total: 310
        },
        {
          date_vente: new Date('2026-06-10'),
          montant_total: 280
        },
        {
          date_vente: new Date('2026-06-11'),
          montant_total: 420
        }
      ];
    }

    res.json({
      success: true,
      data: ventes
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
// GET /api/dashboard/activite-recente
// ============================================
router.get('/activite-recente', auth, async (req, res) => {

  try {

    const activites = await SessionAchat
      .find()
      .populate('chariot_id')
      .sort({ heure_debut: -1 })
      .limit(10);

    const data = activites.map(item => ({

  client_nom: item.client_nom || 'Client',

  chariot: item.chariot_id?.code || 'N/A',

  statut: item.statut,

  montant_total: item.montant_total || 0,

  nombre_articles: item.nombre_articles || 0,

  heure_debut: item.heure_debut,

  action:
    item.statut === 'active'
      ? 'En cours'
      : 'Payé'
    }));

    res.json({
      success: true,
      data
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
// GET /api/dashboard/distribution-categories
// ============================================
router.get('/distribution-categories', auth, async (req, res) => {

  try {

    const produits = await Produit.find();

    const categories = {};

    produits.forEach(prod => {

      if (!categories[prod.categorie]) {

        categories[prod.categorie] = {
          categorie: prod.categorie,
          total: 0,
          nb_ventes: 0
        };
      }

      categories[prod.categorie].total +=
        prod.prix || 0;

      categories[prod.categorie].nb_ventes += 1;
    });

    res.json({
      success: true,
      data: Object.values(categories)
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