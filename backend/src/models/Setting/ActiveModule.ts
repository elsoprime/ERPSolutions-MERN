/** Autor: @elsoprimeDev */

import { Schema, model, Document } from "mongoose";

export interface IActiveModules extends Document {
  companiesModule: boolean;
  installationsModule: boolean;
  generatorsModule: boolean;
  collaboratorsModule: boolean;
  inventoriesModule: boolean;
  operationsModule: boolean;
  activitiesModule: boolean;
}

const ActiveModulesSchema = new Schema<IActiveModules>({
  companiesModule: { type: Boolean, default: true },
  installationsModule: { type: Boolean, default: true },
  generatorsModule: { type: Boolean, default: true },
  collaboratorsModule: { type: Boolean, default: true },
  inventoriesModule: { type: Boolean, default: true },
  operationsModule: { type: Boolean, default: true },
  activitiesModule: { type: Boolean, default: true },
}, { timestamps: true });

export const ActiveModulesModel = model<IActiveModules>('ActiveModules', ActiveModulesSchema);

  