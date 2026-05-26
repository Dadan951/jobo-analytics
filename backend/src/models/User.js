/**
 * @module models/User
 * @description Modèle Mongoose représentant un utilisateur de la plateforme Jobo Analytics.
 * Stocke les informations d'authentification, le rôle, l'organisation, l'abonnement Stripe
 * et les données liées à la 2FA et aux magic links.
 *
 * @usedBy controllers/authController.js — inscription, connexion, 2FA, réinitialisation de mot de passe
 * @usedBy controllers/adminController.js — gestion des comptes utilisateurs
 * @usedBy controllers/userController.js — modification email, nom, mot de passe
 * @usedBy controllers/subscriptionController.js — mise à jour du plan et du statut d'abonnement
 * @usedBy middlewares/adminMiddleware.js — vérification du rôle ADMIN
 */

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String,
        trim: true,
        default: null },

    lastName: { type: String,
        trim: true,
        default: null },

    email: { type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true },


    passwordHash: {
        type: String,
        required: true,
        select: false
    },

    role: { type: String, 
        enum: ["ADMIN", "USER"], 
        required: true, 
        default : "USER"},

    orgId: { type: mongoose.Schema.Types.ObjectId, 
        ref: "Organization", //référence à la filière de l'utilisateur
        required: true }, 

    is2FAEnabled: { type: Boolean,
        default: false },

    twoFACode: { type: String, select: false },
    twoFACodeExpiry: { type: Date, select: false },

    magicLinkToken: { type: String, select: false },
    magicLinkExpiry: { type: Date, select: false },

    subscriptionStatus: { type: String,
        enum: ["ACTIVE", "CANCELLED", "NONE"],
        default: "NONE" },

    subscriptionPlan: { type: String,
        enum: ["FREE", "TPE", "PME", "GRAND_GROUPE", "ORGANISATION_PATRONALE", "PRO", "ENTERPRISE"],
        default: "FREE" },

    stripeCustomerId: { type: String, default: null, select: false },
    stripeSubscriptionId: { type: String, default: null, select: false },
  },

// Ajoute automatiquement createdAt et updatedAt
  { timestamps: true }
);

// Le champ email possède déjà unique: true dans le schéma.
// index pour rechercher par organiation
userSchema.index({ orgId: 1 });
// index pour rechercher par organiation et par rôle
userSchema.index({ orgId: 1, role: 1 });

export default mongoose.model("User", userSchema);