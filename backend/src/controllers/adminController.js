/**
 * @module controllers/adminController
 * @description Gestion des opérations réservées aux administrateurs :
 * consultation et modification des utilisateurs, gestion des tickets, statistiques globales.
 *
 * @usedBy routes/adminRoutes.js — expose les endpoints /admin/*
 * @uses models/User.js — lecture et modification des comptes utilisateurs
 * @uses models/Ticket.js — lecture et modification des tickets de support
 * @uses models/ActivityLog.js — lecture des logs récents pour les statistiques
 */

import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import ActivityLog from "../models/ActivityLog.js";
import Organization from "../models/Organization.js";


// --- USERS ---

/**
 * @description Récupère la liste de tous les utilisateurs (sans leur mot de passe).
 * @usedBy routes/adminRoutes.js — GET /admin/users
 * @returns {200} { users: User[] } — triés du plus récent au plus ancien
 * @returns {500} { message, error }
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Modifie le rôle d'un utilisateur (ADMIN ou USER).
 * @usedBy routes/adminRoutes.js — PUT /admin/users/:id/role
 * @param {string} req.params.id - ID MongoDB de l'utilisateur
 * @param {string} req.body.role - "ADMIN" ou "USER"
 * @returns {200} { user } — utilisateur mis à jour sans passwordHash
 * @returns {400} Rôle invalide
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["ADMIN", "USER"].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: "-passwordHash" }
    );
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Supprime un utilisateur. Un admin ne peut pas supprimer son propre compte.
 * @usedBy routes/adminRoutes.js — DELETE /admin/users/:id
 * @param {string} req.params.id - ID MongoDB de l'utilisateur à supprimer
 * @returns {200} { message }
 * @returns {400} Tentative de suppression de son propre compte
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message, error }
 */
export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user.userId;
    if (req.params.id === adminId) {
      return res.status(400).json({ message: "Impossible de supprimer votre propre compte" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.status(200).json({ message: "Utilisateur supprime" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// --- TICKETS ---

/**
 * @description Récupère tous les tickets avec les infos de l'utilisateur associé.
 * @usedBy routes/adminRoutes.js — GET /admin/tickets
 * @returns {200} { tickets: Ticket[] } — avec userId.email et userId.role, triés du plus récent
 * @returns {500} { message, error }
 */
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "email role")
      .sort({ createdAt: -1 });
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Met à jour le statut d'un ticket (OPEN ou CLOSED).
 * @usedBy routes/adminRoutes.js — PUT /admin/tickets/:id/status
 * @param {string} req.params.id - ID MongoDB du ticket
 * @param {string} req.body.status - "OPEN" ou "CLOSED"
 * @returns {200} { ticket } — ticket mis à jour avec userId populé
 * @returns {400} Statut invalide
 * @returns {404} Ticket introuvable
 * @returns {500} { message, error }
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["OPEN", "CLOSED"].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "email role");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Ajoute une réponse admin à un ticket.
 * @usedBy routes/adminRoutes.js — POST /admin/tickets/:id/reply
 * @param {string} req.params.id - ID MongoDB du ticket
 * @param {string} req.body.reply - Texte de la réponse admin
 * @returns {200} { ticket } — ticket avec adminReply et adminRepliedAt mis à jour
 * @returns {400} Réponse manquante
 * @returns {404} Ticket introuvable
 * @returns {500} { message, error }
 */
export const replyToTicket = async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: "Reponse requise" });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { adminReply: reply, adminRepliedAt: new Date() },
      { new: true }
    ).populate("userId", "email role");
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


// --- STATS ---

/**
 * @description Lie une organisation à une catégorie JOBO via son ID.
 * @usedBy routes/adminRoutes.js — PUT /admin/organizations/:id/jobo-category
 * @param {string} req.params.id - ID MongoDB de l'organisation
 * @param {string} req.body.joboCategory - Catégorie JOBO à associer
 * @returns {200} { message, org }
 * @returns {400} joboCategory manquant
 * @returns {404} Organisation introuvable
 * @returns {500} { message, error }
 */
export const linkOrgToJoboCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { joboCategory } = req.body;
    if (!joboCategory) return res.status(400).json({ message: "joboCategory requis" });
    const org = await Organization.findByIdAndUpdate(id, { joboCategory }, { new: true });
    if (!org) return res.status(404).json({ message: "Organisation introuvable" });
    res.json({ message: "Organisation liée à la filière JOBO", org });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Retourne les statistiques globales : nb utilisateurs, tickets, tickets ouverts, logs récents.
 * @usedBy routes/adminRoutes.js — GET /admin/stats
 * @returns {200} { totalUsers, totalTickets, openTickets, recentLogs }
 * @returns {500} { message, error }
 */
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalTickets, openTickets, recentLogs] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: "OPEN" }),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate("userId", "email"),
    ]);
    res.status(200).json({ totalUsers, totalTickets, openTickets, recentLogs });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
