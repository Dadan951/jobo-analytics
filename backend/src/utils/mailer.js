/**
 * @module utils/mailer
 * @description Envoi d'e-mails transactionnels via Nodemailer (Gmail SMTP) :
 * code de vérification 2FA, réinitialisation de mot de passe, notifications.
 *
 * @usedBy controllers/authController.js — envoi du code 2FA et du code de réinitialisation
 * @usedBy controllers/notificationController.js — envoi des notifications par e-mail
 */

import nodemailer from "nodemailer";

/**
 * @description Envoie le code de vérification 2FA à l'adresse e-mail de l'utilisateur.
 * @usedBy controllers/authController.js — login()
 */
export const sendTwoFACode = async (toEmail, code) => {
  // Transporter créé ici pour lire les variables d'environnement après dotenv.config()
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"JOBO Analytics" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Votre code de vérification JOBO Analytics",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#1a1d2e;margin-bottom:8px;">Vérification en deux étapes</h2>
        <p style="color:#555;margin-bottom:24px;">Utilisez le code ci-dessous pour finaliser votre connexion. Il expire dans <strong>10 minutes</strong>.</p>
        <div style="background:#1a1d2e;color:#fff;font-size:36px;font-weight:800;letter-spacing:12px;text-align:center;padding:20px;border-radius:10px;">
          ${code}
        </div>
        <p style="color:#999;font-size:12px;margin-top:24px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });
};


/**
 * @description Envoie le code de réinitialisation de mot de passe à l'adresse e-mail de l'utilisateur.
 * @usedBy controllers/authController.js — forgotPassword()
 */
export const sendPasswordResetCode = async (toEmail, code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"JOBO Analytics" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Réinitialisation de votre mot de passe - JOBO Analytics",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#1a1d2e;margin-bottom:8px;">Réinitialisation du mot de passe</h2>
        <p style="color:#555;margin-bottom:24px;">Utilisez le code ci-dessous pour réinitialiser votre mot de passe. Il expire dans <strong>10 minutes</strong>.</p>
        <div style="background:#1a1d2e;color:#fff;font-size:36px;font-weight:800;letter-spacing:12px;text-align:center;padding:20px;border-radius:10px;">
          ${code}
        </div>
        <p style="color:#999;font-size:12px;margin-top:24px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      </div>
    `,
  });
};

/**
 * @description Envoie un e-mail de notification générique (titre + corps) à l'utilisateur.
 * @usedBy controllers/notificationController.js — createNotification()
 */
export const sendNotificationEmail = async (toEmail, title, message) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"JOBO Analytics" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: title,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#1a1d2e;margin-bottom:8px;">${title}</h2>
        <p style="color:#555;">${message}</p>
        <p style="color:#999;font-size:12px;margin-top:24px;">Cet email a été envoyé automatiquement par JOBO Analytics.</p>
      </div>
    `,
  });
};
