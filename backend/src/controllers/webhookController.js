/**
 * @module controllers/webhookController
 * @description Réception des événements analytiques envoyés par l'app Jobo mobile via webhook.
 *
 * @usedBy routes/webhookRoutes.js — expose le endpoint POST /webhook/event
 * @uses models/Job.js — incrémentation des compteurs vues/likes/candidatures
 * @uses models/Interaction.js — enregistrement des interactions vidéo et objets
 */

import Job from "../models/Job.js";
import Content from "../models/Content.js";
import Interaction from "../models/Interaction.js";

// Accepte les deux noms de variable d'environnement + fallback hardcodé
const VALID_API_KEY =
  process.env.JOBO_WEBHOOK_API_KEY ||
  process.env.ANALYTICS_API_KEY ||
  "jobo_mobile_webhook_key_2024";

/**
 * @description Trouve un métier par joboId (ex: "004") ou par _id MongoDB en fallback.
 * @usedBy controllers/webhookController.js — handleAnalyticsEvent()
 * @param {string} entityId - joboId ("004") ou ObjectId MongoDB
 * @returns {Promise<Job|null>} La fiche métier trouvée ou null
 */
const findJob = async (entityId) => {
  if (!entityId) return null;
  // D'abord par joboId (IDs de l'app : "004", "010"...)
  const byJoboId = await Job.findOne({ joboId: entityId });
  if (byJoboId) return byJoboId;
  // Fallback : ObjectId MongoDB valide
  if (/^[a-f\d]{24}$/i.test(entityId)) return Job.findById(entityId);
  return null;
};

/**
 * @description Reçoit un événement Jobo (vue, like, candidature, vidéo, scan) et met à jour les compteurs ou interactions.
 * @usedBy routes/webhookRoutes.js — POST /webhook/event
 * @param {string} req.headers['x-api-key'] - Clé API pour authentification
 * @param {string} req.body.eventType - "JOB_VIEW" | "JOB_LIKE" | "JOB_APPLY" | "VIDEO_VIEW" | "VIDEO_LIKE" | "VIDEO_SAVE" | "VIDEO_UNLIKE" | "VIDEO_UNSAVE" | "OBJECT_SCAN" | "OBJECT_LIKE"
 * @param {string} req.body.entityId - joboId ou ObjectId MongoDB de l'entité ciblée
 * @param {string} [req.body.userId] - ID utilisateur (optionnel, pour anti-doublon)
 * @returns {200} { message: "Event recorded" }
 * @returns {400} eventType ou entityId manquant
 * @returns {401} Clé API invalide
 * @returns {404} Entité introuvable
 * @returns {500} { message, error }
 */
export const handleAnalyticsEvent = async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey !== VALID_API_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { eventType, entityId, userId } = req.body;

  if (!eventType || !entityId) {
    return res.status(400).json({ message: "eventType and entityId are required" });
  }

  try {
    switch (eventType) {
      case "JOB_VIEW": {
        const job = await findJob(entityId);
        if (!job) return res.status(404).json({ message: "Métier introuvable" });
        await Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } });
        break;
      }

      case "JOB_LIKE": {
        const job = await findJob(entityId);
        if (!job) return res.status(404).json({ message: "Métier introuvable" });
        // Anti-doublon si userId fourni
        if (userId) {
          const exists = await Interaction.findOne({ contentId: job._id, userId, type: "LIKE" });
          if (exists) return res.status(200).json({ message: "Déjà liké" });
          await Interaction.create({ contentId: job._id, userId, type: "LIKE" });
        }
        await Job.findByIdAndUpdate(job._id, { $inc: { likes: 1 } });
        break;
      }

      case "JOB_APPLY": {
        const job = await findJob(entityId);
        if (!job) return res.status(404).json({ message: "Métier introuvable" });
        await Job.findByIdAndUpdate(job._id, { $inc: { applicants: 1 } });
        break;
      }

      case "VIDEO_VIEW":
      case "VIDEO_LIKE":
      case "VIDEO_SAVE": {
        const typeMap = { VIDEO_VIEW: "VIEW", VIDEO_LIKE: "LIKE", VIDEO_SAVE: "SAVE" };
        const interactionType = typeMap[eventType];
        const exists = await Interaction.findOne({ contentId: entityId, userId, type: interactionType });
        if (!exists) {
          await Interaction.create({ contentId: entityId, userId, type: interactionType });
        }
        break;
      }

      case "VIDEO_UNLIKE":
      case "VIDEO_UNSAVE": {
        const typeMap = { VIDEO_UNLIKE: "LIKE", VIDEO_UNSAVE: "SAVE" };
        await Interaction.findOneAndDelete({ contentId: entityId, userId, type: typeMap[eventType] });
        break;
      }

      case "OBJECT_SCAN":
      case "OBJECT_LIKE": {
        const type = eventType === "OBJECT_SCAN" ? "VIEW" : "LIKE";
        const exists = await Interaction.findOne({ contentId: entityId, userId, type });
        if (!exists) {
          await Interaction.create({ contentId: entityId, userId, type });
        }
        break;
      }

      default:
        break;
    }

    res.status(200).json({ message: "Event recorded" });
  } catch (err) {
    res.status(500).json({ message: "Internal error", error: err.message });
  }
};
