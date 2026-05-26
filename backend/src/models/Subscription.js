/**
 * @module models/Subscription
 * @description Schéma Mongoose pour les abonnements utilisateurs.
 *
 * @usedBy controllers/subscriptionController.js — création et gestion des abonnements
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Type de plan souscrit (ex: "Basic", "Premium")
    planType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * @description Renouvelle l'abonnement d'un an à partir de la date actuelle et repasse le statut à ACTIVE.
 * @usedBy controllers/subscriptionController.js — (renouvellement automatique)
 * @returns {Promise<Subscription>} L'abonnement sauvegardé avec la nouvelle renewalDate
 */
subscriptionSchema.methods.renew = function () {
  const now = new Date();
  this.renewalDate = new Date(now.setFullYear(now.getFullYear() + 1));
  this.status = "ACTIVE";
  return this.save();
};

/**
 * @description Annule l'abonnement en passant le statut à INACTIVE.
 * @usedBy controllers/subscriptionController.js — cancelMySubscription()
 * @returns {Promise<Subscription>} L'abonnement sauvegardé avec status INACTIVE
 */
subscriptionSchema.methods.cancel = function () {
  this.status = "INACTIVE";
  return this.save();
};

export default mongoose.model("Subscription", subscriptionSchema);
