/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { CategoriesController } from "../controllers/CategoriesController";
import { ProductsController } from "../controllers/ProductsController";
import { validateProductExists } from "../middleware/products";

const router = Router();

/** Definiendo Rutas paras las Categorías */

// Crear una Categoría [ Method POST]
router.post(
  "/category",
  body("name")
    .isString()
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  handleInputErrors,
  CategoriesController.createCategory
);

// Obtener Lista de Categorías [ Method GET]
router.get("/category", CategoriesController.getCategoriesList);

// Obtener una Categoría por Paginas de Registros [ Method GET]
router.get("/categories/", CategoriesController.getCategories);

// Obtener una Categoría por ID [ Method GET]
router.get(
  "/categories/:id",
  param("id").isMongoId().withMessage("ID de Categoría no válido"),
  handleInputErrors,
  CategoriesController.getCategoryById
);

// Actualizar una Categoría por ID [ Method PUT]
router.put(
  "/categories/:id",
  param("id").isMongoId().withMessage("ID de Categoría no válido"),
  body("name")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres"),
  handleInputErrors,
  CategoriesController.updateCategory
);

// Eliminar una Categoría por ID [ Method DELETE]
router.delete(
  "/categories/:id",
  param("id").isMongoId().withMessage("ID de Categoría no válido"),
  handleInputErrors,
  CategoriesController.deleteCategory
);

/**
 * Definiendo Rutas para los Productos
 */

/** Definiendo Middleware para la existencia de un Producto */
//router.param("id", validateProductExists);
// Crear un Producto [ Method POST]
router.post(
  "/product",
  body("name")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres")
    .trim(),
  body("slug")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El slug debe tener entre 3 y 50 caracteres")
    .trim(),
  body("brand")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("La marca debe tener entre 1 y 50 caracteres")
    .trim(),
  body("price")
    .isNumeric()
    .custom((value) => value > 0)
    .withMessage("El precio debe ser un número positivo"),
  body("stock")
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("El stock debe ser un número no negativo"),
  body("image")
    .isString()
    .isURL()
    .withMessage("La imagen debe ser una URL válida")
    .optional(),
  body("category").isMongoId().withMessage("ID de Categoria no válido"),
  body("type")
    .isIn(["physical", "digital", "service"])
    .withMessage("Tipo de producto no válido")
    .optional(),
  body("sku")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El SKU debe tener entre 3 y 50 caracteres")
    .trim(),
  body("status")
    .isIn(["active", "inactive"])
    .withMessage("Estado no válido")
    .optional(),
  handleInputErrors,
  ProductsController.createProduct
);

// Obtener Lista de Productos Paginadas [ Method GET]
router.get("/products/", ProductsController.getProducts);

// Obtener un Producto por ID [ Method GET]
router.get(
  "/product/:id",
  param("id").isMongoId().withMessage("ID de Producto no válido"),
  validateProductExists,
  handleInputErrors,
  ProductsController.getProductById
);

// Ruta para obtener el total de productos por categoría
router.get("/products", ProductsController.getProductsByCategory);

// Actualizar un Producto por ID [ Method PUT]
router.put(
  "/product/:id",
  param("id").isMongoId().withMessage("ID de Producto no válido"),
  validateProductExists,
  body("name")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres")
    .trim(),
  body("slug")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El slug debe tener entre 3 y 50 caracteres")
    .trim(),
  body("brand")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("La marca debe tener entre 3 y 50 caracteres")
    .trim(),
  body("price")
    .isNumeric()
    .custom((value) => value > 0)
    .withMessage("El precio debe ser un número positivo"),
  body("stock")
    .isNumeric()
    .custom((value) => value >= 0)
    .withMessage("El stock debe ser un número no negativo"),
  body("image")
    .isString()
    .isURL()
    .withMessage("La imagen debe ser una URL válida")
    .optional(),
  body("category").isMongoId().withMessage("ID de Categoria no válido"),
  body("type")
    .isIn(["physical", "digital", "service"])
    .withMessage("Tipo de producto no válido")
    .optional(),
  body("sku")
    .isString()
    .isLength({ min: 3, max: 50 })
    .withMessage("El SKU debe tener entre 3 y 50 caracteres")
    .trim(),
  body("status")
    .isIn(["active", "inactive"])
    .withMessage("Estado no válido")
    .optional(),
  handleInputErrors,
  ProductsController.updateProduct
);

// Eliminar un Producto por ID [ Method DELETE]
router.delete(
  "/product/:id",
  param("id").isMongoId().withMessage("ID de Producto no válido"),
  handleInputErrors,
  ProductsController.deleteProduct
);

/**
 * Exportando Rutas de Categorías
 */
export default router;
