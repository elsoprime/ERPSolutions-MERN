/**
 * Autor: Esteban Soto @elsoprimeDev
 */

import {IModuleCard} from '@/interfaces/IPageComponents'

type WarehouseViewsProps = {
  data: IModuleCard[]
}

export default function CostCenterManagement() {
  //Definir si los Modulos esta Activos

  return (
    <>
      {/* Sección de Card del Módulos */}
      <div className='relative -mt-96 md:-mt-72'>
        <div className='md:max-w-7xl xl:max-w-full mx-auto py-6 px-4 lg:rounded-md xl:rounded-none'>
          Aca van las Cards de los Módulos del Centro de Costo
        </div>
        {/* Fin Sección de Card del Módulos */}
        {/* Historial de Movimientos */}
        <div className='md:max-w-7xl xl:max-w-full mx-auto py-6 sm:px-6 lg:px-8 bg-gray-50 lg:rounded-md xl:rounded-none shadow-sm mt-6'>
          <h2 className='text-lg font-semibold text-gray-700 mb-4'>
            Historial de Movimientos
          </h2>
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200'>
              <thead>
                <tr>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Fecha
                  </th>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Producto
                  </th>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Cantidad
                  </th>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Tipo de Movimiento
                  </th>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Usuario
                  </th>
                  <th className='px-6 py-3 border-b border-gray-200 bg-gray-100 text-left text-sm font-medium text-gray-700'>
                    Comentarios
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Ejemplo de fila */}
                <tr>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    2024-10-01 10:30 AM
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Producto A
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    50
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Entrada
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Juan Pérez
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Ingreso inicial de stock
                  </td>
                </tr>
                <tr>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    2024-10-02 02:15 PM
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Producto B
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    20
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Salida
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    María López
                  </td>
                  <td className='px-6 py-4 border-b border-gray-200 text-sm text-gray-700'>
                    Venta a cliente XYZ
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Fin Historial de Movimientos */}
    </>
  )
}
