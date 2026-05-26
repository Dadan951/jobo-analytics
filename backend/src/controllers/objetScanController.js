/**
 * @module controllers/objetScanController
 * @description Récupération des détails d'un scan d'objet physique.
 *
 * @usedBy routes/objetScanRoutes.js — expose les endpoints /scans/*
 * @uses models/ObjetScan.js — modèle avec la méthode getScanDetails
 */

import ObjetScan from "../models/ObjetScan.js";

/**
 * @description Retourne les détails d'un scan à partir de son identifiant.
 * @usedBy routes/objetScanRoutes.js — GET /scans/:scanId/details
 * @param {string} req.params.scanId - ID du scan (string, pas ObjectId)
 * @returns {200} { scanId, scanDate, location, scan, likes, createdAt, updatedAt }
 * @returns {404} Scan introuvable
 * @returns {500} { message, error }
 */
export const getScanDetails = async (req, res) => {
  try {
    const { scanId } = req.params;

    const scan = await ObjetScan.findById(scanId);

    if (!scan) {
      return res.status(404).json({ message: "Scan introuvable" });
    }

    const details = await scan.getScanDetails();

    res.status(200).json(details);

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
