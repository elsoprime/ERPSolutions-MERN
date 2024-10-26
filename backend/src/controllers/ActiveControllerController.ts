/** Autor: @elsoprimeDev */
import { Request, Response } from 'express';

import { getActiveModulesService, updateActiveModulesService } from '../services/generalSettingService';

// Active Modules Controller
export const getActiveModules = async (req: Request, res: Response): Promise<Response> => {
    try {
      const modules = await getActiveModulesService();
      return res.status(200).json(modules);
    } catch (error) {
      return res.status(500).json({ message: 'Error retrieving active modules', error });
    }
  };
  
  export const updateActiveModules = async (req: Request, res: Response): Promise<Response> => {
    try {
      const updatedModules = await updateActiveModulesService(req.body);
      return res.status(200).json(updatedModules);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating active modules', error });
    }
  };
  