/**
 * @module controllers/physicalObjectController
 * @description Gestion des interactions sur les objets physiques : scans et likes.
 *
 * @usedBy routes/physicalObjectRoutes.js — expose les endpoints /physical-objects/*
 * @uses models/PhysicalObject.js — modèle avec méthodes incrementScanCount, addLike, revokeLike
 */

import PhysicalObject from "../models/PhysicalObject.js";

/**
 * @description Incrémente le compteur de scans d'un objet physique.
 * @usedBy routes/physicalObjectRoutes.js — PUT /physical-objects/:physicalObjectId/scan
 * @param {string} req.params.physicalObjectId - ID MongoDB de l'objet physique
 * @returns {200} { message, physicalObjectId, scanCount }
 * @returns {404} Objet physique introuvable
 * @returns {500} { message, error }
 */
export const incrementScanCount = async (req, res) => {
  try {
    const { physicalObjectId } = req.params;

    const updatedObject = await PhysicalObject.findById(physicalObjectId);

    if (!updatedObject) {
      return res.status(404).json({
        message: "Objet physique introuvable"
      });
    }

    const result = await updatedObject.incrementScanCount();

    res.status(200).json({
      message: "Scan enregistré avec succès",
      physicalObjectId: result._id,
      scanCount: result.scanCount
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de l'enregistrement du scan",
      error: error.message
    });
  }
};

/**
 * @description Ajoute un like sur un objet physique.
 * @usedBy routes/physicalObjectRoutes.js — PUT /physical-objects/:physicalObjectId/like
 * @param {string} req.params.physicalObjectId - ID MongoDB de l'objet physique
 * @returns {200} { message, physicalObjectId, likes }
 * @returns {404} Objet physique introuvable
 * @returns {500} { message, error }
 */
export const addLike = async (req, res) => {
  try {
    const { physicalObjectId } = req.params;

    const updatedObject = await PhysicalObject.findById(physicalObjectId);

    if (!updatedObject) {
      return res.status(404).json({
        message: "Objet physique introuvable"
      });
    }

    const result = await updatedObject.addLike();

    res.status(200).json({
      message: "Like ajouté avec succès",
      physicalObjectId: result._id,
      likes: result.likes
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur lors de l'ajout du like",
      error: error.message
    });
  }
};

/**
 * @description Retire le like d'un utilisateur sur un objet physique.
 * @usedBy routes/physicalObjectRoutes.js — DELETE /physical-objects/:physicalObjectId/like
 * @param {string} req.params.physicalObjectId - ID MongoDB de l'objet physique
 * @returns {200} { message, likesActuels }
 * @returns {400} Identifiant invalide (CastError)
 * @returns {401} Non authentifié
 * @returns {404} Objet introuvable ou aucun like à retirer
 * @returns {500} { message, error }
 */
export const revokeLike = async (req, res) => {
  try {
    const { physicalObjectId } = req.params;

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const userId = req.user.userId;

    const physicalObject = await PhysicalObject.findById(physicalObjectId);

    if (!physicalObject) {
      return res.status(404).json({ message: "Objet physique introuvable" });
    }

    const updatedObject = await physicalObject.revokeLike(userId);

    return res.status(200).json({
      message: "Like retiré de l'objet physique",
      likesActuels: updatedObject.likes
    });

  } catch (error) {
    // Cas 1 : L'utilisateur n'avait pas liké cet objet
    if (error.message === "NO_LIKE_FOUND") {
      return res.status(404).json({ message: "Aucun like à retirer sur cet objet" });
    }
    // Cas 2 : L'identifiant est mal formé
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Identifiant invalide" });
    }
    // Cas 3 : Erreur inattendue
    return res.status(500).json({
      message: "Erreur serveur",
      error: error.message
    });
  }
};
