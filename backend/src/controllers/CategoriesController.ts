/** Autor: @elsoprimeDev */
import {Request, Response} from 'express'
import {Category} from '../models/Category'

export class CategoriesController {
  // Definiendo los metodos del controlador
  static async createCategory(req: Request, res: Response) {
    try {
      const {name, subCategories, description} = req.body

      // Verificar si ya existe la categoría
      const existCategory = await Category.findOne({
        name
      })
      if (existCategory) {
        return res.status(400).json({message: 'La Categoría ya existe'})
      }
      const newCategory = new Category({
        name,
        subCategories,
        description
      })
      await newCategory.save()
      res.status(201).json({message: 'Categoría creada correctamente'})
    } catch (error) {
      res.status(500).json({message: 'Error al crear la Categoría'})
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      // Leer los parámetros page y limit desde los query params
      const {page = 1, limit = 10} = req.query

      // Convertir los parámetros a números enteros
      const pageNumber = parseInt(page as string, 10)
      const limitNumber = parseInt(limit as string, 10)

      // Calcular el salto para la paginación
      const skip = (pageNumber - 1) * limitNumber

      // Obtener las categorías con paginación
      const categories = await Category.find()
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limitNumber)

      // Contar el total de categorías
      const total = await Category.countDocuments()

      // Devolver las categorías junto con el total y los valores de paginación
      res.status(200).json({
        categories,
        total,
        limit: limitNumber,
        page: pageNumber
      })
    } catch (error) {
      res.status(500).json({message: 'Error al obtener las Categorias'})
    }
  }

  static async getCategoriesList(req: Request, res: Response) {
    try {
      const categories = await Category.find()
      res.status(200).json(categories)
    } catch (error) {
      res.status(500).json({message: 'Error al obtener las Categorias'})
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    // Obtener una Categoria por ID
    try {
      const {id} = req.params
      const category = await Category.findById(id).populate('subCategories')
      if (!category) {
        return res.status(404).json({message: 'Categoria no encontrada'})
      }
      res.status(200).json(category)
    } catch (error) {
      res.status(500).json({message: 'Error al obtener la Categoria'})
    }
  }

  // Método para actualizar una categoría
  static async updateCategory(req: Request, res: Response) {
    try {
      const {id} = req.params
      const {name, description} = req.body

      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        {name, description},
        {new: true}
      )

      res.status(200).json({
        message: 'Categoría actualizada correctamente'
      })
    } catch (error) {
      console.error('Error al actualizar la Categoría:', error)
      res.status(500).json({message: 'Error al actualizar la Categoría', error})
    }
  }

  //

  // Método para eliminar una categoría
  static async deleteCategory(req: Request, res: Response) {
    try {
      const {id} = req.params

      const deletedCategory = await Category.findByIdAndDelete(id)
      if (!deletedCategory) {
        return res.status(404).json({message: 'Categoría no encontrada'})
      }

      res.status(200).json({message: 'Categoría eliminada correctamente'})
    } catch (error) {
      console.error('Error al eliminar la Categoría:', error)
      res.status(500).json({message: 'Error al eliminar la Categoría', error})
    }
  }
}
