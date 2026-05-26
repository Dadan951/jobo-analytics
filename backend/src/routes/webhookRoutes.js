/**
 * @module routes/webhookRoutes
 * @description Définition des routes pour la réception des événements analytiques Jobo.
 *
 * @usedBy server.js — monté sur /webhook
 * @uses controllers/webhookController.js — handleAnalyticsEvent
 *
 * Endpoints :
 * - POST /event → handleAnalyticsEvent — Recevoir un événement Jobo (vue, like, candidature, scan)
 */

import express from "express";
import { handleAnalyticsEvent } from "../controllers/webhookController.js";

const router = express.Router();

/**
 * @description Reçoit un événement analytique de l'app Jobo mobile (authentifié par x-api-key).
 * @uses controllers/webhookController.js — handleAnalyticsEvent()
 */
router.post("/event", handleAnalyticsEvent);

export default router;
