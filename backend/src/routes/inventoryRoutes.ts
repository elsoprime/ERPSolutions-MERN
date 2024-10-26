/** Autor: @elsoprimeDev */

import {Router} from 'express'
import {body, param} from 'express-validator'
import {handleInputErrors} from '../middleware/validation'
import {CategoriesController} from '../controllers/CategoriesController'
import {validateExistCategory} from '../middleware/category'
import {ProductsController} from '../controllers/ProductsController'

const router = Router()

// Definimos las rutas para las Categorias y SubCategorias
router.post(
  '/category',
  body('name')
    .isString()
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  handleInputErrors,
  CategoriesController.createCategory
)

// Definimos la ruta para obtener todas las Categorias
router.get('/categories', CategoriesController.getCategories)
router.get('/category/', CategoriesController.getCategoriesList)

// Definimos la ruta para obtener una Categoria por ID
router.get(
  '/category/:id',
  param('id').isMongoId().withMessage('ID de Categoria no válido'),
  handleInputErrors,
  CategoriesController.getCategoryById
)

//Actualizar una Categoria
router.put(
  '/category/:id',
  param('id').isMongoId().withMessage('ID de Categoria no válido'),
  body('name')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  validateExistCategory,
  handleInputErrors,
  CategoriesController.updateCategory
)

//Eliminar una Categoria
router.delete(
  '/category/:id',
  param('id').isMongoId().withMessage('ID de Categoria no válido'),
  validateExistCategory,
  handleInputErrors,
  CategoriesController.deleteCategory
)

/** Definiendo Rutas para los Productos */
router.post(
  '/product',
  body('name')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .trim(),
  body('slug')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('El slug debe tener entre 3 y 50 caracteres')
    .trim(),
  body('brand')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('La marca debe tener entre 3 y 50 caracteres')
    .trim(),
  body('price')
    .isNumeric()
    .custom(value => value > 0)
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('El stock debe ser un número no negativo'),
  body('image')
    .isString()
    .isURL()
    .withMessage('La imagen debe ser una URL válida')
    .optional(),
  body('category').isMongoId().withMessage('ID de Categoria no válido'),
  body('type')
    .isIn(['physical', 'digital', 'service'])
    .withMessage('Tipo de producto no válido')
    .optional(),
  body('sku')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('El SKU debe tener entre 3 y 50 caracteres')
    .trim(),
  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Estado no válido')
    .optional(),
  handleInputErrors,
  ProductsController.createProduct
)

router.get('/product', ProductsController.getProducts)
router.get(
  '/product/:id',
  param('id').isMongoId().withMessage('ID de Categoria no válido'),
  ProductsController.getProductById
)
router.delete(
  '/product/:id',
  param('id').isMongoId().withMessage('ID de Categoria no válido'),
  ProductsController.deleteProduct
)
export default router
