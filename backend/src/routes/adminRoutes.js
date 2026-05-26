/**
 * @module routes/adminRoutes
 * @description Définition des routes d'administration (accès restreint ADMIN).
 * Toutes les routes sont protégées par authenticateToken + requireAdmin.
 *
 * @usedBy server.js — monté sur /admin
 * @uses controllers/adminController.js — getAllUsers, updateUserRole, deleteUser,
 * getAllTickets, updateTicketStatus, replyToTicket, getAdminStats
 * @uses middlewares/authMiddleware.js — authenticateToken
 * @uses middlewares/adminMiddleware.js — requireAdmin
 *
 * Endpoints :
 * - GET    /stats                      → getAdminStats       — Statistiques globales
 * - GET    /users                      → getAllUsers          — Liste des utilisateurs
 * - PUT    /users/:id/role             → updateUserRole       — Modifier le rôle
 * - DELETE /users/:id                  → deleteUser           — Supprimer un utilisateur
 * - GET    /tickets                    → getAllTickets        — Liste des tickets
 * - PUT    /tickets/:id/status         → updateTicketStatus  — Modifier le statut
 * - POST   /tickets/:id/reply          → replyToTicket       — Répondre à un ticket
 * - PUT    /organizations/:id/jobo-category → linkOrgToJoboCategory — Lier une org à JOBO
 * - POST   /seed-verrerie              — Peupler VerrerieReference
 */

import express from "express";
import {
  getAllUsers, updateUserRole, deleteUser,
  getAllTickets, updateTicketStatus, replyToTicket,
  getAdminStats, linkOrgToJoboCategory,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { requireAdmin } from "../middlewares/adminMiddleware.js";
import VerrerieReference from "../models/VerrerieReference.js";

const router = express.Router();

// Toutes les routes nécessitent d'être authentifié et admin
router.use(authenticateToken, requireAdmin);

/**
 * @description Statistiques globales (utilisateurs, tickets, logs récents).
 * @uses controllers/adminController.js — getAdminStats()
 */
router.get("/stats", getAdminStats);

/**
 * @description Liste tous les utilisateurs sans leur mot de passe.
 * @uses controllers/adminController.js — getAllUsers()
 */
router.get("/users", getAllUsers);

/**
 * @description Modifie le rôle d'un utilisateur (ADMIN | USER).
 * @uses controllers/adminController.js — updateUserRole()
 */
router.put("/users/:id/role", updateUserRole);

/**
 * @description Supprime un utilisateur — interdit sur son propre compte.
 * @uses controllers/adminController.js — deleteUser()
 */
router.delete("/users/:id", deleteUser);

/**
 * @description Liste tous les tickets avec les infos de l'utilisateur associé.
 * @uses controllers/adminController.js — getAllTickets()
 */
router.get("/tickets", getAllTickets);

/**
 * @description Modifie le statut d'un ticket (OPEN | CLOSED).
 * @uses controllers/adminController.js — updateTicketStatus()
 */
router.put("/tickets/:id/status", updateTicketStatus);

/**
 * @description Ajoute une réponse admin à un ticket.
 * @uses controllers/adminController.js — replyToTicket()
 */
router.post("/tickets/:id/reply", replyToTicket);

/**
 * @description Lie une organisation à une catégorie JOBO.
 * @uses controllers/adminController.js — linkOrgToJoboCategory()
 */
router.put("/organizations/:id/jobo-category", linkOrgToJoboCategory);

/**
 * @description Peuple la collection VerrerieReference avec les données de seed (supprime d'abord l'existant).
 * @uses models/VerrerieReference.js — deleteMany + insertMany
 * @uses scripts/verrerieData.js — VERRERIE_SEED_DATA
 */
router.post("/seed-verrerie", async (req, res) => {
  try {
    const { VERRERIE_SEED_DATA } = await import("../scripts/verrerieData.js");
    await VerrerieReference.deleteMany({});
    const inserted = await VerrerieReference.insertMany(VERRERIE_SEED_DATA);
    const byCategory = inserted.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {});
    res.status(200).json({
      message: `Seed OK — ${inserted.length} entreprises importees`,
      byCategory,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur seed", error: error.message });
  }
});

export default router;
