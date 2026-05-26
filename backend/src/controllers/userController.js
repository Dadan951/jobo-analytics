/**
 * @module controllers/userController
 * @description Gestion du profil utilisateur : modification du mot de passe, de l'email et du nom.
 *
 * @usedBy routes/authRoutes.js — expose les endpoints /auth/change-password, /auth/update-email, /auth/update-name
 * @uses models/User.js — lecture et mise à jour des données utilisateur
 * @uses models/ActivityLog.js — journalisation des modifications
 * @uses bcrypt — hachage et vérification des mots de passe
 */

import User from "../models/User.js";
import bcrypt from "bcrypt";
import ActivityLog from "../models/ActivityLog.js";

/**
 * @description Modifie le mot de passe après vérification de l'ancien.
 * @usedBy routes/authRoutes.js — PUT /auth/change-password
 * @param {string} req.body.currentPassword - Ancien mot de passe en clair
 * @param {string} req.body.newPassword - Nouveau mot de passe
 * @param {string} req.body.confirmPassword - Confirmation du nouveau mot de passe
 * @returns {200} { message: "Mot de passe modifié avec succès" }
 * @returns {400} Champs manquants, mots de passe non concordants ou identiques
 * @returns {401} Ancien mot de passe incorrect
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "currentPassword, newPassword et confirmPassword sont requis"
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Le nouveau mot de passe et sa confirmation ne correspondent pas"
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "Le nouveau mot de passe doit être différent de l'ancien"
      });
    }

    const userId = req.user.userId;

    // select("+passwordHash") récupère le champ exclu par défaut dans le schéma
    const user = await User.findById(userId).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Ancien mot de passe incorrect"
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    const passwordLog = new ActivityLog({
      actionType: "CHANGE_PASSWORD",
      description: "Mot de passe modifié avec succès",
      userId: user._id
    });

    await passwordLog.save();
    await passwordLog.exportLogEntry();

    res.status(200).json({
      message: "Mot de passe modifié avec succès"
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Met à jour le prénom et/ou le nom de l'utilisateur connecté.
 * @usedBy routes/authRoutes.js — PUT /auth/update-name
 * @param {string} [req.body.firstName] - Prénom (optionnel si lastName fourni)
 * @param {string} [req.body.lastName] - Nom (optionnel si firstName fourni)
 * @returns {200} { message, user: { _id, firstName, lastName } }
 * @returns {400} Au moins un des deux champs est requis
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const updateName = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.userId;

    if (!firstName && !lastName) {
      return res.status(400).json({ message: "firstName ou lastName requis" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName  !== undefined) user.lastName  = lastName.trim();

    await user.save();

    res.status(200).json({
      message: "Nom mis à jour avec succès",
      user: { _id: user._id, firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Met à jour l'email de l'utilisateur connecté après validation et vérification d'unicité.
 * @usedBy routes/authRoutes.js — PUT /auth/update-email
 * @param {string} req.body.newEmail - Nouvel email (normalisé en minuscules)
 * @returns {200} { message, user: { _id, email, role, orgId } }
 * @returns {400} Email manquant, format invalide, identique à l'actuel ou déjà utilisé
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const userId = req.user.userId;

    if (!newEmail) {
      return res.status(400).json({
        message: "Nouvel email requis"
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Format d'email invalide"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({
        message: "Le nouvel email doit être différent de l'ancien"
      });
    }

    // $ne exclut l'utilisateur courant pour autoriser l'email uniquement s'il est vraiment libre
    const existingEmail = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId }
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé"
      });
    }

    user.email = normalizedEmail;
    await user.save();

    const emailLog = new ActivityLog({
      actionType: "UPDATE_EMAIL",
      description: "Adresse email mise à jour avec succès",
      userId: user._id
    });

    await emailLog.save();
    await emailLog.exportLogEntry();

    res.status(200).json({
      message: "Email mis à jour avec succès",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        orgId: user.orgId
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
