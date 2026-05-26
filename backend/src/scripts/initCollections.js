/**
 * @module scripts/initCollections
 * @description Script d'initialisation des collections MongoDB.
 * À exécuter une seule fois lors de la mise en place de l'environnement.
 *
 * @uses mongoose — connexion à MongoDB
 * @uses models/Organization, User, Content, Interaction, Report, Ticket
 * @uses process.env.MONGODB_URI — URI de connexion
 *
 * Commande : npm run init-db
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Content from "../models/Content.js";
import Interaction from "../models/Interaction.js";
import Report from "../models/Report.js";
import Ticket from "../models/Ticket.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI introuvable. Vérifiez votre fichier .env");
  process.exit(1);
}

await mongoose.connect(uri);
console.log(" MongoDB connecté !");

await Organization.createCollection();
await User.createCollection();
await Content.createCollection();
await Interaction.createCollection();
await Report.createCollection();
await Ticket.createCollection();

console.log(" Collections créées avec succès !");
process.exit();
