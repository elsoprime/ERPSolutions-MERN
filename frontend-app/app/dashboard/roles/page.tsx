/**
 * Super Admin Dashboard Page Settings
 * @description: Página de configuración del dashboard para Super Administradores
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {SuperAdminDashboard} from '@/components/Modules/SuperAdmin'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import DevelopmentBlock from '@/components/UI/DevelopmentBlock'

export default function SuperAdminRolesPage() {
  return (
    <>
      <DashboardHeader
        title='Dashboard Super Admin'
        subtitle='Panel de Configuración Roles del Sistema'
        description='Accede y gestiona las configuraciones globales del sistema ERP Solutions.'
      />
      <div className='relative'>
        <DevelopmentBlock />
      </div>
    </>
  )
}

export const metadata = {
  title: 'Dashboard Super Admin - ERP Solutions',
  description:
    'Dashboard de configuración para Super Administradores del sistema'
}
