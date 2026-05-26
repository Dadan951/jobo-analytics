/**
 * @module models/Notification
 * @description Schéma Mongoose pour les notifications envoyées aux utilisateurs.
 *
 * @usedBy controllers/notificationController.js — création et gestion des notifications
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    sentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true }
);

/**
 * @description Marque la notification comme lue et sauvegarde en base.
 * @usedBy controllers/notificationController.js — markNotificationAsRead()
 * @returns {Promise<boolean>} true une fois la notification sauvegardée
 */
notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  await this.save();
  return this.isRead;
};

export default mongoose.model("Notification", notificationSchema);
