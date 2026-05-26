/**
 * @module middlewares/authMiddleware
 * @description Middleware d'authentification par jeton JSON Web Token (JWT).
 * * @objective Vérifier l'identité de l'utilisateur via son token avant d'autoriser 
 * l'accès aux routes protégées de l'API.
 *
 * @usedBy Presque toutes les routes protégées (auth, jobs, tickets, admin).
 * @uses jsonwebtoken — pour la vérification et le décodage du token.
 */

import jwt from "jsonwebtoken";

/**
 * @description Intercepte la requête, extrait le token JWT du header 'Authorization', 
 * le valide et injecte les données de l'utilisateur dans l'objet 'req'.
 * * @param {Object} req - Requête HTTP (doit contenir le header Authorization: Bearer <token>)
 * @param {Object} res - Réponse HTTP
 * @param {Function} next - Passage au middleware ou contrôleur suivant
 * @returns {void} Erreur 401 (Non autorisé) ou 403 (Interdit) | sinon next()
 */
export const authenticateToken = (req, res, next) => {
  // Récupération du header 'Authorization'
  const authHeader = req.headers['authorization'];
  
  // Format attendu : "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  // Si aucun token n'est présent dans la requête
  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  // Vérification de la signature du token avec la clé secrète du .env
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Le token est présent mais invalide (expiré ou modifié)
      return res.status(403).json({ message: "Session expirée ou token invalide" });
    }

    /**
     * @property {Object} req.user - Stockage des infos décodées du token
     * Contient généralement : userId, role, orgId
     */
    req.user = user;
    
    // Le jeton est valide, on autorise la requête à continuer
    next();
  });
};