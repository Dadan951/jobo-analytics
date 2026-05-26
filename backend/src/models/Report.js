/**
 * @module models/Report
 * @description Schéma Mongoose pour les rapports générés (PDF) par organisation et par période.
 *
 * @usedBy controllers/reportController.js — génération et lecture des rapports
 */

import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    period: { type: String, 
      enum: ["WEEK", "MONTH", "YEAR"], 
      required: true },

    format: { type: String, 
      enum: ["PDF"], 
      default: "PDF" },

    generatedAt: { type: Date, 
      default: Date.now },

    orgId: { type: mongoose.Schema.Types.ObjectId, 
      ref: "Organization", 
      required: true }
  },

  { timestamps: false }
);

// Index pour rechercher par organisation du plus récent au plus ancien
reportSchema.index({ orgId: 1, generatedAt: -1 });

export default mongoose.model("Report", reportSchema);