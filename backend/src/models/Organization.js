/**
 * @module models/Organization
 * @description Schéma Mongoose pour les organisations auxquelles appartiennent les utilisateurs.
 *
 * @usedBy controllers/authController.js — création et recherche d'organisations à l'inscription
 * @usedBy controllers/adminController.js — liaison d'une organisation à une catégorie JOBO
 * @uses mongoose — définition du schéma et du modèle
 */

import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String,
      required: true,
      trim: true },
    joboCategory: { type: String, default: null },
    // filiere : 'VERRERIE' si détectée automatiquement, null sinon
    filiere: { type: String, enum: ['VERRERIE', null], default: null },
  },
 
  { timestamps: true }
);

// Index pour rechercher par nom
organizationSchema.index({ name: 1 });

export default mongoose.model("Organization", organizationSchema);