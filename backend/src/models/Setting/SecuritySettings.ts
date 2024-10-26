/** Autor: @elsoprimeDev */

import { Schema, model, Document } from "mongoose";

export interface IPasswordPolicy {
  minLength: number;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface IAccountLockout {
  threshold: number;
  lockoutDuration: number; // En minutos
}

export interface ISecuritySettings extends Document {
  passwordPolicy: IPasswordPolicy;
  accountLockout: IAccountLockout;
}

const SecuritySettingsSchema = new Schema<ISecuritySettings>({
  passwordPolicy: {
    minLength: { type: Number, default: 8 },
    requireNumbers: { type: Boolean, default: true },
    requireSpecialChars: { type: Boolean, default: true },
  },
  accountLockout: {
    threshold: { type: Number, default: 5 },
    lockoutDuration: { type: Number, default: 30 },
  },
}, { timestamps: true });

export const SecuritySettingsModel = model<ISecuritySettings>('SecuritySettings', SecuritySettingsSchema);
