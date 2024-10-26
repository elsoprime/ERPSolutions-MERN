/** Autor: @elsoprimeDev */

import {Request, Response} from 'express'
import {
  IndustryCategory,
  SystemsTypes,
  FacilitiesSystem,
  OperationMode,
  StartMode
} from '../data/dataServices'

export class CategoryServiceController {
  static getIndustryCategory = async (req: Request, res: Response) => {
    try {
      res.json(IndustryCategory)
    } catch (error) {
      console.error('Error al obtener los Rubros de Servicio:', error)
      res.status(500).json({message: 'Error al obtener los Rubros de Servicio'})
    }
  }

  static getSystemsTypes = async (req: Request, res: Response) => {
    try {
      res.json(SystemsTypes)
    } catch (error) {
      console.error('Error al obtener los Tipos de Instalación:', error)
      res.status(500).json({message: 'Error al obtener Tipos de Instalación'})
    }
  }
  static getFacilitiesSystem = async (req: Request, res: Response) => {
    try {
      res.json(FacilitiesSystem)
    } catch (error) {
      console.error('Error al obtener los Tipos de Instalación:', error)
      res.status(500).json({message: 'Error al obtener Tipos de Instalación'})
    }
  }
  static getOperationMode = async (req: Request, res: Response) => {
    try {
      res.json(OperationMode)
    } catch (error) {
      console.error('Error al obtener los Modo de Operación:', error)
      res.status(500).json({message: 'Error al obtener los Modo de Operación'})
    }
  }
  static getStartMode = async (req: Request, res: Response) => {
    try {
      res.json(StartMode)
    } catch (error) {
      console.error('Error al obtener los Modo de Partida:', error)
      res.status(500).json({message: 'Error al obtener los Modo de Partida'})
    }
  }
}
