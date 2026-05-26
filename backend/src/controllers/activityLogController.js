import ActivityLog from "../models/ActivityLog.js";

/**
 * @module controllers/activityLogController
 * @description Gestion des entrées du journal d'activité de l'application.
 * Permet de créer et d'exporter des logs retraçant les actions utilisateurs.
 *
 * @usedBy routes/activityLogRoutes.js — expose l'endpoint POST /activity-logs
 * @uses models/ActivityLog.js — modèle Mongoose pour la persistance des logs
 */

/**
 * @description Crée une entrée de journal d'activité et l'exporte dans le fichier de log.
 * @usedBy routes/activityLogRoutes.js — POST /activity-logs
 * @param {string} req.body.actionType - Type d'action (enum : REGISTER, LOGIN, LOGOUT, etc.)
 * @param {string} req.body.description - Description de l'action
 * @param {string} [req.body.userId] - ID MongoDB de l'utilisateur (optionnel)
 * @param {Date}   [req.body.actionDate] - Date de l'action (Date.now() par défaut)
 * @returns {201} { message, logEntry }
 * @returns {400} Champs obligatoires manquants ou données invalides (ValidationError)
 * @returns {500} { message, error }
 */
export const createLogEntry = async (req, res) => {
  try {
    const { actionType, description, userId, actionDate } = req.body;

    // Vérification des champs obligatoires
    if (!actionType || !description) {
      return res.status(400).json({
        message: "Les champs actionType et description sont obligatoires."
      });
    }

    const logEntry = new ActivityLog({
      actionType,
      description,
      userId: userId || undefined,
      actionDate: actionDate || new Date()
    });

    await logEntry.save();
    await logEntry.exportLogEntry();

    return res.status(201).json({
      message: "Entrée de log créée et exportée avec succès.",
      logEntry
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Données invalides pour la création du log.",
        error: error.message
      });
    }

    return res.status(500).json({
      message: "Erreur serveur lors de la création de l'entrée de log.",
      error: error.message
    });
  }
};
