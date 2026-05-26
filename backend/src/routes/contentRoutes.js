/**
 * @module routes/contentRoutes
 * @description Définition des routes pour les interactions sur les contenus.
 *
 * @usedBy server.js — monté sur /contents
 * @uses controllers/contentController.js — incrementView, addLike, revokeLike, getVideoStats
 * @uses middlewares/authMiddleware.js — authenticateToken (pour like/unlike)
 *
 * Endpoints :
 * - GET    /                  — Liste tous les contenus (protégé, paginé)
 * - GET    /stats             — Contenus avec vues/likes/favoris agrégés (protégé)
 * - GET    /video-stats       → getVideoStats — Statistiques vidéo agrégées (protégé)
 * - POST   /import-from-jobo  — Restaure les vidéos Verrerie si absentes (protégé)
 * - POST   /:contentId/view   → incrementView — Ajouter une vue
 * - POST   /:contentId/like   → addLike       — Ajouter un like (protégé)
 * - DELETE /:contentId/like   → revokeLike    — Retirer un like (protégé)
 */

import express from "express";
import { incrementView, addLike, revokeLike, getVideoStats } from "../controllers/contentController.js";
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @description Liste tous les contenus avec pagination (protégé).
 * @uses models/Content.js — find + populate jobId
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const Content = (await import("../models/Content.js")).default;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const [contents, total] = await Promise.all([
      Content.find().populate("jobId", "name").sort({ publishedAt: -1 }).skip(skip).limit(limit),
      Content.countDocuments()
    ]);
    res.status(200).json({ contents, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Retourne les contenus enrichis de leurs vues, likes et favoris agrégés depuis Interaction (protégé).
 * @uses models/Content.js — find + populate
 * @uses models/Interaction.js — aggregate par contentId et type
 */
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const Content     = (await import("../models/Content.js")).default;
    const Interaction = (await import("../models/Interaction.js")).default;

    const [contents, stats] = await Promise.all([
      Content.find().populate("jobId", "name").sort({ publishedAt: -1 }),
      Interaction.aggregate([
        { $match: { contentId: { $ne: null } } },
        { $group: { _id: { contentId: "$contentId", type: "$type" }, count: { $sum: 1 } } },
      ]),
    ]);

    // Construit une map contentId → { views, likes, saves } pour fusion rapide
    const map = {};
    for (const s of stats) {
      const id = s._id.contentId?.toString();
      if (!id) continue;
      if (!map[id]) map[id] = { views: 0, likes: 0, saves: 0 };
      if (s._id.type === "VIEW") map[id].views = s.count;
      if (s._id.type === "LIKE") map[id].likes = s.count;
      if (s._id.type === "SAVE") map[id].saves = s.count;
    }

    const result = contents.map((c) => ({
      ...c.toObject(),
      views: map[c._id.toString()]?.views || 0,
      likes: map[c._id.toString()]?.likes || 0,
      saves: map[c._id.toString()]?.saves || 0,
    }));

    res.status(200).json({ contents: result });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Statistiques agrégées par vidéo (vues, likes, saves).
 * @uses controllers/contentController.js — getVideoStats()
 */
router.get("/video-stats", authenticateToken, getVideoStats);

/**
 * @description Restaure les vidéos Verrerie en base si elles sont absentes (protégé).
 * @uses models/Content.js — findById + create
 * @uses models/Job.js — findOne par joboId
 */
router.post("/import-from-jobo", authenticateToken, async (req, res) => {
  try {
    const Job      = (await import("../models/Job.js")).default;
    const Content  = (await import("../models/Content.js")).default;
    const mongoose = (await import("mongoose")).default;
    const Organization = (await import("../models/Organization.js")).default;

    const VERRERIE_VIDEOS = [
      { _id: "666eb24ca22d6c5acb2bcec8", title: "Conducteur-fondeur en industrie verrière", type: "VIDEO", linkedJoboId: "010" },
    ];

    let org = await Organization.findOne({ name: "Verrerie" });
    if (!org) org = await Organization.create({ name: "Verrerie" });

    let created = 0, skipped = 0;
    for (const v of VERRERIE_VIDEOS) {
      const existing = await Content.findById(v._id);
      if (existing) { skipped++; continue; }
      const job = await Job.findOne({ joboId: v.linkedJoboId });
      if (!job) { skipped++; continue; }
      await Content.create({
        _id: new mongoose.Types.ObjectId(v._id),
        title: v.title,
        type: v.type,
        jobId: job._id,
        orgId: org._id,
      });
      created++;
    }

    res.status(200).json({ message: `Import terminé : ${created} créé(s), ${skipped} déjà présent(s)` });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'import", error: error.message });
  }
});

/**
 * @description Enregistre une vue sur un contenu (vidéo uniquement).
 * @uses controllers/contentController.js — incrementView()
 */
router.post("/:contentId/view", incrementView);

/**
 * @description Ajoute un like sur un contenu (protégé).
 * @uses controllers/contentController.js — addLike()
 */
router.post("/:contentId/like", authenticateToken, addLike);

/**
 * @description Retire un like sur un contenu (protégé).
 * @uses controllers/contentController.js — revokeLike()
 */
router.delete('/:contentId/like', authenticateToken, revokeLike);

export default router;
