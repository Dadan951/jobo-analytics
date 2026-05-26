/**
 * @module controllers/contentController
 * @description Gestion des interactions sur les contenus : vues et likes.
 *
 * @usedBy routes/contentRoutes.js — expose les endpoints /contents/*
 * @uses models/Content.js — modèle contenant les méthodes incrementView, addLike, revokeLike
 */

import Content from "../models/Content.js";
import Interaction from "../models/Interaction.js";

/**
 * @description Incrémente le compteur de vues d'un contenu (vidéo uniquement).
 * @usedBy routes/contentRoutes.js — POST /contents/:contentId/view
 * @param {string} req.params.contentId - ID MongoDB du contenu
 * @returns {201} { message, content: { _id, title, type }, interaction }
 * @returns {400} Contenu non de type VIDEO
 * @returns {404} Contenu introuvable
 * @returns {500} { message, error }
 */
export const incrementView = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({
        message: "Contenu introuvable"
      });
    }

    const interaction = await content.incrementView();

    return res.status(201).json({
      message: "Vue ajoutée avec succès",
      content: {
        _id: content._id,
        title: content.title,
        type: content.type
      },
      interaction
    });
  } catch (error) {
    if (error.message === "Seuls les contenus de type VIDEO peuvent enregistrer une vue") {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Ajoute un like d'un utilisateur authentifié sur un contenu.
 * @usedBy routes/contentRoutes.js — POST /contents/:contentId/like
 * @param {string} req.params.contentId - ID MongoDB du contenu
 * @returns {201} { message, content: { _id, title, type }, interaction }
 * @returns {404} Contenu introuvable
 * @returns {500} { message, error }
 */
export const addLike = async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        message: "Contenu introuvable"
      });
    }
    const interaction = await content.addLike(userId);
    return res.status(201).json({
      message: "Like ajouté avec succès",
      content: {
        _id: content._id,
        title: content.title,
        type: content.type
      },
      interaction
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Retourne les statistiques agrégées (vues, likes, saves) de toutes les vidéos.
 * @usedBy routes/contentRoutes.js — GET /contents/video-stats
 * @returns {200} { videos: Array<{ _id, title, views, likes, saves }>, totals: { views, likes, saves }, count }
 * @returns {500} { message, error }
 */
export const getVideoStats = async (req, res) => {
  try {
    const videos = await Content.find({ type: "VIDEO" }).select("_id title jobId");

    // Promise.all parallélise les 3 countDocuments pour chaque vidéo
    const stats = await Promise.all(videos.map(async (video) => {
      const [views, likes, saves] = await Promise.all([
        Interaction.countDocuments({ contentId: video._id, type: "VIEW" }),
        Interaction.countDocuments({ contentId: video._id, type: "LIKE" }),
        Interaction.countDocuments({ contentId: video._id, type: "SAVE" }),
      ]);
      return { _id: video._id, title: video.title, views, likes, saves };
    }));

    const totals = stats.reduce((acc, v) => ({
      views: acc.views + v.views,
      likes: acc.likes + v.likes,
      saves: acc.saves + v.saves,
    }), { views: 0, likes: 0, saves: 0 });

    res.status(200).json({ videos: stats, totals, count: stats.length });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Retire le like d'un utilisateur authentifié sur un contenu.
 * @usedBy routes/contentRoutes.js — DELETE /contents/:contentId/like
 * @param {string} req.params.contentId - ID MongoDB du contenu
 * @returns {200} { message, content: { _id, title, type }, interactionSupprimee }
 * @returns {400} Aucun like à retirer
 * @returns {404} Contenu introuvable
 * @returns {500} { message, error }
 */
export const revokeLike = async (req, res) => {
  try {
    const { contentId } = req.params;
    const userId = req.user.userId;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: "Contenu introuvable" });
    }

    const interaction = await content.revokeLike(userId);

    return res.status(200).json({
      message: "Like retiré avec succès",
      content: {
        _id: content._id,
        title: content.title,
        type: content.type
      },
      interactionSupprimee: interaction
    });

  } catch (error) {
    if (error.message.includes("Aucun like à retirer")) {
      return res.status(400).json({
        message: "Vous n'avez pas de like à retirer sur ce contenu"
      });
    }
    return res.status(500).json({
      message: "Erreur serveur lors de la suppression du like",
      error: error.message
    });
  }
};
