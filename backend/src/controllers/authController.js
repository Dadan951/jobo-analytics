/**
 * @module controllers/authController
 * @description Gestion de l'authentification : inscription, connexion, déconnexion.
 *
 * @usedBy routes/authRoutes.js — expose les endpoints /auth/*
 * @uses models/User.js — création et recherche d'utilisateurs
 * @uses models/Organization.js — vérification de l'organisation lors de l'inscription
 * @uses models/ActivityLog.js — journalisation des connexions et inscriptions
 * @uses bcrypt — hachage et vérification des mots de passe
 * @uses jsonwebtoken — génération des tokens JWT
 */

import User from "../models/User.js";
import Organization from "../models/Organization.js";
import ActivityLog from "../models/ActivityLog.js";
import VerrerieReference from "../models/VerrerieReference.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendTwoFACode, sendPasswordResetCode } from "../utils/mailer.js";

// ── Mots-clés de secours si la collection VerrerieReference est vide ─────────
const FALLBACK_KEYWORDS = [
  'verrerie', 'verreries', 'cristallerie', 'cristalleries',
  'saint-gobain', 'saint gobain', 'verallia', 'sgd pharma', 'sgd',
  'saverglass', 'arc international', 'pochet', 'duralex', 'baccarat',
  'saint-louis', 'brosse', 'owens', 'o-i', 'glass',
  'cristal', 'verre', 'vitrage', 'miroiterie', 'glazing',
];

/**
 * @description Détecte si un nom d'organisme appartient à la filière verrerie.
 * Interroge d'abord la collection VerrerieReference (name + aliases),
 * puis bascule sur la liste de mots-clés de secours.
 * @usedBy controllers/authController.js — register()
 * @param {string} name - Nom de l'organisme à vérifier
 * @returns {Promise<'VERRERIE'|null>} 'VERRERIE' si détecté, null sinon
 */
const detectFiliere = async (name) => {
  const trimmed = name.trim();

  try {
    const match = await VerrerieReference.findOne({
      $or: [
        { name: { $regex: new RegExp(trimmed, 'i') } },
        { aliases: { $elemMatch: { $regex: new RegExp(trimmed, 'i') } } },
      ],
      actif: true,
    });

    if (match) return 'VERRERIE';

    const tokens = trimmed.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    for (const token of tokens) {
      const partial = await VerrerieReference.findOne({
        $or: [
          { name: { $regex: token, $options: 'i' } },
          { aliases: { $elemMatch: { $regex: token, $options: 'i' } } },
        ],
        actif: true,
      });
      if (partial) return 'VERRERIE';
    }
  } catch {
    // En cas d'erreur DB on bascule sur les mots-clés de secours
  }

  // Fallback mots-clés
  const lower = trimmed.toLowerCase();
  return FALLBACK_KEYWORDS.some(k => lower.includes(k)) ? 'VERRERIE' : null;
};

/**
 * @description Crée l'organisation "Verrerie" par défaut si elle n'existe pas encore en base.
 * @usedBy controllers/authController.js — getOrganizations()
 * @returns {Promise<void>}
 */
const ensureDefaultOrganizations = async () => {
  await Organization.findOneAndUpdate(
    { name: 'Verrerie' },
    { $setOnInsert: { name: 'Verrerie', filiere: 'VERRERIE' } },
    { upsert: true, new: true }
  );
};

/**
 * @description Retourne la liste des organisations disponibles à l'inscription.
 * @usedBy routes/authRoutes.js — GET /auth/organizations
 * @returns {200} { organizations: Array<{ _id, name }> }
 * @returns {500} { message, error }
 */
export const getOrganizations = async (req, res) => {
  try {
    await ensureDefaultOrganizations();

    const organizations = await Organization.find()
      .sort({ name: 1 })
      .select("_id name");

    res.status(200).json({ organizations });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Crée un nouveau compte utilisateur après vérification de l'email et de l'organisation.
 * @usedBy routes/authRoutes.js — POST /auth/register
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @param {string} req.body.organizationName - Nom en texte libre, créé automatiquement si inexistant
 * @returns {201} { message, user: { _id, email, role, orgId, orgName, filiere, createdAt } }
 * @returns {400} Champs manquants ou email déjà utilisé
 * @returns {500} { message, error }
 */
export const register = async (req, res) => {
  try {
    // organizationName remplace orgId : l'utilisateur saisit son organisme en texte libre
    const { email, password, organizationName } = req.body;

    if (!email || !password || !organizationName) {
      return res.status(400).json({
        message: "Email, mot de passe et nom de l'organisme sont requis"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Détection automatique de la filière via VerrerieReference + mots-clés de secours
    const filiere = await detectFiliere(organizationName);

    // upsert : crée l'organisation si elle n'existe pas encore
    const organization = await Organization.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${organizationName.trim()}$`, 'i') } },
      { $setOnInsert: { name: organizationName.trim(), filiere } },
      { upsert: true, new: true }
    );

    const hashedPassword = await bcrypt.hash(password, 10);

    // Création sans firstName/lastName — l'utilisateur les renseigne après connexion
    const newUser = new User({
      email,
      passwordHash: hashedPassword,
      orgId: organization._id
    });

    await newUser.save();

    const registerLog = new ActivityLog({
      actionType: "REGISTER",
      description: `Nouvel utilisateur créé : ${newUser.email} (org: ${organization.name}${filiere ? ', filière: ' + filiere : ''})`,
      userId: newUser._id
    });
    await registerLog.save();
    await registerLog.exportLogEntry();

    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      orgId: organization._id,
      orgName: organization.name,
      filiere: organization.filiere,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ message: "Utilisateur créé", user: userResponse });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Authentifie un utilisateur et envoie un code 2FA par email.
 * @usedBy routes/authRoutes.js — POST /auth/login
 * @param {string} req.body.email
 * @param {string} req.body.password
 * @returns {200} { requiresTwoFA: true, userId }
 * @returns {400} Email ou password manquant
 * @returns {401} Identifiants invalides
 * @returns {500} { message, error }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email et password sont requis"
      });
    }

    // select("+passwordHash") récupère le champ exclu par défaut dans le schéma
    const user = await User.findOne({ email })
      .select("+passwordHash")
      .populate("orgId", "name");

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect"
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFACode = code;
    user.twoFACodeExpiry = expiry;
    await user.save();

    await sendTwoFACode(user.email, code);

    res.status(200).json({
      requiresTwoFA: true,
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Vérifie le code 2FA envoyé par email et retourne le token JWT.
 * @usedBy routes/authRoutes.js — POST /auth/verify-2fa
 * @param {string} req.body.userId - ID MongoDB de l'utilisateur
 * @param {string} req.body.code - Code à 6 chiffres reçu par email
 * @returns {200} { message, token, user: { _id, firstName, lastName, email, role, orgId, orgName } }
 * @returns {400} userId ou code manquant
 * @returns {401} Utilisateur introuvable, code incorrect ou expiré
 * @returns {500} { message, error }
 */
export const verifyTwoFA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: "userId et code sont requis" });
    }

    const user = await User.findById(userId)
      .select("+twoFACode +twoFACodeExpiry")
      .populate("orgId", "name");

    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    if (!user.twoFACode || user.twoFACode !== code) {
      return res.status(401).json({ message: "Code incorrect" });
    }

    if (!user.twoFACodeExpiry || user.twoFACodeExpiry < new Date()) {
      return res.status(401).json({ message: "Code expiré" });
    }

    // Invalider le code après utilisation pour qu'il ne puisse pas être réutilisé
    user.twoFACode = undefined;
    user.twoFACodeExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const loginLog = new ActivityLog({
      actionType: "LOGIN",
      description: `Connexion réussie pour ${user.email}`,
      userId: user._id
    });
    await loginLog.save();
    await loginLog.exportLogEntry();

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        orgId: user.orgId?._id ?? user.orgId,
        orgName: user.orgId?.name ?? null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Déconnecte l'utilisateur. La suppression du token est gérée côté frontend.
 * @usedBy routes/authRoutes.js — POST /auth/logout
 * @returns {200} { message: "Déconnexion réussie" }
 * @returns {500} { message, error }
 */
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Envoie un code de réinitialisation de mot de passe par email (valable 10 minutes).
 * @usedBy routes/authRoutes.js — POST /auth/forgot-password
 * @param {string} req.body.email
 * @returns {200} { message } — réponse identique que l'email existe ou non (sécurité)
 * @returns {400} Email manquant
 * @returns {500} Échec d'envoi email ou erreur serveur
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis" });

    // On ne révèle pas si l'email existe ou non (sécurité)
    const user = await User.findOne({ email });
    if (user) {
      const code   = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      user.twoFACode       = code;
      user.twoFACodeExpiry = expiry;
      await user.save();
      try {
        await sendPasswordResetCode(email, code);
        console.log(`[forgotPassword] Code envoyé à ${email}`);
      } catch (mailError) {
        console.error(`[forgotPassword] Échec envoi email à ${email} :`, mailError.message);
        return res.status(500).json({ message: "Impossible d'envoyer l'email. Vérifiez la configuration." });
      }
    } else {
      console.log(`[forgotPassword] Aucun compte trouvé pour : ${email}`);
    }

    res.status(200).json({ message: "Si cet email existe, un code a été envoyé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Vérifie le code de réinitialisation et enregistre le nouveau mot de passe hashé.
 * @usedBy routes/authRoutes.js — POST /auth/reset-password
 * @param {string} req.body.email
 * @param {string} req.body.code - Code à 6 chiffres reçu par email
 * @param {string} req.body.newPassword - Minimum 6 caractères
 * @returns {200} { message: "Mot de passe réinitialisé avec succès" }
 * @returns {400} Champs manquants ou mot de passe trop court
 * @returns {401} Code incorrect ou expiré
 * @returns {500} { message, error }
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code et nouveau mot de passe requis" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    const user = await User.findOne({ email }).select("+twoFACode +twoFACodeExpiry +passwordHash");
    if (!user) return res.status(401).json({ message: "Code invalide ou expiré" });

    if (!user.twoFACode || user.twoFACode !== code) {
      return res.status(401).json({ message: "Code incorrect" });
    }
    if (!user.twoFACodeExpiry || user.twoFACodeExpiry < new Date()) {
      return res.status(401).json({ message: "Code expiré" });
    }

    user.passwordHash    = await bcrypt.hash(newPassword, 10);
    user.twoFACode       = undefined;
    user.twoFACodeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Retourne le profil complet de l'utilisateur connecté.
 * @usedBy routes/authRoutes.js — GET /auth/profile
 * @returns {200} { user: { _id, firstName, lastName, email, role, orgId, orgName } }
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-passwordHash -twoFACode -twoFACodeExpiry")
      .populate("orgId", "name");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.status(200).json({
      user: {
        _id:     user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:   user.email,
        role:    user.role,
        orgId:   user.orgId?._id  ?? user.orgId,
        orgName: user.orgId?.name ?? null,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Détecte la filière d'un organisme en texte libre (endpoint HTTP).
 * @usedBy routes/authRoutes.js — GET /auth/detect-filiere?name=...
 * @returns {200} { filiere: 'VERRERIE' | null }
 */
export const detectFiliereRoute = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(200).json({ filiere: null });
    const filiere = await detectFiliere(name);
    res.status(200).json({ filiere });
  } catch {
    res.status(200).json({ filiere: null });
  }
};
