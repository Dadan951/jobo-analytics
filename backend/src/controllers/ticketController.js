 /**
  * @module controllers/ticketController
  * @description Gestion des tickets de support : création et consultation.
  *
  * @usedBy routes/ticketRoutes.js — expose les endpoints /tickets/*
  * @uses models/Ticket.js — modèle de ticket de support
  */

import Ticket from "../models/Ticket.js";

/**
 * @description Crée un ticket de support pour l'utilisateur connecté.
 * @usedBy routes/ticketRoutes.js — POST /tickets
 * @param {string} req.body.title - Titre du ticket
 * @param {string} req.body.description - Description du problème
 * @returns {201} { ticket }
 * @returns {400} Titre ou description manquant
 * @returns {500} { message, error }
 */
export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;

    if (!title || !description) {
      return res.status(400).json({ message: "Titre et description requis" });
    }

    const ticket = await Ticket.create({ title, description, userId });
    res.status(201).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Retourne tous les tickets de l'utilisateur connecté, du plus récent au plus ancien.
 * @usedBy routes/ticketRoutes.js — GET /tickets
 * @returns {200} { tickets: Ticket[] }
 * @returns {500} { message, error }
 */
export const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tickets = await Ticket.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

/**
 * @description Retourne un ticket par son ID, uniquement s'il appartient à l'utilisateur connecté.
 * @usedBy routes/ticketRoutes.js — GET /tickets/:id
 * @param {string} req.params.id - ID MongoDB du ticket
 * @returns {200} { ticket }
 * @returns {404} Ticket introuvable ou n'appartient pas à l'utilisateur
 * @returns {500} { message, error }
 */
export const getTicketById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const ticket = await Ticket.findOne({ _id: req.params.id, userId });
    if (!ticket) return res.status(404).json({ message: "Ticket introuvable" });
    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
