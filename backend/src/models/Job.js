/**
 * @module models/Job
 * @description Schéma Mongoose pour les fiches métier avec compteurs d'interactions
 * et méthodes de gestion des likes, candidatures et statistiques.
 *
 * @usedBy controllers/jobController.js — toutes les opérations sur les fiches métier
 * @uses models/Content.js — récupération des contenus liés pour les statistiques
 * @uses models/Interaction.js — création/suppression des interactions (likes)
 */

import mongoose from "mongoose";
import Content from "./Content.js";
import Interaction from "./Interaction.js";

const jobSchema = new mongoose.Schema(
  {
    // joboId : ID string envoyé par l'app Jobo ("004", "006", "010"...)
    // Permet de retrouver un métier même si son _id MongoDB ne correspond pas
    joboId: { type: String, index: true, sparse: true },

    // orgId : organisation propriétaire de la fiche métier (filtrage par patron)
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true, default: null },

    name: { type: String,
      required: true,
      trim: true
    },

    romeCode: { type: String,
      required: true,
      trim: true
    },

    description: { type: String,
      trim: true
    },

    studyLevel: { type: String,
      trim: true
    },

    views: { type: Number,
      default: 0 },

    likes: { type: Number,
      default: 0 },

    applicants: { type: Number,
      default: 0 }
  },

  { timestamps: true }
);

/**
 * @description Met à jour les champs textuels autorisés de la fiche métier (name, romeCode, description, studyLevel).
 * @usedBy controllers/jobController.js — updateJobDetails()
 * @param {Object} details - Objet avec les champs à mettre à jour
 * @returns {Promise<Job>} La fiche métier mise à jour
 */
jobSchema.methods.updateDetails = async function (details) {
  const allowedFields = ["name", "romeCode", "description", "studyLevel"];

  allowedFields.forEach((field) => {
    if (details[field] !== undefined) {
      this[field] = details[field];
    }
  });

  await this.save();
  return this;
};

/**
 * @description Calcule les statistiques de la fiche métier via une agrégation MongoDB sur les interactions liées à ses contenus.
 * @usedBy controllers/jobController.js — getJobStatistics()
 * @returns {Promise<{ jobId, jobName, romeCode, views, likes, applies }>}
 */
jobSchema.methods.getStatistics = async function () {
  const contents = await Content.find({ jobId: this._id }).select("_id");
  const contentIds = contents.map((content) => content._id);

  if (contentIds.length === 0) {
    return {
      jobId: this._id,
      jobName: this.name,
      romeCode: this.romeCode,
      views: 0,
      likes: 0,
      applies: 0
    };
  }

  const interactionStats = await Interaction.aggregate([
    {
      $match: { contentId: { $in: contentIds } }
    },
    {
      // Regroupe par type et compte le nombre d'interactions pour chaque type
      $group: {
        _id: "$type",
        count: { $sum: 1 }
      }
    }
  ]);

  let views = 0;
  let likes = 0;
  let applies = 0;

  interactionStats.forEach((stat) => {
    if (stat._id === "VIEW") views = stat.count;
    if (stat._id === "LIKE") likes = stat.count;
    if (stat._id === "APPLY") applies = stat.count;
  });

  return {
    jobId: this._id,
    jobName: this.name,
    romeCode: this.romeCode,
    views,
    likes,
    applies
  };
};

/**
 * @description Ajoute un like avec vérification anti-doublon. Lève "ALREADY_LIKED" si l'utilisateur a déjà liké.
 * @usedBy controllers/jobController.js — addLike()
 * @param {string} userId - ID MongoDB de l'utilisateur
 * @throws {Error} "ALREADY_LIKED" si l'utilisateur a déjà liké ce métier
 * @returns {Promise<{ interaction: Interaction, updatedObject: Job }>}
 */
jobSchema.methods.addLike = async function (userId) {
  // Accès au modèle Interaction via this.model() pour éviter les imports circulaires
  const Interaction = this.model('Interaction');

  const existingLike = await Interaction.findOne({
    contentId: this._id,
    userId,
    type: "LIKE"
  });

  if (existingLike) {
    throw new Error("ALREADY_LIKED");
  }

  // Promise.all parallélise la création Interaction et l'incrémentation pour de meilleures performances
  const [interaction, updatedJob] = await Promise.all([
    Interaction.create({ contentId: this._id, userId, type: "LIKE" }),
    this.model('Job').findByIdAndUpdate(
      this._id,
      { $inc: { likes: 1 } },  // $inc ajoute 1 au champ "likes" directement en base
      { new: true }            // { new: true } retourne le document après modification
    )
  ]);

  // "updatedObject" : nom attendu par le contrôleur pour rester cohérent avec les autres méthodes
  return { interaction, updatedObject: updatedJob };
};

/**
 * @description Retire le like d'un utilisateur et décrémente le compteur. Lève "NO_LIKE_FOUND" si aucun like trouvé.
 * @usedBy controllers/jobController.js — revokeLike()
 * @param {string} userId - ID MongoDB de l'utilisateur
 * @throws {Error} "NO_LIKE_FOUND" si aucun like de cet utilisateur n'existe
 * @returns {Promise<{ updatedJob: Job, interactionSupprimee: Interaction }>}
 */
jobSchema.methods.revokeLike = async function (userId) {
  // Accès au modèle Interaction via this.model() pour éviter les imports circulaires
  const Interaction = this.model('Interaction');

  // findOneAndDelete cherche ET supprime en une seule opération atomique
  const interactionSupprimee = await Interaction.findOneAndDelete({
    type: "LIKE",
    // contentId stocke ici un Job ID — réutilisation du champ pour les likes directs sur métier
    contentId: this._id,
    userId
  });

  if (!interactionSupprimee) {
    throw new Error("NO_LIKE_FOUND");
  }

  const updatedJob = await this.model('Job').findByIdAndUpdate(
    this._id,
    { $inc: { likes: -1 } },  // $inc avec -1 décrémente le compteur directement en base
    { new: true }             // { new: true } retourne le document après modification
  );

  return { updatedJob, interactionSupprimee };
};

export default mongoose.model("Job", jobSchema);
