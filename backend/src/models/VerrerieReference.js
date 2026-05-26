/**
 * @module models/VerrerieReference
 * @description Base de données de référence des entreprises et organismes
 * liés à la filière verrerie. Utilisée pour la détection automatique
 * lors de l'inscription sur Jobo Analytics.
 */

import mongoose from "mongoose";

const verrerieReferenceSchema = new mongoose.Schema(
  {
    // Nom officiel de l'entreprise/organisme
    name: { type: String, required: true, trim: true },

    // Mots-clés alternatifs (abréviations, anciens noms, filiales...)
    aliases: [{ type: String, trim: true }],

    // Catégorie dans la filière
    category: {
      type: String,
      enum: [
        'FABRICANT_VERRE_PLAT',
        'FABRICANT_VERRE_CREUX',
        'FABRICANT_VERRE_SPECIAL',
        'CRISTALLERIE',
        'VERRERIE_ARTISTIQUE',
        'VERRE_PHARMACEUTIQUE',
        'VERRE_AUTOMOBILE',
        'VERRE_BATIMENT',
        'ORGANISME_FORMATION',
        'SYNDICAT_ASSOCIATION',
        'AUTRE',
      ],
      default: 'AUTRE',
    },

    // Pays d'origine
    country: { type: String, default: 'France' },

    actif: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index de recherche textuel sur name + aliases
verrerieReferenceSchema.index({ name: 'text', aliases: 'text' });
verrerieReferenceSchema.index({ name: 1 });

export default mongoose.model("VerrerieReference", verrerieReferenceSchema);
