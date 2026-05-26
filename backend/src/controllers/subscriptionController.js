/**
 * @module controllers/subscriptionController
 * @description Gestion des abonnements Stripe : création de session de paiement,
 * traitement des webhooks, consultation et annulation de l'abonnement en cours.
 *
 * @usedBy routes/subscriptionRoutes.js — expose les endpoints /subscriptions/*
 * @uses models/User.js — lecture et mise à jour du plan et du statut d'abonnement
 */

import Stripe from "stripe";
import User from "../models/User.js";

let _stripe;
const getStripe = () => {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};

const PLANS = {
  TPE:                   { name: "Plan TPE & Indépendants — Jobo Analytics",           price: 1999,  interval: "month" },
  PME:                   { name: "Plan PME & Organismes de formation — Jobo Analytics", price: 2999,  interval: "month" },
  GRAND_GROUPE:          { name: "Plan Grand groupe — Jobo Analytics",                 price: 9999,  interval: "month" },
  ORGANISATION_PATRONALE:{ name: "Plan Organisation patronale — Jobo Analytics",       price: 19999, interval: "month" },
};

/**
 * @description Crée une session de paiement Stripe Checkout pour le plan demandé.
 * @usedBy routes/subscriptionRoutes.js — POST /subscriptions/checkout
 * @param {string} req.body.plan - "TPE" | "PME" | "GRAND_GROUPE" | "ORGANISATION_PATRONALE"
 * @param {string} [req.body.from] - Page d'origine pour la redirection success (ex: "profile")
 * @returns {200} { url } — URL de redirection vers Stripe Checkout
 * @returns {400} Plan invalide
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message }
 */
export const createCheckoutSession = async (req, res) => {
  try {
    const { plan, from } = req.body;
    const userId = req.user.userId;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Plan invalide. Valeurs acceptées : TPE, PME, GRAND_GROUPE, ORGANISATION_PATRONALE" });
    }

    const user = await User.findById(userId).select("+stripeCustomerId");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({ email: user.email, metadata: { userId: userId.toString() } });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: PLANS[plan].name },
          unit_amount: PLANS[plan].price,
          recurring: { interval: PLANS[plan].interval },
        },
        quantity: 1,
      }],
      success_url: `${frontendUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&from=${from || 'profile'}`,
      cancel_url:  `${frontendUrl}/pricing`,
      metadata: { userId: userId.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Reçoit et traite les événements Stripe (paiement confirmé, abonnement modifié/résilié, échec de paiement).
 * @usedBy routes/subscriptionRoutes.js — POST /subscriptions/webhook
 * @param {Buffer} req.body - Corps brut de la requête (raw body requis pour vérification Stripe)
 * @param {string} req.headers['stripe-signature'] - Signature Stripe pour validation
 * @returns {200} { received: true }
 * @returns {400} Signature invalide ou événement mal formé
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, plan } = session.metadata;
      await User.findByIdAndUpdate(userId, {
        subscriptionPlan: plan,
        subscriptionStatus: "ACTIVE",
        stripeSubscriptionId: session.subscription,
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      if (sub.status === "active") {
        await User.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          { subscriptionStatus: "ACTIVE" }
        );
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await User.findOneAndUpdate(
        { stripeSubscriptionId: sub.id },
        { subscriptionPlan: "FREE", subscriptionStatus: "NONE", stripeSubscriptionId: null }
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      await User.findOneAndUpdate(
        { stripeCustomerId: invoice.customer },
        { subscriptionStatus: "CANCELLED" }
      );
      break;
    }
  }

  res.json({ received: true });
};

/**
 * @description Retourne le plan et le statut d'abonnement de l'utilisateur connecté.
 * @usedBy routes/subscriptionRoutes.js — GET /subscriptions/my
 * @returns {200} { plan: string, status: string }
 * @returns {404} Utilisateur introuvable
 * @returns {500} { message }
 */
export const getMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("subscriptionPlan subscriptionStatus stripeSubscriptionId");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    res.json({
      plan:   user.subscriptionPlan   || "FREE",
      status: user.subscriptionStatus || "NONE",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Vérifie directement la session Stripe et met à jour l'abonnement sans attendre le webhook.
 * @usedBy routes/subscriptionRoutes.js — GET /subscriptions/verify-session
 * @param {string} req.query.session_id - ID de la session Stripe Checkout
 * @returns {200} { plan, status: "ACTIVE" } si paiement confirmé, sinon { plan, status } courant
 * @returns {400} session_id manquant
 * @returns {403} Session n'appartient pas à l'utilisateur
 * @returns {500} { message }
 */
export const verifyCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    const userId = req.user.userId;

    if (!session_id) return res.status(400).json({ message: "session_id requis" });

    // Récupérer la session Stripe avec l'objet subscription étendu
    const session = await getStripe().checkout.sessions.retrieve(session_id, {
      expand: ["subscription"],
    });

    console.log(`[verifyCheckoutSession] session.status=${session.status} payment_status=${session.payment_status} userId_meta=${session.metadata?.userId} userId_req=${userId}`);

    // Vérifier que la session appartient bien à cet utilisateur
    if (session.metadata?.userId !== userId.toString()) {
      return res.status(403).json({ message: "Session invalide" });
    }

    // Stripe met status='complete' dès que le paiement est accepté
    // payment_status peut être 'paid' ou 'no_payment_required' (trial, etc.)
    const paymentOk =
      session.status === "complete" ||
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    if (paymentOk) {
      const { plan } = session.metadata;

      // Récupérer l'ID de l'abonnement Stripe (string ou objet selon expand)
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      await User.findByIdAndUpdate(userId, {
        subscriptionPlan:    plan,
        subscriptionStatus:  "ACTIVE",
        stripeSubscriptionId: subId,
      });

      console.log(`[verifyCheckoutSession] ✅ DB mise à jour : userId=${userId} plan=${plan}`);
      return res.json({ plan, status: "ACTIVE" });
    }

    // Paiement pas encore confirmé → retourner l'état actuel
    console.log(`[verifyCheckoutSession] ⚠️ Paiement non confirmé (status=${session.status})`);
    const user = await User.findById(userId).select("subscriptionPlan subscriptionStatus");
    res.json({
      plan:   user.subscriptionPlan   || "FREE",
      status: user.subscriptionStatus || "NONE",
    });
  } catch (error) {
    console.error("[verifyCheckoutSession] ❌ Erreur:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @description Annule l'abonnement Stripe actif et repasse l'utilisateur au plan FREE.
 * @usedBy routes/subscriptionRoutes.js — DELETE /subscriptions/my
 * @returns {200} { message: "Abonnement annulé avec succès" }
 * @returns {400} Aucun abonnement actif trouvé
 * @returns {500} { message }
 */
export const cancelMySubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("+stripeSubscriptionId");
    if (!user?.stripeSubscriptionId) {
      return res.status(400).json({ message: "Aucun abonnement actif trouvé" });
    }

    await getStripe().subscriptions.cancel(user.stripeSubscriptionId);

    await User.findByIdAndUpdate(req.user.userId, {
      subscriptionPlan: "FREE",
      subscriptionStatus: "CANCELLED",
      stripeSubscriptionId: null,
    });

    res.json({ message: "Abonnement annulé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};