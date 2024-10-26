/** Autor: @elsoprimeDev */

import { Request, Response } from 'express';
import { GeneralSettingsModel, IGeneralSettings } from '../models/Setting/GeneralSettings';

// General Settings Controller
export const getGeneralSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const settings: IGeneralSettings | null = await GeneralSettingsModel.findOne({});
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving settings', error });
  }
};

export const updateGeneralSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Validar si el ID es proporcionado
    if (!id) {
      return res.status(400).json({ message: "El ID de configuración es requerido" });
    }

    // Validar si el nombre del sitio existe en otro registro
    const siteNameExist = await GeneralSettingsModel.findOne({
      siteName: req.body.siteName,
      _id: { $ne: id } // Asegúrate de usar _id para la comparación
    });

    if (siteNameExist) {
      return res.status(400).json({ message: "El nombre del sitio ya está definido" });
    }

    // Realizar la actualización
    const updatedSettings: IGeneralSettings | null = await GeneralSettingsModel.findByIdAndUpdate(
      id, // Usar findByIdAndUpdate para buscar por _id
      req.body,
      { new: true, runValidators: true } // new: true retorna el documento actualizado; runValidators: true aplica validaciones definidas en el esquema
    );

    // Verificar si se encontró el documento a actualizar
    if (!updatedSettings) {
      return res.status(404).json({ message: "Configuración no encontrada" });
    }

    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.error("Error actualizando la configuración general:", error);
    return res.status(500).json({ message: 'Error al actualizar la configuración', error });
  }
};


