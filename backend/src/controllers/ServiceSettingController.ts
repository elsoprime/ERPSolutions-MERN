/** Autor: @elsoprimeDev */
import { Request, Response } from 'express';
import { getSecuritySettingsService, updateSecuritySettingsService } from '../services/generalSettingService';


// Security Settings Controller
export const getSecuritySettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const settings = await getSecuritySettingsService();
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving security settings', error });
  }
};

export const updateSecuritySettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const updatedSettings = await updateSecuritySettingsService(req.body);
    return res.status(200).json(updatedSettings);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating security settings', error });
  }
};
