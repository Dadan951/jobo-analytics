import mongoose from "mongoose";

/**
 * @module config/db
 * @description Gestion de la connexion à la base de données MongoDB.
 * Fournit la fonction d'initialisation de la connexion utilisée au démarrage du serveur.
 *
 * @usedBy server.js — importé au démarrage pour établir la connexion
 * @uses mongoose (npm) — ODM pour MongoDB
 * @uses dotenv (via process.env) — fournit MONGODB_URI
 */

/**
 * @description Établit la connexion à MongoDB via Mongoose. Termine le processus (exit code 1) si la connexion échoue.
 * @usedBy server.js — appelé au démarrage avant le lancement du serveur HTTP
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connecté");
  } catch (error) {
    console.error("Erreur connexion MongoDB:", error);
    process.exit(1);
  }
};
