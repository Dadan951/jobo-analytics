/**
 * @module routes/ticketRoutes
 * @description Définition des routes pour les tickets de support utilisateur.
 *
 * @usedBy server.js — monté sur /tickets
 * @uses controllers/ticketController.js — createTicket, getUserTickets, getTicketById
 * @uses middlewares/authMiddleware.js — authenticateToken
 *
 * Endpoints :
 * - POST /    → createTicket   — Créer un ticket (protégé)
 * - GET  /    → getUserTickets — Tickets de l'utilisateur connecté (protégé)
 * - GET  /:id → getTicketById  — Détail d'un ticket (protégé)
 */

import express from "express";
import { createTicket, getUserTickets, getTicketById } from "../controllers/ticketController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @description Crée un nouveau ticket de support (protégé).
 * @uses controllers/ticketController.js — createTicket()
 */
router.post("/", authenticateToken, createTicket);

/**
 * @description Retourne tous les tickets de l'utilisateur connecté, du plus récent au plus ancien (protégé).
 * @uses controllers/ticketController.js — getUserTickets()
 */
router.get("/", authenticateToken, getUserTickets);

/**
 * @description Retourne le détail d'un ticket par son ID, uniquement s'il appartient à l'utilisateur connecté (protégé).
 * @uses controllers/ticketController.js — getTicketById()
 */
router.get("/:id", authenticateToken, getTicketById);

export default router;
