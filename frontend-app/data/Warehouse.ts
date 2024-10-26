/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IFormField} from '../interfaces/IComponents'
import {IWareHouse, IWareHouseCard} from '../interfaces/IPageComponents'

// Arreglo para el Mapeo de la Vista del Modulo Warehouse
export const WarehouseHeading: IWareHouse[] = [
  {
    id: 1,
    body: [
      {
        title: 'Gestión de Almacen',
        subtitle: 'Administra tu modulo de Almacenes',
        description:
          'Esta sección te permite gestionar tus productos, categorías, proveedores y clientes de manera eficiente.',
        image: `/warehouse-icon.svg`,
        DataAOS: 'zoom-in',
        IAction: [
          {
            title: 'Dashboard',
            href: '/home'
          }
        ]
      }
    ]
  }
]

// Arreglo de Datos para el Map de Cards [WarehouseCard]
export const WarehouseCardData: IWareHouseCard[] = [
  {
    id: 1,
    title: 'Administra tus Categorias',
    description: 'Agrega una nueva categoria a tu inventario.',
    image: `/category-icon.svg`,
    DataAOS: 'flip-left',
    IAction: [
      {
        title: 'Crear una Categoria',
        href: '/home/warehouse/categories'
      }
    ]
  },
  {
    id: 2,
    title: 'Administra tus Producto',
    description: 'Agrega un nuevo producto a tu inventario.',
    image: `/logo-product.webp`,
    DataAOS: 'flip-left',
    IAction: [
      {
        title: 'Crear un Producto',
        href: '/home/warehouse/products'
      }
    ]
  },
  {
    id: 3,
    title: 'Administra tus Proveedores',
    description: 'Agrega un nuevo proveedor a tu inventario.',
    image: `/provider.svg`,
    DataAOS: 'flip-up',
    IAction: [
      {
        title: 'Crear un Proveedor',
        href: '/home/products/providers/add'
      }
    ]
  },
  {
    id: 4,
    title: 'Administras tus Clientes',
    description: 'Agrega un nuevo cliente a tu inventario.',
    image: `/client.svg`,
    DataAOS: 'flip-down',
    IAction: [
      {
        title: 'Crear un Cliente',
        href: '/home/products/clients/add'
      }
    ]
  },
  {
    id: 5,
    title: 'Ingreso de Productos',
    description: 'Agrega un nuevo ingreso de productos a tu inventario.',
    image: `/Forklift-Containers.png`,
    DataAOS: 'flip-right',
    IAction: [
      {
        title: 'Ingresar Productos',
        href: '/home/inventory/income/add'
      }
    ]
  },
  {
    id: 6,
    title: 'Salidas de Productos',
    description: 'Agrega un nuevo ingreso de productos a tu inventario.',
    image: `/shipping-products.png`,
    DataAOS: 'flip-right',
    IAction: [
      {
        title: 'Ingresar Productos',
        href: '/home/inventory/income/add'
      }
    ]
  }
]

/** Definiendo Datos para el Formulario de Categorías */
export const CategoryForm: IFormField[] = [
  {
    id: 'name',
    label: 'Nombre de la Categoria',
    type: 'text',
    placeholder: 'Nombre de la Categoria',
    required: true
  },
  {
    id: 'description',
    label: 'Descripción de la Categoria',
    type: 'textarea',
    placeholder: 'Descripción de la Categoria',
    required: false
  }
]

/** Definiendo Datos para el Formulario de Productos */
export const ProductFormField: IFormField[] = [
  {
    id: 'category',
    label: 'Categoria del Producto',
    type: 'select',
    placeholder: 'Categoria del Producto',
    required: true
  },
  {
    id: 'type',
    label: 'Tipo de Producto',
    type: 'select',
    placeholder: 'Tipo de Producto',
    required: true
  },
  {
    id: 'name',
    label: 'Nombre del Producto',
    type: 'text',
    placeholder: 'Nombre del Producto',
    required: true
  },
  {
    id: 'brand',
    label: 'Marca del Producto',
    type: 'text',
    placeholder: 'Marca del Producto',
    required: true
  },

  {
    id: 'price',
    label: 'Precio del Producto',
    type: 'number',
    placeholder: 'Precio del Producto',
    required: true
  },
  {
    id: 'stock',
    label: 'Stock del Producto',
    type: 'number',
    placeholder: 'Stock del Producto',
    required: true
  },
  {
    id: 'description',
    label: 'Descripción del Producto (Opcional)',
    type: 'textarea',
    placeholder: 'Descripción del Producto',
    required: false
  },
  {
    id: 'image',   
    type: 'hidden',    
    required: false
  },
  {
    id: 'status',
    label: 'Estado del Producto',
    type: 'select',
    placeholder: 'Estado del Producto',
    required: true
  }
]

/** Definiendo el Type Productos */

export const typeProductData = [
  {
    id: '1',
    name: 'physical'
  },
  {
    id: '2',
    name: 'digital'
  },
  {
    id: '3',
    name: 'service'
  }
]
