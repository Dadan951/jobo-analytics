/**
 * @module server
 * @description Point d'entrée principal du serveur Express.
 * Configure le CORS, monte toutes les routes, connecte MongoDB et démarre l'écoute HTTP.
 *
 * @uses config/db.js — connectDB (connexion MongoDB)
 * @uses routes/* — toutes les routes de l'API
 * @uses middlewares/errorMiddleware.js — errorHandler (gestionnaire d'erreurs centralisé)
 *
 * Routes montées :
 * - /auth              → authRoutes
 * - /jobs              → jobRoutes
 * - /contents          → contentRoutes
 * - /activity-logs     → activityLogRoutes
 * - /tickets           → ticketRoutes
 * - /admin             → adminRoutes
 * - /scans             → objetScanRoutes
 * - /physical-objects  → physicalObjectRoutes
 * - /subscriptions     → subscriptionRoutes
 * - /webhook           → webhookRoutes
 */
import dotenv from "dotenv";
dotenv.config();

import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import contentRoutes from "./src/routes/contentRoutes.js";
import activityLogRoutes from "./src/routes/activityLogRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

import objetScanRoutes from "./src/routes/objetScanRoutes.js";
import physicalObjectRoutes from "./src/routes/physicalObjectRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import { handleWebhook } from "./src/controllers/subscriptionController.js";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.trim()))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.post("/subscriptions/webhook", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);
app.use("/jobs", jobRoutes);
app.use("/contents", contentRoutes);
app.use("/activity-logs", activityLogRoutes);
app.use("/tickets", ticketRoutes);
app.use("/admin", adminRoutes);
app.use("/scans", objetScanRoutes);
app.use("/physical-objects", physicalObjectRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/webhook", webhookRoutes);

// Middleware d'erreur centralisé — doit être enregistré après toutes les routes
app.use(errorHandler);

connectDB();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré et en écoute sur http://localhost:${PORT}`);
});