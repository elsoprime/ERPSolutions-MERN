/** Autor: @elsoprimeDev */

import { Schema, model, Document } from "mongoose";

export interface IGeneralSettings extends Document {
  siteName: string;
  adminEmail: string;
  enableUserRegistration: boolean;
  defaultLanguage: string;
  timezone: string;
  [key: string]: string | boolean | unknown; // Cambiar `any` por tipos más seguros
}

const GeneralSettingsSchema = new Schema<IGeneralSettings>(
  {
    siteName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    enableUserRegistration: { type: Boolean, default: true },
    defaultLanguage: { type: String, default: "es" },
    timezone: { type: String, default: "America/Santiago" },
  },
  { timestamps: true }
);

export const GeneralSettingsModel = model<IGeneralSettings>(
  "GeneralSettings",
  GeneralSettingsSchema
);