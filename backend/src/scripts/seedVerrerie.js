/**
 * @module scripts/seedVerrerie
 * @description Peuple la collection VerrerieReference avec la liste des entreprises
 * verrerie définies dans verrerieData.js.
 *
 * Commande : npm run seed:verrerie
 * Ou via l'API : POST /admin/seed-verrerie (nécessite token ADMIN)
 *
 * @usedBy controllers/adminController.js — déclenché via l'endpoint /admin/seed-verrerie
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import VerrerieReference from "../models/VerrerieReference.js";
import { VERRERIE_SEED_DATA } from "./verrerieData.js";

const seed = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error("Erreur : variable MONGODB_URI absente dans .env");
    process.exit(1);
  }

  console.log("Connexion a MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log("Connecte\n");

  const { deletedCount } = await VerrerieReference.deleteMany({});
  console.log(`${deletedCount} entree(s) supprimee(s)\n`);

  let inserted = 0;
  for (const entry of VERRERIE_SEED_DATA) {
    await VerrerieReference.create(entry);
    inserted++;
    process.stdout.write(`\r${inserted}/${VERRERIE_SEED_DATA.length} inseree(s)...`);
  }

  console.log(`\n\nSeed termine : ${inserted} entreprises importees dans VerrerieReference`);

  const categories = VERRERIE_SEED_DATA.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});

  console.log("\nRepartition par categorie :");
  Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat.padEnd(30)} ${count}`));

  await mongoose.disconnect();
  console.log("\nDeconnecte. Termine.");
};

seed().catch(err => {
  console.error("Erreur seed :", err.message);
  mongoose.disconnect();
  process.exit(1);
});
