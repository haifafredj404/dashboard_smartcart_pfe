// routes/auth.js

const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// Stockage temporaire reset tokens
const resetTokens = {};

// ─────────────────────────────────────────────
// TEST API
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API fonctionne correctement'
  });
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {

  const { email, mot_de_passe } = req.body;

  try {

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects'
      });
    }

    const valid = await bcrypt.compare(
      mot_de_passe,
      admin.mot_de_passe
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect'
      });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '24h'
      }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,

      admin: {
        id: admin._id,
        nom: admin.nom_complet,
        email: admin.email
      }
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {

  const {
    nom_complet,
    email,
    mot_de_passe
  } = req.body;

  try {

    const existing = await Admin.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Cet email existe déjà'
      });
    }

    const hash = await bcrypt.hash(
      mot_de_passe,
      10
    );

    const admin = new Admin({
      nom_complet,
      email,
      mot_de_passe: hash
    });

    await admin.save();

    res.json({
      success: true,
      message: 'Compte créé avec succès'
    });
    console.log("Compte créé");

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {

  try {

    const admin = await Admin.findById(req.admin.id)
      .select('-mot_de_passe');

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin introuvable'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ─────────────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {

  const { email } = req.body;

  try {

    const Admin = await Admin.findOne({ email });

    if (!Admin) {

      return res.json({
        success: true,
        message: 'Si cet email existe, un lien a été envoyé'
      });
    }

    const token = crypto
      .randomBytes(32)
      .toString('hex');

    resetTokens[token] = {
      email,
      expires: Date.now() + 3600000
    };

    const transporter = nodemailer.createTransport({

      service: 'gmail',

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const resetLink =
      `http://localhost:5000/pages/reset-password.html?token=${token}`;

    await transporter.sendMail({

      from: `"Smart Cart" <${process.env.EMAIL_USER}>`,
      to: email,

      subject: 'Réinitialisation du mot de passe',

      html: `
        <h2>Smart Cart</h2>

        <p>Cliquez ci-dessous :</p>

        <a href="${resetLink}">
          Réinitialiser mot de passe
        </a>
      `
    });

    res.json({
      success: true,
      message: 'Email envoyé'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ─────────────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {

  const {
    token,
    mot_de_passe
  } = req.body;

  const entry = resetTokens[token];

  if (!entry || Date.now() > entry.expires) {

    return res.status(400).json({
      success: false,
      message: 'Lien invalide ou expiré'
    });
  }

  try {

    const hash = await bcrypt.hash(
      mot_de_passe,
      10
    );

    await Admin.updateOne(
      { email: entry.email },
      {
        mot_de_passe: hash
      }
    );

    delete resetTokens[token];

    res.json({
      success: true,
      message: 'Mot de passe mis à jour'
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