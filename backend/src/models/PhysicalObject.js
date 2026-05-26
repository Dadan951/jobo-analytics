/**
 * @module models/PhysicalObject
 * @description Schéma Mongoose pour les objets physiques scannables.
 * Chaque objet est lié à une organisation et un métier.
 *
 * @usedBy controllers/physicalObjectController.js — incrémentation scans et likes
 * @uses mongoose — définition du schéma et du modèle
 * @uses models/Interaction.js — suivi des likes par utilisateur (via this.constructor)
 */

import mongoose from "mongoose";

const physicalObjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    scanCount: {
      type: Number,
      default: 0
    },

    likes: {
      type: Number,
      default: 0
    }
  },

  { timestamps: true }
);

/**
 * @description Incrémente le compteur de scans de l'objet.
 * @usedBy controllers/physicalObjectController.js — incrementScanCount()
 * @returns {Promise<PhysicalObject>} L'objet mis à jour avec le nouveau scanCount
 */
physicalObjectSchema.methods.incrementScanCount = async function () {
  // findByIdAndUpdate évite une double requête (findById + save)
  const updatedObject = await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { scanCount: 1 } },  // $inc ajoute 1 au champ "scanCount" directement en base
    { new: true }                // { new: true } retourne le document après modification
  );
  return updatedObject;
};

/**
 * @description Incrémente le compteur de likes de l'objet.
 * @usedBy controllers/physicalObjectController.js — addLike()
 * @returns {Promise<PhysicalObject>} L'objet mis à jour avec le nouveau compteur likes
 */
physicalObjectSchema.methods.addLike = async function () {
  // findByIdAndUpdate évite une double requête (findById + save)
  const updatedObject = await this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { likes: 1 } },  // $inc ajoute 1 au champ "likes" directement en base
    { new: true }            // { new: true } retourne le document après modification
  );
  return updatedObject;
};

/**
 * @description Supprime le like d'un utilisateur et décrémente le compteur. Lève "NO_LIKE_FOUND" si aucun like trouvé.
 * @usedBy controllers/physicalObjectController.js — revokeLike()
 * @param {string} userId - ID MongoDB de l'utilisateur
 * @throws {Error} "NO_LIKE_FOUND" si aucun like de cet utilisateur n'existe
 * @returns {Promise<PhysicalObject>} L'objet mis à jour avec le compteur décrémenté
 */
physicalObjectSchema.methods.revokeLike = async function (userId) {
  // Accès au modèle Interaction via this.constructor pour éviter les imports circulaires
  const Interaction = mongoose.model('Interaction');

  const existingLike = await Interaction.findOne({
    contentId: this._id,
    userId,
    type: "LIKE"
  });

  if (!existingLike) {
    throw new Error("NO_LIKE_FOUND");
  }

  // Promise.all parallélise la suppression et la décrémentation pour de meilleures performances
  const [_, updatedObject] = await Promise.all([
    Interaction.deleteOne({ _id: existingLike._id }),
    this.constructor.findByIdAndUpdate(
      this._id,
      { $inc: { likes: -1 } },  // $inc avec -1 décrémente le compteur directement en base
      { new: true }             // { new: true } retourne le document après modification
    )
  ]);
  return updatedObject;
};

const PhysicalObject = mongoose.model("PhysicalObject", physicalObjectSchema);

export default PhysicalObject;
