/**
 * @module routes/physicalObjectRoutes
 * @description Définition des routes pour les objets physiques scannables.
 *
 * @usedBy server.js — monté sur /physical-objects
 * @uses controllers/physicalObjectController.js — incrementScanCount, addLike, revokeLike
 * @uses middlewares/authMiddleware.js — authenticateToken (pour unlike)
 *
 * Endpoints :
 * - GET    /                         — Liste tous les objets physiques (paginé)
 * - GET    /summary                  — Statistiques agrégées (scans + likes)
 * - PUT    /:physicalObjectId/scan   → incrementScanCount — Enregistrer un scan
 * - PUT    /:physicalObjectId/like   → addLike            — Ajouter un like
 * - DELETE /:physicalObjectId/like   → revokeLike         — Retirer un like (protégé)
 */

import express from "express";
import { incrementScanCount, addLike, revokeLike } from "../controllers/physicalObjectController.js";
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @description Liste tous les objets physiques avec pagination.
 * @uses models/PhysicalObject.js — find + countDocuments
 */
router.get("/", async (req, res) => {
  try {
    const PhysicalObject = (await import("../models/PhysicalObject.js")).default;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const [objects, total] = await Promise.all([
      PhysicalObject.find().sort({ scanCount: -1 }).skip(skip).limit(limit),
      PhysicalObject.countDocuments()
    ]);
    res.status(200).json({ objects, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Statistiques agrégées de tous les objets physiques (total scans + total likes).
 * @uses models/PhysicalObject.js — find avec select
 */
router.get("/summary", async (req, res) => {
  try {
    const PhysicalObject = (await import("../models/PhysicalObject.js")).default;
    const objects = await PhysicalObject.find().select("name scanCount likes createdAt");
    const totals = objects.reduce((acc, o) => ({
      scans: acc.scans + (o.scanCount || 0),
      likes: acc.likes + (o.likes || 0),
    }), { scans: 0, likes: 0 });
    res.status(200).json({ objects, totals, count: objects.length });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Enregistre un scan sur un objet physique.
 * @uses controllers/physicalObjectController.js — incrementScanCount()
 */
router.put("/:physicalObjectId/scan", incrementScanCount);

/**
 * @description Ajoute un like sur un objet physique.
 * @uses controllers/physicalObjectController.js — addLike()
 */
router.put("/:physicalObjectId/like", addLike);

/**
 * @description Retire un like sur un objet physique (protégé).
 * @uses controllers/physicalObjectController.js — revokeLike()
 */
router.delete("/:physicalObjectId/like", authenticateToken, revokeLike);

export default router;
