/**
 * Super Admin Dashboard Page Settings
 * @description: Página de configuración del dashboard para Super Administradores
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {SuperAdminDashboard} from '@/components/Modules/SuperAdmin'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'

export default function SuperAdminPage() {
  return (
    <>
      <DashboardHeader
        title='Dashboard Super Admin'
        subtitle='Panel de Configuración Global'
        description='Accede y gestiona las configuraciones globales del sistema ERP Solutions.'
        backgroundImage='bg-gradient-to-r from-red-600 to-purple-600'
      />
      <p className='text-5xl font-bold text-center'>Seccion en Desarrollo </p>
    </>
  )
}

export const metadata = {
  title: 'Dashboard Super Admin - ERP Solutions',
  description:
    'Dashboard de configuración para Super Administradores del sistema'
}
