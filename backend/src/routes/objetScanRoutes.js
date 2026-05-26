/**
 * @module routes/objetScanRoutes
 * @description Définition des routes pour les scans d'objets physiques.
 *
 * @usedBy server.js — monté sur /scans
 * @uses controllers/objetScanController.js — getScanDetails
 *
 * Endpoints :
 * - GET /:scanId/details → getScanDetails — Détails d'un scan
 */

import express from "express";
import { getScanDetails } from "../controllers/objetScanController.js";

const router = express.Router();

/**
 * @description Retourne les détails d'un scan par son identifiant.
 * @uses controllers/objetScanController.js — getScanDetails()
 */
router.get("/:scanId/details", getScanDetails);

export default router;
