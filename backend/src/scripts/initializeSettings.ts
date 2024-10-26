/** Autor: @elsoprimeDev */

import { GeneralSettingsModel } from '../models/Setting/GeneralSettings';
import { SecuritySettingsModel } from '../models/Setting/SecuritySettings';
import { ActiveModulesModel } from '../models/Setting/ActiveModule';
import colors from 'colors';

export async function initializeGeneralSettings() {
  try {
    const existingSettings = await GeneralSettingsModel.findOne();

    if (existingSettings) {
      console.log(colors.bgWhite.cyan.bold('La configuración general ya existe.'));
      return existingSettings.id;
    } else {
      const newSettings = await GeneralSettingsModel.create({
        siteName: 'Plataforma de Gestión',
        adminEmail: 'admin@elsomedia.cl',
        enableUserRegistration: true,
        defaultLanguage: 'es',
        timezone: 'America/Santiago',
      });
      console.log(colors.green.bold('Configuración general inicializada exitosamente.'));
      return newSettings.id;
    }
  } catch (error) {
    console.error(colors.bgYellow.red('Error al inicializar la configuración general:'), error);
    throw error;
  }
}

export async function initializeSecuritySettings() {
  try {
    const existingSecuritySettings = await SecuritySettingsModel.findOne();

    if (existingSecuritySettings) {
      console.log(colors.bgWhite.cyan.bold('La configuración de seguridad ya existe.'));
      return existingSecuritySettings.id;
    } else {
      const newSecuritySettings = await SecuritySettingsModel.create({
        passwordPolicy: {
          minLength: 8,
          requireNumbers: true,
          requireSpecialChars: true,
        },
        accountLockout: {
          threshold: 5,
          lockoutDuration: 30,
        },
      });
      console.log(colors.green.bold('Configuración de seguridad inicializada exitosamente.'));
      return newSecuritySettings.id;
    }
  } catch (error) {
    console.error(colors.bgYellow.red('Error al inicializar la configuración de seguridad:'), error);
    throw error;
  }
}

export async function initializeActiveModules() {
  try {
    const existingActiveModules = await ActiveModulesModel.findOne();

    if (existingActiveModules) {
      console.log(colors.bgWhite.cyan.bold('Los módulos activos ya están definidos.'));
      return existingActiveModules.id;
    } else {
      const newActiveModules = await ActiveModulesModel.create({
        companiesModule: true,
        installationsModule: true,
        generatorsModule: true,
        collaboratorsModule: true,
        inventoriesModule: true,
        operationsModule: true,
        activitiesModule: true,
      });
      console.log(colors.green.bold('Módulos activos inicializados exitosamente.'));
      return newActiveModules.id;
    }
  } catch (error) {
    console.error(colors.bgYellow.red('Error al inicializar los módulos activos:'), error);
    throw error;
  }
}

export async function initializeApplication() {
  try {
    await initializeGeneralSettings();
    await initializeSecuritySettings();
    await initializeActiveModules();
    console.log(colors.green.bold('Aplicación inicializada correctamente.'));
  } catch (error) {
    console.error(colors.bgYellow.red('Error al inicializar la aplicación:'), error);
  }
}
