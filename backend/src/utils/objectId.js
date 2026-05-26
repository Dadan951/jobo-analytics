/**
 * @module utils/objectId
 * @description Utilitaire de validation des identifiants MongoDB ObjectId.
 *
 * @usedBy Tout contrôleur nécessitant de valider un ID reçu en paramètre
 * @uses mongoose — Types.ObjectId.isValid
 */

import mongoose from "mongoose";

/**
 * @description Vérifie si une valeur est un ObjectId MongoDB valide. Retourne true si valide, false sinon.
 * @param {*} value - La valeur à tester
 * @returns {boolean} true si ObjectId valide, false sinon
 */
export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
