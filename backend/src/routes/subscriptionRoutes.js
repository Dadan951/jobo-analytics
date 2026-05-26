/**
 * @module routes/subscriptionRoutes
 * @description Définition des routes pour la gestion des abonnements Stripe.
 *
 * @usedBy server.js — monté sur /subscriptions
 * @uses controllers/subscriptionController.js — createCheckoutSession, handleWebhook,
 * getMySubscription, cancelMySubscription
 * @uses middlewares/authMiddleware.js — authenticateToken
 *
 * Endpoints :
 * - POST /webhook   → handleWebhook          — Réception des événements Stripe (raw body, sans auth)
 * - POST /checkout  → createCheckoutSession  — Créer une session de paiement (protégé)
 * - GET  /my        → getMySubscription      — Statut de l'abonnement courant (protégé)
 * - DELETE /my      → cancelMySubscription   — Annuler l'abonnement courant (protégé)
 */

import express from "express";
import {
  createCheckoutSession,
  handleWebhook,
  getMySubscription,
  cancelMySubscription,
  verifyCheckoutSession,
} from "../controllers/subscriptionController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @description Webhook Stripe — raw body obligatoire pour la vérification de signature, sans authentification JWT.
 * @uses controllers/subscriptionController.js — handleWebhook()
 */
router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);

/**
 * @description Crée une session de paiement Stripe Checkout pour le plan demandé (protégé).
 * @uses controllers/subscriptionController.js — createCheckoutSession()
 */
router.post("/checkout", authenticateToken, createCheckoutSession);

/**
 * @description Retourne le plan et le statut d'abonnement de l'utilisateur connecté (protégé).
 * @uses controllers/subscriptionController.js — getMySubscription()
 */
router.get("/my", authenticateToken, getMySubscription);

/**
 * @description Annule l'abonnement Stripe actif de l'utilisateur et repasse au plan FREE (protégé).
 * @uses controllers/subscriptionController.js — cancelMySubscription()
 */
router.delete("/my", authenticateToken, cancelMySubscription);
/**
 * @description Vérifie la session Stripe et met à jour l'abonnement sans attendre le webhook (protégé).
 * @uses controllers/subscriptionController.js — verifyCheckoutSession()
 */
router.get("/verify-session", authenticateToken, verifyCheckoutSession);

export default router;
