/**
 * @module models/Interaction
 * @description Schéma Mongoose pour les interactions utilisateurs sur les contenus
 * (vues, likes, candidatures).
 *
 * @usedBy models/Content.js — création d'interactions via incrementView, addLike, revokeLike
 * @usedBy models/Job.js — création et suppression d'interactions via addLike, revokeLike, getStatistics
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    type: { type: String,
      enum: ["VIEW", "LIKE", "APPLY", "SAVE"],
      required: true },

    date: { type: Date,
      default: Date.now },

    contentId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false },

  },

  // timestamps désactivé : la date d'interaction est gérée manuellement via le champ "date"
  { timestamps: false }
);

// Index pour rechercher par type de contenu du plus récent au plus ancien
interactionSchema.index({ contentId: 1, date: -1 });

export default mongoose.model("Interaction", interactionSchema);
