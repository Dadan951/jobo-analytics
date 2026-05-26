/**
 * @module models/Ticket
 * @description Schéma Mongoose pour les tickets de support utilisateur.
 *
 * @usedBy controllers/ticketController.js — création et lecture des tickets
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN"
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    adminReply: {
      type: String,
      default: null
    },

    adminRepliedAt: {
      type: Date,
      default: null
    }
  },

  { timestamps: true }
);

ticketSchema.index({ userId: 1 });

export default mongoose.model("Ticket", ticketSchema);
