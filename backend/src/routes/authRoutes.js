/**
 * @module routes/authRoutes
 * @description Routes d'authentification et de gestion du profil utilisateur.
 *
 * @usedBy server.js — monté sur /auth
 *
 * Endpoints publics (sans JWT) :
 * - POST /login            → login              — Étape 1 : identifiants → envoi du code 2FA
 * - POST /verify-2fa       → verifyTwoFA        — Étape 2 : validation du code 2FA → JWT
 * - POST /register         → register           — Inscription d'un nouvel utilisateur
 * - POST /logout           → logout             — Déconnexion (suppression du token côté client)
 * - GET  /organizations    → getOrganizations   — Liste des organisations disponibles
 * - POST /forgot-password  → forgotPassword     — Envoi d'un code de réinitialisation par email
 * - POST /reset-password   → resetPassword      — Réinitialisation du mot de passe via le code
 * - GET  /detect-filiere   → detectFiliereRoute — Détection automatique de la filière verrerie
 *
 * Endpoints protégés (JWT requis) :
 * - GET  /profile          → getProfile         — Profil de l'utilisateur connecté
 * - PUT  /change-password  → changePassword     — Modification du mot de passe
 * - PUT  /update-email     → updateEmail        — Modification de l'adresse email
 * - PUT  /update-name      → updateName         — Modification du prénom / nom
 */

import express from "express";
import {
  login,
  register,
  logout,
  getOrganizations,
  verifyTwoFA,
  forgotPassword,
  resetPassword,
  getProfile,
  detectFiliereRoute,
} from "../controllers/authController.js";
import { changePassword, updateEmail, updateName } from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Routes publiques ──────────────────────────────────────────────────────────

/** Étape 1 de connexion : vérification identifiants → envoi du code 2FA par email */
router.post("/login", login);

/** Étape 2 de connexion : validation du code 2FA → retourne le JWT */
router.post("/verify-2fa", verifyTwoFA);

/** Inscription d'un nouvel utilisateur */
router.post("/register", register);

/** Déconnexion (invalidation côté client — le JWT est supprimé par le frontend) */
router.post("/logout", logout);

/** Liste des organisations disponibles pour l'inscription */
router.get("/organizations", getOrganizations);

/** Envoi d'un code de réinitialisation de mot de passe par email */
router.post("/forgot-password", forgotPassword);

/** Réinitialisation du mot de passe avec le code reçu par email */
router.post("/reset-password", resetPassword);

/** Détection automatique de la filière verrerie à partir du nom de l'organisme */
router.get("/detect-filiere", detectFiliereRoute);

// ── Routes protégées (JWT obligatoire) ───────────────────────────────────────

/** Profil complet de l'utilisateur connecté */
router.get("/profile", authenticateToken, getProfile);

/** Modification du mot de passe (nécessite l'ancien mot de passe) */
router.put("/change-password", authenticateToken, changePassword);

/** Modification de l'adresse email */
router.put("/update-email", authenticateToken, updateEmail);

/** Modification du prénom et/ou nom */
router.put("/update-name", authenticateToken, updateName);

export default router;
