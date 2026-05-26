/**
 * @module controllers/jobController
 * @description Gestion des interactions sur les fiches métier :
 * vues, likes, candidatures, mise à jour et statistiques.
 *
 * @usedBy routes/jobRoutes.js — expose les endpoints /jobs/*
 * @uses models/Job.js — modèle contenant les méthodes addLike, revokeLike, getStatistics, updateDetails
 * @uses models/ActivityLog.js — journalisation des mises à jour de fiches métier
 */

import Job from "../models/Job.js";
import ActivityLog from "../models/ActivityLog.js";
import mongoose from 'mongoose';

/**
 * @description Incrémente le compteur de vues d'une fiche métier.
 * @usedBy routes/jobRoutes.js — POST /jobs/:jobId/view
 * @param {string} req.params.jobId - ID MongoDB de la fiche métier
 * @returns {200} { message, jobId, jobName, profileViews }
 * @returns {400} Identifiant invalide (CastError)
 * @returns {404} Fiche métier introuvable
 * @returns {500} { message, error }
 */
export const incrementView = async (req, res) => {
  try {
    const { jobId } = req.params;

    // findByIdAndUpdate évite une double requête (findById + save)
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { views: 1 } },   // $inc ajoute 1 au champ "views" directement en base
      { new: true }              // { new: true } retourne le document après modification
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Métier introuvable"
      });
    }

    res.status(200).json({
      message: "Vue ajoutée avec succès sur le profil du métier",
      jobId: updatedJob._id,
      jobName: updatedJob.name,
      profileViews: updatedJob.views
    });

  } catch (error) {
    // Cas 1 : L'identifiant MongoDB est mal formé
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    // Cas 2 : Erreur inattendue
    res.status(500).json({
      message: "Erreur serveur lors de l'incrémentation de la vue",
      error: error.message
    });
  }
};

/**
 * @description Ajoute un like d'un utilisateur authentifié sur une fiche métier. Un utilisateur ne peut liker qu'une seule fois.
 * @usedBy routes/jobRoutes.js — POST /jobs/:jobId/like
 * @param {string} req.params.jobId - ID MongoDB de la fiche métier
 * @returns {201} { message, jobId, jobName, profileLikes, interaction }
 * @returns {400} Identifiant invalide (CastError)
 * @returns {401} Non authentifié
 * @returns {404} Fiche métier introuvable
 * @returns {409} Utilisateur a déjà liké ce métier
 * @returns {500} { message, error }
 */
export const addLike = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const userId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Métier introuvable" });
    }

    // Délégation au modèle : anti-doublon, création Interaction, incrémentation likes
    const { interaction, updatedObject: updatedJob } = await job.addLike(userId);

    res.status(201).json({
      message: "Like ajouté avec succès sur le profil du métier",
      jobId: updatedJob._id,
      jobName: updatedJob.name,
      profileLikes: updatedJob.likes,
      interaction
    });

  } catch (error) {
    // Cas 1 : L'utilisateur a déjà liké ce métier (détecté dans le modèle)
    if (error.message === "ALREADY_LIKED") {
      return res.status(409).json({ message: "Vous avez déjà liké ce métier" });
    }
    // Cas 2 : L'identifiant MongoDB est mal formé
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    // Cas 3 : Erreur inattendue (ex:problème réseau)
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout du like",
      error: error.message
    });
  }
};

/**
 * @description Incrémente le compteur de candidatures d'une fiche métier.
 * @usedBy routes/jobRoutes.js — PUT /jobs/:jobId/apply
 * @param {string} req.params.jobId - ID MongoDB de la fiche métier
 * @returns {200} { message, jobId, jobName, profileApplicants }
 * @returns {404} Fiche métier introuvable
 * @returns {500} { message, error }
 */
export const addApplicant = async (req, res) => {
  try {
    const { jobId } = req.params;

    // findByIdAndUpdate évite une double requête (findById + save)
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { $inc: { applicants: 1 } },  // $inc ajoute 1 au champ "applicants" directement en base
      { new: true }                  // { new: true } retourne le document après modification
    );

    if (!updatedJob) {
      return res.status(404).json({
        message: "Métier introuvable"
      });
    }

    res.status(200).json({
      message: "Candidature ajoutée avec succès",
      jobId: updatedJob._id,
      jobName: updatedJob.name,
      profileApplicants: updatedJob.applicants
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout de la candidature",
      error: error.message
    });
  }
};

/**
 * @description Met à jour les informations textuelles d'une fiche métier (nom, code ROME, description, niveau d'études).
 * @usedBy routes/jobRoutes.js — PUT /jobs/:jobId/details
 * @param {string}  req.params.jobId - ID MongoDB de la fiche métier
 * @param {string}  [req.body.name] - Nouveau nom du métier
 * @param {string}  [req.body.romeCode] - Nouveau code ROME
 * @param {string}  [req.body.description] - Nouvelle description
 * @param {string}  [req.body.studyLevel] - Nouveau niveau d'études requis
 * @returns {200} { message, job }
 * @returns {404} Fiche métier introuvable
 * @returns {500} { message, error }
 */
export const updateJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Métier introuvable"
      });
    }

    const updatedJob = await job.updateDetails(req.body);

    const jobLog = new ActivityLog({
      actionType: "UPDATE_JOB_DETAILS",
      description: `Métier mis à jour : ${updatedJob.name} (${updatedJob._id})`
    });

    await jobLog.save();
    await jobLog.exportLogEntry();

    res.status(200).json({
      message: "Métier mis à jour avec succès",
      job: updatedJob
    });

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Retourne les statistiques d'une fiche métier (vues, likes, candidatures).
 * @usedBy routes/jobRoutes.js — GET /jobs/:jobId/statistics
 * @param {string} req.params.jobId - ID MongoDB de la fiche métier
 * @returns {200} { jobId, jobName, romeCode, views, likes, applies }
 * @returns {404} Fiche métier introuvable
 * @returns {500} { message, error }
 */
export const getJobStatistics = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Métier introuvable"
      });
    }

    const statistics = await job.getStatistics();

    res.status(200).json(statistics);

  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};

/**
 * @description Retire le like d'un utilisateur authentifié sur une fiche métier.
 * @usedBy routes/jobRoutes.js — DELETE /jobs/:jobId/like
 * @param {string} req.params.jobId - ID MongoDB de la fiche métier
 * @returns {200} { message, likesActuels, interaction }
 * @returns {400} Identifiant invalide (CastError)
 * @returns {401} Non authentifié
 * @returns {404} Fiche métier introuvable ou like non trouvé
 * @returns {500} { message, error }
 */
export const revokeLike = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const userId = req.user.userId;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Métier introuvable" });
    }

    // Délégation au modèle : vérification like existant, suppression Interaction, décrémentation
    const { updatedJob, interactionSupprimee } = await job.revokeLike(userId);

    return res.status(200).json({
      message: "Like retiré du métier avec succès",
      likesActuels: updatedJob.likes,
      interaction: interactionSupprimee
    });

  } catch (error) {
    // Cas 1 : L'utilisateur n'avait pas liké ce métier
    if (error.message === "NO_LIKE_FOUND") {
      return res.status(404).json({ message: "Vous n'avez pas liké ce métier" });
    }
    // Cas 2 : L'identifiant est mal formé
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    // Cas 3 : Erreur inattendue (ex: problème réseau)
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
