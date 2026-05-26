/**
 * @module models/ActivityLog
 * @description Schéma Mongoose pour le journal d'activité de l'application.
 * Trace chaque action utilisateur importante et l'exporte dans un fichier de log.
 *
 * @usedBy controllers/activityLogController.js — création des entrées
 * @usedBy controllers/authController.js — log des connexions et inscriptions
 * @usedBy controllers/jobController.js — log des mises à jour de fiches métier
 * @usedBy controllers/adminController.js — lecture des logs récents
 * @uses mongoose — définition du schéma et du modèle
 * @uses fs/promises — écriture dans le fichier activity.log
 */

import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "REGISTER",
        "LOGIN",
        "LOGOUT",
        "CHANGE_PASSWORD",
        "UPDATE_EMAIL",
        "UPDATE_JOB_DETAILS"
      ]
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },

    actionDate: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ actionType: 1, actionDate: -1 });
activityLogSchema.index({ userId: 1, actionDate: -1 });

/**
 * @description Exporte l'entrée courante dans backend/logs/activity.log. Crée le dossier si absent.
 * @usedBy controllers/activityLogController.js — createLogEntry()
 * @usedBy controllers/authController.js — register(), login(), logout()
 * @usedBy controllers/jobController.js — updateJobDetails()
 * @usedBy controllers/userController.js — changePassword(), updateEmail()
 * @returns {Promise<void>}
 */
activityLogSchema.methods.exportLogEntry = async function () {
  const userPart = this.userId ? ` userId=${this.userId}` : "";
  const logLine = `[${this.actionDate.toISOString()}] [${this.actionType}]${userPart} - ${this.description}\n`;

  // src/models -> backend/logs/activity.log
  const logFilePath = path.resolve(__dirname, "../../logs/activity.log");

  await fs.mkdir(path.dirname(logFilePath), { recursive: true });
  await fs.appendFile(logFilePath, logLine, "utf8");
};

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);
