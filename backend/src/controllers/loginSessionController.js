/**
 * @module controllers/loginSessionController
 * @description Gestion du renouvellement de session utilisateur.
 *
 * @usedBy routes — endpoint de renouvellement de token
 * @uses jsonwebtoken — génération du nouveau token JWT
 * @uses models/User.js — vérification de l'existence de l'utilisateur
 * @uses process.env.JWT_SECRET — clé de signature du token
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * @description Génère un nouveau token JWT valable 1h pour l'utilisateur authentifié.
 * @usedBy routes — POST /auth/extend-session
 * @returns {200} { message, token } — nouveau JWT signé valable 1h
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const extendSession = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }   // repart à 1h depuis maintenant
    );

    res.status(200).json({
      message: "Session étendue",
      token: newToken
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
