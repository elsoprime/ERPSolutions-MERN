/** Autor: @elsoprimeDev */

import { IGeneralSettings, GeneralSettingsModel } from '../models/Setting/GeneralSettings';
import { ISecuritySettings, SecuritySettingsModel } from '../models/Setting/SecuritySettings';
import { IActiveModules, ActiveModulesModel } from '../models/Setting/ActiveModule';

// General Settings Service
export const getGeneralSettingsService = async (): Promise<IGeneralSettings | null> => {
  return await GeneralSettingsModel.findOne();
};

export const updateGeneralSettingsService = async (settings: Partial<IGeneralSettings>): Promise<IGeneralSettings | null> => {
  return await GeneralSettingsModel.findOneAndUpdate({}, settings, { new: true });
};

// Security Settings Service
export const getSecuritySettingsService = async (): Promise<ISecuritySettings | null> => {
  return await SecuritySettingsModel.findOne();
};

export const updateSecuritySettingsService = async (settings: Partial<ISecuritySettings>): Promise<ISecuritySettings | null> => {
  return await SecuritySettingsModel.findOneAndUpdate({}, settings, { new: true });
};

// Active Modules Service
export const getActiveModulesService = async (): Promise<IActiveModules | null> => {
  return await ActiveModulesModel.findOne();
};

export const updateActiveModulesService = async (modules: Partial<IActiveModules>): Promise<IActiveModules | null> => {
  return await ActiveModulesModel.findOneAndUpdate({}, modules, { new: true });
};
