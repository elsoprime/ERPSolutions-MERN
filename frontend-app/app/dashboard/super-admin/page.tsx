/**
 * Super Admin Dashboard Page
 * @description: Página de dashboard para Super Administradores
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {SuperAdminDashboard} from '@/components/Modules/UserManagement'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'

export default function SuperAdminPage() {
  return (
    <ProtectedLayout>
      <DashboardHeader
        title='Dashboard Super Admin'
        subtitle='Panel de Control Global'
        description='Gestión completa del sistema ERP con acceso a todas las funcionalidades administrativas y de configuración global.'
        backgroundImage='bg-gradient-to-r from-red-600 to-purple-600'
      />
      <SuperAdminDashboard />
    </ProtectedLayout>
  )
}

export const metadata = {
  title: 'Dashboard Super Admin - ERP Solutions',
  description: 'Dashboard principal para Super Administradores del sistema'
}
