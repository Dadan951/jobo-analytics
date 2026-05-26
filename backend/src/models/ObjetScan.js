/**
 * @module models/ObjetScan
 * @description Schéma Mongoose pour les objets scannés dans l'application.
 * Enregistre les données de scan (lieu, date, compteurs).
 *
 * @usedBy controllers/objetScanController.js — lecture et gestion des scans
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const objetScanSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },

    scanDate: { type: Date, required: true },

    location: { type: String, trim: true },

    scan:  { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
  },

  { timestamps: true }
);

/**
 * @description Retourne toutes les informations du scan sous forme d'objet structuré.
 * @usedBy controllers/objetScanController.js — getScanDetails()
 * @returns {Promise<{ scanId, scanDate, location, scan, likes, createdAt, updatedAt }>}
 */
objetScanSchema.methods.getScanDetails = async function () {
  return {
    scanId:    this._id,
    scanDate:  this.scanDate,
    location:  this.location,
    scan:      this.scan,
    likes:     this.likes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model("ObjetScan", objetScanSchema);
