/**
 * @module routes/activityLogRoutes
 * @description Définition des routes pour le journal d'activité.
 *
 * @usedBy server.js — monté sur /activity-logs
 * @uses controllers/activityLogController.js — createLogEntry
 *
 * Endpoints :
 * - POST / → createLogEntry — Créer une entrée de log
 */

import express from "express";
import { createLogEntry } from "../controllers/activityLogController.js";

const router = express.Router();

/**
 * @description Crée une entrée de log et l'exporte dans backend/logs/activity.log.
 * @uses controllers/activityLogController.js — createLogEntry()
 */
router.post("/", createLogEntry);

export default router;
