/** Autor: @elsoprimeDev */

import {Request, Response} from 'express'
import {Regiones, Provincias, Comunas} from '../data/dataApiRegiones'

// Obtener todas las regiones
export const getRegiones = (req: Request, res: Response) => {
  try {
    res.json(Regiones)
  } catch (error) {
    console.error('Error al obtener regiones:', error)
    res.status(500).json({message: 'Error al obtener las regiones'})
  }
}

// Obtener todas las provincias de una región
export const getProvinciasByRegion = (req: Request, res: Response) => {
  try {
    const {codigoRegion} = req.params
    const provincias = Provincias.filter(
      provincia => provincia.codigo_padre === codigoRegion
    )
    res.json(provincias)
  } catch (error) {
    console.error(
      `Error al obtener provincias de la región ${req.params.codigoRegion}:`,
      error
    )
    res.status(500).json({message: 'Error al obtener las provincias'})
  }
}

// Obtener todas las comunas de una provincia
export const getComunasByProvincia = (req: Request, res: Response) => {
  try {
    const {codigoProvincia} = req.params
    const comunas = Comunas.filter(
      comuna => comuna.codigo_padre === codigoProvincia
    )
    res.json(comunas)
  } catch (error) {
    console.error(
      `Error al obtener comunas de la provincia ${req.params.codigoProvincia}:`,
      error
    )
    res.status(500).json({message: 'Error al obtener las comunas'})
  }
}
