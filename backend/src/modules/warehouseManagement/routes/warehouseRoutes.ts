/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {Router} from 'express'
import {body, param} from 'express-validator'
import {handleInputErrors} from '@/middleware/handleInputErrorsMiddleware'
import {CategoriesController} from '../controllers/CategoriesController'
import {ProductsController} from '../controllers/ProductsController'

// 🔒 SEGURIDAD AVANZADA - Middleware JWT y Roles
import {authMiddleware} from '@/modules/userManagement/middleware/authMiddleware'
import {
  requirePermission,
  requireRole,
  SystemRole
} from '@/modules/userManagement/middleware/roleMiddleware'
import {apiRateLimit} from '@/modules/userManagement/middleware/rateLimitMiddleware'

const router = Router()

// 🔒 APLICAR AUTENTICACIÓN Y RATE LIMITING A TODAS LAS RUTAS
router.use(authMiddleware.authenticate)
router.use(apiRateLimit)

// ====================================
// 📦 RUTAS DE CATEGORÍAS
// ====================================

/** Definiendo Rutas paras las Categorías */

// Crear una Categoría [ Method POST] - Requiere permiso de creación
router.post(
  '/category',
  requirePermission('warehouse', 'create'),
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isString()
    .withMessage('El nombre debe ser un texto válido')
    .isLength({min: 3, max: 50})
    .withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .trim(),
  handleInputErrors,
  CategoriesController.createCategory
)

// Crear Categorías de manera masiva [ Method POST] - Solo roles superiores
router.post(
  '/categories/bulk',
  requireRole(SystemRole.EMPLOYEE), // Empleado o superior
  body('categories')
    .isArray()
    .withMessage('Se requiere un array de categorías'),
  CategoriesController.bulkCreateCategories
)

// Obtener Lista de Categorías [ Method GET] - Solo lectura
router.get(
  '/category',
  requirePermission('warehouse', 'read'),
  CategoriesController.getCategoriesList
)

// Obtener una Categoría por Paginas de Registros [ Method GET]
router.get(
  '/categories/',
  requirePermission('warehouse', 'read'),
  CategoriesController.getCategories
)

// Obtener una Categoría por ID [ Method GET]
router.get(
  '/categories/:id',
  requirePermission('warehouse', 'read'),
  param('id').isMongoId().withMessage('ID de Categoría no válido'),
  handleInputErrors,
  CategoriesController.getCategoryById
)

// Actualizar una Categoría por ID [ Method PUT] - Requiere permisos de actualización
router.put(
  '/categories/:id',
  requirePermission('warehouse', 'update'),
  param('id').isMongoId().withMessage('ID de Categoría no válido'),
  body('name')
    .isString()
    .isLength({min: 3, max: 50})
    .withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  handleInputErrors,
  CategoriesController.updateCategory
)

// Eliminar una Categoría por ID [ Method DELETE] - Solo supervisores+
router.delete(
  '/categories/:id',
  requireRole(SystemRole.SUPERVISOR), // Supervisor o superior para eliminar
  param('id').isMongoId().withMessage('ID de Categoría no válido'),
  handleInputErrors,
  CategoriesController.deleteCategory
)

// ====================================
// 🛍️ RUTAS DE PRODUCTOS
// ====================================

/**
 * Definiendo Rutas para los Productos
 */

/** Definiendo Middleware para la existencia de un Producto */
//router.param("id", validateProductExists);

// Crear un Producto [ Method POST] - Requiere permiso de creación
router.post(
  '/product',
  requirePermission('warehouse', 'create'),
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
    .withMessage('La marca debe tener entre 1 y 50 caracteres')
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

// Obtener Lista de Productos Paginadas [ Method GET] - Solo lectura
router.get(
  '/products/',
  requirePermission('warehouse', 'read'),
  ProductsController.getProducts
)

// Obtener un Producto por ID [ Method GET] - Solo lectura
router.get(
  '/product/:id',
  requirePermission('warehouse', 'read'),
  param('id').isMongoId().withMessage('ID de Producto no válido'),
  // validateProductExists,
  handleInputErrors,
  ProductsController.getProductById
)

// Ruta para obtener el total de productos por categoría - Solo lectura
router.get(
  '/products',
  requirePermission('warehouse', 'read'),
  ProductsController.getProductsByCategory
)

// Actualizar un Producto por ID [ Method PUT] - Requiere permisos de actualización
router.put(
  '/product/:id',
  requirePermission('warehouse', 'update'),
  param('id').isMongoId().withMessage('ID de Producto no válido'),
  //validateProductExists,
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
  ProductsController.updateProduct
)

// Eliminar un Producto por ID [ Method DELETE] - Solo supervisores+
router.delete(
  '/product/:id',
  requireRole(SystemRole.SUPERVISOR), // Supervisor o superior para eliminar productos
  param('id').isMongoId().withMessage('ID de Producto no válido'),
  handleInputErrors,
  ProductsController.deleteProduct
)

/**
 * Exportando Rutas de Categorías
 */
export default router
