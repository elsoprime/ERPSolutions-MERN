/** Autor: @elsoprimeDev */
import e, {Request, Response} from 'express'
import Product from '@/modules/warehouseManagement/models/Product'
import {generateSKU} from '@/utils/generateSKU'
import {isValidURL} from '@/utils/cloudinary.utils'

/** Definir la Clase del Controlador Productos */
export class ProductsController {
  //Definimos los Metodos para los Productos
  static async createProduct(req: Request, res: Response) {
    try {
      // Obtenemos el producto del cuerpo de la solicitud
      const {
        name,
        slug,
        description,
        brand,
        price,
        stock,
        image,
        category,
        type,
        sku,
        status
      } = req.body

      // Validamos la URL de la imagen
      if (image && !isValidURL(image)) {
        return res
          .status(400)
          .json({message: 'La URL de la imagen no es válida'})
      }

      // Verificamos si ya existe un producto con el mismo nombre
      const existProduct = await Product.findOne({name})
      if (existProduct) {
        return res.status(400).json({message: 'El Producto ya existe'})
      }

      // Creamos una nueva instancia de producto
      const newProduct = new Product({
        name,
        slug,
        description,
        price: parseFloat(price), // Aseguramos que el precio es numérico
        stock: parseInt(stock, 10), // Convertimos el stock a número entero
        brand,
        image,
        category,
        type,
        sku,
        status
      })

      // Guardamos el producto en la base de datos
      await newProduct.save()
      console.log('Producto creado correctamente')
      res.status(201).json({message: 'Producto creado correctamente'})
    } catch (error) {
      console.error('Error al crear el Producto:', error)
      res.status(500).json({message: 'Error al crear el Producto'})
    }
  }

  // Definiendo el Metodo para Obtener los Productos
  static async getProducts(req: Request, res: Response) {
    try {
      // Leer los parámetros page y limit desde los query params, asignar valores por defecto si no se proporcionan
      const {page = 1, limit = 10} = req.query

      // Convertir los parámetros a números enteros
      const pageNumber = parseInt(page as string, 10)
      const limitNumber = parseInt(limit as string, 10)

      // Verificar que page y limit sean números válidos
      if (
        isNaN(pageNumber) ||
        isNaN(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1
      ) {
        return res
          .status(400)
          .json({message: 'Los parámetros de paginación no son válidos'})
      }

      // Calcular el salto para la paginación
      const skip = (pageNumber - 1) * limitNumber

      // Obtener productos paginados
      const products = await Product.find()
        .populate('category') // Populate para obtener los datos de la categoría
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limitNumber)
        .lean()

      // Contar el total de productos
      const total = await Product.countDocuments()

      // Devolver los productos junto con el total y los valores de paginación
      res.status(200).json({
        products,
        total,
        limit: limitNumber,
        page: pageNumber
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({message: 'Error al obtener los Productos'})
    }
  }

  //Definir el Metodo para Obtener un Producto por ID
  static async getProductById(req: Request, res: Response) {
    // Obtener un Producto por ID
    try {
      const {id} = req.params
      const product = await Product.findById(id)
      if (!product) {
        return res.status(404).json({message: 'Producto no encontrado'})
      }
      res.status(200).json(product)
    } catch (error) {
      res.status(500).json({message: 'Error al obtener el Producto'})
    }
  }

  // Método para obtener el total de productos por categoría
  static async getProductsByCategory(req: Request, res: Response) {
    try {
      const {category} = req.query

      // Verificar si se ha enviado la categoría en la consulta
      if (!category) {
        return res.status(400).json({message: 'La categoría es requerida'})
      }

      // Buscar los productos que coincidan con la categoría
      const totalProducts = await Product.countDocuments({category})

      // Retornar el total de productos
      res.status(200).json({total: totalProducts})
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error)
      res.status(500).json({message: 'Error al obtener productos'})
    }
  }

  //Definir el Metodo para Actualizar un Producto
  static async updateProduct(req: Request, res: Response) {
    // Actualizar un Producto
    try {
      const {id} = req.params

      // Verificar si el producto existe
      const product = await Product.findById(id)
      if (!product) {
        return res.status(404).json({message: 'Producto no encontrado'})
      }
      // Actualizar el producto
      /* await Product.findByIdAndUpdate(id, req.body) */

      // Actualizar el producto
      const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      })

      res.status(200).json({message: 'Producto actualizado correctamente'})
    } catch (error) {
      res.status(500).json({message: 'Error al actualizar el Producto'})
    }
  }

  //Defiendo el Metodo para Borrar un Producto
  static async deleteProduct(req: Request, res: Response) {
    // Borrar un Producto
    try {
      const {id} = req.params
      await Product.findByIdAndDelete(id)
      res.status(200).json({message: 'Producto eliminado correctamente'})
    } catch (error) {
      res.status(500).json({message: 'Error al eliminar el Producto'})
    }
  }
}
