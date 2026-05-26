/**
 * @module middlewares/errorMiddleware
 * @description Middleware de gestion centralisée des erreurs Express.
 *
 * @usedBy server.js — monté en dernier middleware (après toutes les routes)
 *
 * Codes gérés :
 * - CastError       → 400 Identifiant MongoDB invalide
 * - ValidationError → 400 Données invalides (contraintes Mongoose)
 * - Fallback        → 500 Erreur serveur interne
 */

/**
 * @description Gestionnaire d'erreurs Express (4 paramètres — signature obligatoire pour être reconnu par Express).
 * @usedBy server.js — monté en dernier middleware après toutes les routes
 */
export const errorHandler = (err, req, res, next) => {
  // ID MongoDB mal formé (ex: /jobs/abc au lieu de /jobs/64f...)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide" });
  }

  // Contrainte Mongoose non respectée (required, enum, unique...)
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Erreur serveur interne"
  });
};
