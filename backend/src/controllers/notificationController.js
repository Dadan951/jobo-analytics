/**
 * @module controllers/notificationController
 * @description Gestion des notifications utilisateur : lecture, création, marquage et suppression.
 *
 * @usedBy routes/notificationRoutes.js — expose les endpoints /notifications/*
 * @uses models/Notification.js — modèle de notification
 * @uses utils/mailer.js — envoi d'email optionnel à la création
 */

import Notification from "../models/Notification.js";
import { sendNotificationEmail } from "../utils/mailer.js";

/**
 * @description Retourne toutes les notifications de l'utilisateur, de la plus récente à la plus ancienne.
 * @usedBy routes/notificationRoutes.js — GET /notifications
 * @returns {200} Notification[]
 * @returns {500} { message, error }
 */
export const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId }).sort({ sentDate: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Retourne uniquement les notifications non lues, avec leur décompte.
 * @usedBy routes/notificationRoutes.js — GET /notifications/unread
 * @returns {200} { count: number, notifications: Notification[] }
 * @returns {500} { message, error }
 */
export const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId, isRead: false }).sort({ sentDate: -1 });
    return res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Retourne une notification par son ID, uniquement si elle appartient à l'utilisateur.
 * @usedBy routes/notificationRoutes.js — GET /notifications/:id
 * @param {string} req.params.id - ID MongoDB de la notification
 * @returns {200} Notification
 * @returns {404} Notification introuvable
 * @returns {500} { message, error }
 */
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Crée une notification. Si `toEmail` est fourni, envoie également un email.
 * @usedBy routes/notificationRoutes.js — POST /notifications
 * @param {string} req.body.title - Titre de la notification
 * @param {string} req.body.message - Corps de la notification
 * @param {Date}   [req.body.sentDate] - Date d'envoi (Date.now() par défaut)
 * @param {string} [req.body.toEmail] - Adresse email destinataire (optionnel)
 * @returns {201} { message, notification }
 * @returns {500} { message, error }
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, sentDate, toEmail } = req.body;
    const userId = req.user.userId;

    const notification = new Notification({
      title,
      message,
      sentDate: sentDate || Date.now(),
      userId,
    });

    await notification.save();

    if (toEmail) {
      await sendNotificationEmail(toEmail, title, message);
    }

    return res.status(201).json({
      message: "Notification créée avec succès",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Marque une notification comme lue via `markAsRead()`.
 * @usedBy routes/notificationRoutes.js — PATCH /notifications/:id/read
 * @param {string} req.params.id - ID MongoDB de la notification
 * @returns {200} { message, isRead: true }
 * @returns {404} Notification introuvable
 * @returns {500} { message, error }
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    const isRead = await notification.markAsRead();

    return res.status(200).json({
      message: "Notification marquée comme lue",
      isRead,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Marque toutes les notifications non lues de l'utilisateur comme lues via `updateMany`.
 * @usedBy routes/notificationRoutes.js — PATCH /notifications/read-all
 * @returns {200} { message, updatedCount: number }
 * @returns {500} { message, error }
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      message: "Toutes les notifications ont été marquées comme lues",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};

/**
 * @description Supprime une notification par son ID, uniquement si elle appartient à l'utilisateur.
 * @usedBy routes/notificationRoutes.js — DELETE /notifications/:id
 * @param {string} req.params.id - ID MongoDB de la notification
 * @returns {200} { message: "Notification supprimée avec succès" }
 * @returns {404} Notification introuvable
 * @returns {500} { message, error }
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    return res.status(200).json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
