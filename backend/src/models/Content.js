/**
 * @module models/Content
 * @description Schéma Mongoose pour les contenus associés aux fiches métier
 * (vidéos, offres d'emploi, objets).
 *
 * @usedBy controllers/contentController.js — gestion des interactions
 * @usedBy models/Job.js — association contenu/métier via jobId
 * @uses models/Interaction.js — création des documents d'interaction (VIEW, LIKE)
 */

import mongoose from "mongoose";
import Interaction from "./Interaction.js";

const contentSchema = new mongoose.Schema(
  {
    title: { type: String,
      required: true,
      trim: true },

    type: { type: String,
      enum: ["OFFER", "VIDEO", "OBJECT"],
      required: true },

    publishedAt: { type: Date,
      default: Date.now },

    orgId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true },

    jobId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true }
  },

  { timestamps: true }
);

/**
 * @description Enregistre une vue sur ce contenu — réservé aux contenus de type VIDEO.
 * @usedBy controllers/contentController.js — incrementView()
 * @throws {Error} "Seuls les contenus de type VIDEO peuvent enregistrer une vue" si type !== VIDEO
 * @returns {Promise<Interaction>} L'interaction créée
 */
contentSchema.methods.incrementView = async function () {
  if (this.type !== "VIDEO") {
    throw new Error("Seuls les contenus de type VIDEO peuvent enregistrer une vue");
  }

  const interaction = await Interaction.create({
    type: "VIEW",
    contentId: this._id
  });

  return interaction;
};

/**
 * @description Enregistre un like d'un utilisateur sur ce contenu.
 * @usedBy controllers/contentController.js — addLike()
 * @param {string} userId - ID MongoDB de l'utilisateur
 * @returns {Promise<Interaction>} L'interaction créée
 */
contentSchema.methods.addLike = async function (userId) {
  const interaction = await Interaction.create({
    type: "LIKE",
    contentId: this._id,
    userId
  });
  return interaction;
};

contentSchema.index({ orgId: 1, publishedAt: -1 });
contentSchema.index({ jobId: 1, publishedAt: -1 });

/**
 * @description Supprime le like d'un utilisateur sur ce contenu. Lève une erreur si aucun like trouvé.
 * @usedBy controllers/contentController.js — revokeLike()
 * @param {string} userId - ID MongoDB de l'utilisateur
 * @throws {Error} "userId requis pour retirer un like" si userId absent
 * @throws {Error} "Aucun like à retirer pour ce contenu" si aucun like trouvé
 * @returns {Promise<Interaction>} L'interaction supprimée
 */
contentSchema.methods.revokeLike = async function (userId) {
  if (!userId) {
    throw new Error("userId requis pour retirer un like");
  }

  const deletedLike = await Interaction.findOneAndDelete({
    type: "LIKE",
    contentId: this._id,
    userId
  });

  if (!deletedLike) {
    throw new Error("Aucun like à retirer pour ce contenu");
  }

  return deletedLike;
};

export default mongoose.model("Content", contentSchema);
