/**
 * Configuración de Resend para envío de emails
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import { Resend } from "resend";

if (!process.env.API_KEY_RESEND) {
  console.warn(
    "⚠️ WARNING: API_KEY_RESEND no está configurada. Las funciones de email estarán deshabilitadas."
  );
}

export const resend = process.env.API_KEY_RESEND
  ? new Resend(process.env.API_KEY_RESEND)
  : null;

// Configuración por defecto para los emails
export const EMAIL_CONFIG = {
  from: "ERPSolutions <onboarding@resend.dev>", // Usar el dominio verificado de Resend
  replyTo: "noreply@erpsolutions.com",
};
