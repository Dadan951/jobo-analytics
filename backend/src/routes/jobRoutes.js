/**
 * @module routes/jobRoutes
 * @description Définition des routes pour la gestion des fiches métier.
 *
 * @usedBy server.js — monté sur /jobs
 * @uses controllers/jobController.js — updateJobDetails, getJobStatistics, incrementView,
 * addLike, addApplicant, revokeLike
 * @uses middlewares/authMiddleware.js — authenticateToken (pour like/unlike)
 *
 * Endpoints :
 * - GET    /                      — Liste toutes les fiches métier (paginé)
 * - GET    /summary               — Statistiques agrégées de toutes les fiches (protégé)
 * - GET    /:jobId/statistics     → getJobStatistics — Stats d'une fiche
 * - PUT    /:jobId/details        → updateJobDetails — Mettre à jour une fiche
 * - POST   /:jobId/view           → incrementView    — Ajouter une vue
 * - POST   /:jobId/like           → addLike          — Ajouter un like (protégé)
 * - PUT    /:jobId/apply          → addApplicant     — Ajouter une candidature
 * - DELETE /:jobId/like           → revokeLike       — Retirer un like (protégé)
 * - POST   /                      — Créer une fiche métier (protégé)
 * - DELETE /:jobId                — Supprimer une fiche métier (protégé)
 * - POST   /clean-and-reimport    — Synchro Verrerie : supprime + réimporte (protégé)
 */

import express from "express";
import { updateJobDetails, getJobStatistics, incrementView, addLike, addApplicant, revokeLike } from "../controllers/jobController.js";
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ─── Données Verrerie issues de l'app Jobo mobile ────────────────────────────

// Métiers Verrerie (jobOffers.json, categoryId: "Verrerie")
const VERRERIE_JOBS_FROM_APP = [
  {
    joboId: "004",
    name: "Technicien verrier",
    romeCode: "B1602",
    description: "Contribue à la production de pièces verrières haut de gamme, en assurant qualité et précision dans un cadre artisanal.",
    studyLevel: "CAP/BEP en arts du verre et du cristal ou expérience équivalente.",
  },
  {
    joboId: "006",
    name: "Tailleur de cristal",
    romeCode: "B1602",
    description: "Crée des objets en cristal taillés à la main, souvent pour des pièces d'exception.",
    studyLevel: "CAP/BEP en arts verriers ou expérience artisanale.",
  },
  {
    joboId: "010",
    name: "Conducteur-fondeur en industrie verrière",
    romeCode: "H2804",
    description: "Supervise la fusion du verre et conduit les installations de production pour fabriquer des produits verriers de haute qualité.",
    studyLevel: "CAP/BEP en verrerie ou expérience équivalente.",
  },
];

// Vidéos Verrerie — _id = ObjectId utilisé par l'app Jobo dans les événements videoLike
const VERRERIE_VIDEOS = [
  {
    _id: "666eb24ca22d6c5acb2bcec8",
    title: "Conducteur-fondeur en industrie verrière",
    type: "VIDEO",
    linkedJoboId: "010",
  },
];

// ─── Helpers d'import ────────────────────────────────────────────────────────

const getOrCreateVerrerieOrg = async () => {
  const Organization = (await import("../models/Organization.js")).default;
  let org = await Organization.findOne({ name: "Verrerie" });
  if (!org) org = await Organization.create({ name: "Verrerie" });
  return org;
};

const runImportJobs = async () => {
  const Job = (await import("../models/Job.js")).default;
  let created = 0, skipped = 0;
  for (const j of VERRERIE_JOBS_FROM_APP) {
    const existing = await Job.findOne({ joboId: j.joboId });
    if (existing) { skipped++; continue; }
    await Job.create(j);
    created++;
  }
  return { created, skipped };
};

const runImportVideos = async () => {
  const Job      = (await import("../models/Job.js")).default;
  const Content  = (await import("../models/Content.js")).default;
  const mongoose = (await import("mongoose")).default;
  const org = await getOrCreateVerrerieOrg();
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
  return { created, skipped };
};

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @description Synchro Verrerie : supprime tous les jobs et les réimporte depuis les données statiques (protégé).
 * @uses models/Job.js — deleteMany + create via runImportJobs()
 * @uses models/Content.js — deleteMany + create via runImportVideos()
 */
router.post("/clean-and-reimport", authenticateToken, async (req, res) => {
  try {
    const Job     = (await import("../models/Job.js")).default;
    const Content = (await import("../models/Content.js")).default;

    const { deletedCount } = await Job.deleteMany({});

    // Supprime les vidéos Verrerie pour les recréer avec les bons jobIds après réimport
    const videoIds = VERRERIE_VIDEOS.map(v => v._id);
    await Content.deleteMany({ _id: { $in: videoIds } });

    const { created: jobsCreated } = await runImportJobs();
    const { created: videosCreated } = await runImportVideos();

    res.status(200).json({
      message: `Synchro OK — ${deletedCount} supprimé(s), ${jobsCreated} métiers + ${videosCreated} vidéo(s) Verrerie importés`,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la synchro", error: error.message });
  }
});

/**
 * @description Liste toutes les fiches métier avec pagination.
 * @uses models/Job.js — find + countDocuments
 */
router.get("/", async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      Job.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments()
    ]);
    res.status(200).json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Crée une nouvelle fiche métier (protégé).
 * @uses models/Job.js — create
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const { name, romeCode, description, studyLevel } = req.body;
    if (!name || !romeCode) {
      return res.status(400).json({ message: "Le nom et le code ROME sont obligatoires" });
    }
    const job = await Job.create({ name, romeCode, description, studyLevel });
    res.status(201).json({ message: "Métier créé avec succès", job });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Supprime une fiche métier par son ID (protégé).
 * @uses models/Job.js — findByIdAndDelete
 */
router.delete("/:jobId", authenticateToken, async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const deleted = await Job.findByIdAndDelete(req.params.jobId);
    if (!deleted) return res.status(404).json({ message: "Métier introuvable" });
    res.status(200).json({ message: "Métier supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Statistiques agrégées de toutes les fiches — ADMIN voit tout, USER voit son organisation (protégé).
 * @uses models/Job.js — find filtré par orgId selon le rôle
 */
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    const Job = (await import("../models/Job.js")).default;
    const filter = req.user.role === 'ADMIN' ? {} : {
      $or: [
        { orgId: req.user.orgId },
        { orgId: null }  // jobs sans orgId (données migrées) restent visibles
      ]
    };
    const jobs = await Job.find(filter).select("name views likes applicants orgId");
    const totals = jobs.reduce((acc, j) => ({
      views: acc.views + (j.views || 0),
      likes: acc.likes + (j.likes || 0),
      applicants: acc.applicants + (j.applicants || 0),
    }), { views: 0, likes: 0, applicants: 0 });
    res.status(200).json({ jobs, totals, count: jobs.length });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

/**
 * @description Met à jour les champs textuels d'une fiche métier.
 * @uses controllers/jobController.js — updateJobDetails()
 */
router.put("/:jobId/details", updateJobDetails);

/**
 * @description Statistiques d'une fiche métier (vues, likes, candidatures).
 * @uses controllers/jobController.js — getJobStatistics()
 */
router.get("/:jobId/statistics", getJobStatistics);

/**
 * @description Enregistre une vue sur une fiche métier.
 * @uses controllers/jobController.js — incrementView()
 */
router.post("/:jobId/view", incrementView);

/**
 * @description Ajoute un like sur une fiche métier (protégé, anti-doublon).
 * @uses controllers/jobController.js — addLike()
 */
router.post("/:jobId/like", authenticateToken, addLike);

/**
 * @description Enregistre une candidature sur une fiche métier.
 * @uses controllers/jobController.js — addApplicant()
 */
router.put("/:jobId/apply", addApplicant);

/**
 * @description Retire un like sur une fiche métier (protégé).
 * @uses controllers/jobController.js — revokeLike()
 */
router.delete('/:jobId/like', authenticateToken, revokeLike);

export default router;
