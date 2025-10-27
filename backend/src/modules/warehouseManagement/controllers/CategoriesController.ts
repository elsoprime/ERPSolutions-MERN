/** Autor: @elsoprimeDev */
import {Request, Response} from 'express'
import {
  Category,
  ICategory
} from '@/modules/warehouseManagement/models/Category'

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

  /**
   * Metodo para guardar las categorias de manera masiva a traves de csv o json
   * @param req
   * @param res
   * @return void
   */

  static async bulkCreateCategories(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const {categories} = req.body

      if (!categories || !Array.isArray(categories)) {
        res.status(400).json({
          success: false,
          message: 'El formato de datos es inválido'
        })
      }

      const errors: Array<{index: number; name: string; reason: string}> = []
      const duplicates: Array<{index: number; name: string}> = []
      const validCategories: any[] = []

      // Obtener categorías existentes
      const existingCategories = await Category.find({}, 'name')
      const existingNames = new Set(
        existingCategories.map(cat => cat.name.toLowerCase().trim())
      )

      // Procesar cada categoría
      categories.forEach((cat, i) => {
        const normalizedName = cat.name?.toLowerCase().trim()

        // Validaciones
        if (!cat.name?.trim()) {
          errors.push({
            index: i + 1,
            name: cat.name || 'Sin nombre',
            reason: 'El nombre es requerido'
          })
          return
        }

        if (!cat.description?.trim()) {
          errors.push({
            index: i + 1,
            name: cat.name,
            reason: 'La descripción es requerida'
          })
          return
        }

        if (cat.name.length > 100) {
          errors.push({
            index: i + 1,
            name: cat.name,
            reason: 'El nombre no puede exceder 100 caracteres'
          })
          return
        }

        // Verificar duplicados
        if (existingNames.has(normalizedName)) {
          duplicates.push({index: i + 1, name: cat.name})
          return
        }

        const isDuplicateInBatch = validCategories.some(
          valid => valid.name.toLowerCase().trim() === normalizedName
        )

        if (isDuplicateInBatch) {
          duplicates.push({index: i + 1, name: cat.name})
          return
        }

        // Agregar a válidas
        validCategories.push({
          name: cat.name.trim(),
          description: cat.description.trim()
        })
      })

      // Insertar solo si hay categorías válidas
      let result = []
      if (validCategories.length > 0) {
        result = await Category.insertMany(validCategories)
      }

      // Respuesta única
      const response = {
        success: result.length > 0,
        message:
          result.length > 0
            ? `${result.length} categorías importadas exitosamente`
            : 'No hay categorías válidas para importar',
        imported: result.length,
        duplicateCount: duplicates.length,
        errorCount: errors.length,
        totalProcessed: categories.length,
        duplicates: duplicates.length > 0 ? duplicates : undefined,
        errors: errors.length > 0 ? errors : undefined,
        data: result
      }

      const statusCode = result.length > 0 ? 201 : 400
      res.status(statusCode).json(response)
    } catch (error) {
      console.error('Error en bulkCreateCategories:', error)
      res.status(500).json({
        success: false,
        message: 'Error al crear categorías',
        error: error.message
      })
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

      if (!updatedCategory) {
        return res.status(404).json({message: 'Categoría no encontrada'})
      }

      res.status(200).json({
        message: 'Categoría actualizada correctamente'
      })
    } catch (error) {
      console.error('Error al actualizar la Categoría:', error)
      res.status(500).json({message: 'Error al actualizar la Categoría', error})
    }
  }

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
