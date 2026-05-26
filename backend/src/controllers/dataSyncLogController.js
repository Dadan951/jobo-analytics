/**
 * @module controllers/dataSyncLogController
 * @description Vérification de la validité de la session utilisateur
 * pour le mécanisme de synchronisation des données.
 *
 * @usedBy routes — endpoint de vérification de session active
 * @uses jsonwebtoken — vérification du token JWT
 * @uses process.env.JWT_SECRET — clé de vérification
 */

import jwt from "jsonwebtoken";

/**
 * @description Vérifie si le token JWT de l'utilisateur est valide et retourne l'état de la session.
 * @usedBy routes — GET /data-sync/status
 * @param {string} req.headers.authorization - Header "Bearer <token>"
 * @returns {200} { syncing: true } si token valide, { syncing: false } sinon
 * @returns {500} { message, error }
 */
export const triggerSync = (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    // Format attendu : "Bearer <token>"
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(200).json({ syncing: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(200).json({ syncing: false });
      }

      return res.status(200).json({ syncing: true });
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
