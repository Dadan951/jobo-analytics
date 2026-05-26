/**
 * @module routes/notificationRoutes
 * @description Définition des routes pour la gestion des notifications utilisateur.
 *
 * @usedBy server.js — monté sur /notifications
 * @uses controllers/notificationController.js — getAllNotifications, getUnreadNotifications,
 * getNotificationById, createNotification, markNotificationAsRead,
 * markAllNotificationsAsRead, deleteNotification
 * @uses middlewares/authMiddleware.js — authenticateToken
 *
 * Endpoints :
 * - GET    /              → getAllNotifications         — Toutes les notifications (protégé)
 * - GET    /unread        → getUnreadNotifications      — Notifications non lues (protégé)
 * - GET    /:id           → getNotificationById         — Détail d'une notification (protégé)
 * - POST   /              → createNotification          — Créer une notification (protégé)
 * - PATCH  /read-all      → markAllNotificationsAsRead  — Marquer tout comme lu (protégé)
 * - PATCH  /:id/read      → markNotificationAsRead      — Marquer une notif comme lue (protégé)
 * - DELETE /:id           → deleteNotification          — Supprimer une notification (protégé)
 */

import express from "express";
import {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Toutes les routes nécessitent d'être authentifié
router.use(authenticateToken);

/**
 * @description Retourne toutes les notifications de l'utilisateur connecté.
 * @uses controllers/notificationController.js — getAllNotifications()
 */
router.get("/", getAllNotifications);

/**
 * @description Retourne uniquement les notifications non lues avec leur décompte.
 * @uses controllers/notificationController.js — getUnreadNotifications()
 */
router.get("/unread", getUnreadNotifications);

/**
 * @description Retourne une notification par son ID si elle appartient à l'utilisateur connecté.
 * @uses controllers/notificationController.js — getNotificationById()
 */
router.get("/:id", getNotificationById);

/**
 * @description Crée une nouvelle notification. Envoie un email si `toEmail` est fourni.
 * @uses controllers/notificationController.js — createNotification()
 */
router.post("/", createNotification);

/**
 * @description Marque toutes les notifications non lues de l'utilisateur comme lues.
 * @uses controllers/notificationController.js — markAllNotificationsAsRead()
 */
router.patch("/read-all", markAllNotificationsAsRead);

/**
 * @description Marque une notification spécifique comme lue.
 * @uses controllers/notificationController.js — markNotificationAsRead()
 */
router.patch("/:id/read", markNotificationAsRead);

/**
 * @description Supprime une notification par son ID si elle appartient à l'utilisateur connecté.
 * @uses controllers/notificationController.js — deleteNotification()
 */
router.delete("/:id", deleteNotification);

export default router;
