/**
 * @module middlewares/adminMiddleware
 * @description Middleware de restriction d'accès aux routes réservées aux administrateurs.
 *
 * @usedBy routes/adminRoutes.js — appliqué sur tous les endpoints /admin/*
 * @uses models/User.js — vérification du rôle en base de données
 */

import User from "../models/User.js";

/**
 * @description Vérifie que l'utilisateur authentifié possède le rôle ADMIN. 
 * Ce middleware doit impérativement être appelé après authenticateToken.
 * * @param {Object} req - Requête HTTP (doit contenir req.user.userId injecté par authMiddleware)
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Passage au middleware suivant si l'utilisateur est ADMIN
 * @returns {void} Retourne une erreur 403 si l'accès est refusé, sinon appelle next()
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // On récupère uniquement le champ 'role' pour optimiser la requête
    const user = await User.findById(req.user.userId).select("role");

    // Vérification de l'existence et du grade de l'utilisateur
    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({ 
        message: "Acces reserve aux administrateurs" 
      });
    }

    // Autorisation accordée, passage à la suite
    next();
  } catch (error) {
    // Gestion des erreurs serveur (ex: problème de connexion à MongoDB)
    res.status(500).json({ 
      message: "Erreur serveur lors de la vérification des droits", 
      error: error.message 
    });
  }
};