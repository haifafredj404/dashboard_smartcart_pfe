// routes/produits.js

const express = require('express');
const router = express.Router();

const Produit = require('../models/Produit');
const auth = require('../middleware/auth');


// ─────────────────────────────────────────────
// GET ALL PRODUITS
// ─────────────────────────────────────────────
router.get('/', auth, async (req, res) => {

  try {

    const { categorie, search } = req.query;

    let filter = {
      actif: true
    };

    // Filtre catégorie
    if (categorie && categorie !== 'tous') {
      filter.categorie = categorie;
    }

    // Recherche
    if (search) {

      filter.$or = [

        {
          nom: {
            $regex: search,
            $options: 'i'
          }
        },

        {
          code_barre: {
            $regex: search,
            $options: 'i'
          }
        }
      ];
    }
    console.log(await Produit.countDocuments());
    const produits = await Produit
      .find(filter)
      .sort({ nom: 1 });

    res.json({

      success: true,

      data: produits,

      total: produits.length
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

// ─────────────────────────────────────────────
// CREATE PRODUIT
// ─────────────────────────────────────────────
router.post('/', auth, async (req, res) => {

  try {

    const {
      code_barre,
      nom,
      categorie,
      prix,
      stock,
      unite
    } = req.body;

    if (!code_barre || !nom || !prix) {

      return res.status(400).json({
        success: false,
        message: 'Données incomplètes.'
      });
    }

    // Vérifier si existe
    const existing = await Produit.findOne({
      code_barre
    });

    if (existing) {

      return res.status(409).json({
        success: false,
        message: 'Code barre déjà existant.'
      });
    }

    const produit = new Produit({

      code_barre,

      nom,

      categorie:
        categorie || 'autre',

      prix,

      stock:
        stock || 0,

      unite:
        unite || 'unité',

      actif: true
    });

    await produit.save();

    res.status(201).json({

      success: true,

      message: 'Produit ajouté.',

      data: produit
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

// ─────────────────────────────────────────────
// UPDATE PRODUIT
// ─────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {

  try {

    const updated = await Produit.findByIdAndUpdate(

      req.params.id,

      req.body,

      {
        new: true
      }
    );

    if (!updated) {

      return res.status(404).json({
        success: false,
        message: 'Produit introuvable.'
      });
    }

    res.json({

      success: true,

      message: 'Produit mis à jour.',

      data: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur.'
    });
  }
});

// ─────────────────────────────────────────────
// DELETE PRODUIT (désactivation)
// ─────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {

  try {

    const produit = await Produit.findByIdAndUpdate(

      req.params.id,

      {
        actif: false
      },

      {
        new: true
      }
    );

    if (!produit) {

      return res.status(404).json({
        success: false,
        message: 'Produit introuvable.'
      });
    }

    res.json({

      success: true,

      message: 'Produit désactivé.'
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