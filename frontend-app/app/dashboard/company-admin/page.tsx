/**
 * Company Admin Dashboard Page
 * @description: Página de dashboard para Administradores de Empresa
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {CompanyAdminDashboard} from '@/components/Modules/UserManagement'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'
import ModuleNavigationCards from '@/components/Shared/ModuleNavigationCards'

export default function CompanyAdminPage() {
  return (
    <ProtectedLayout>
      <DashboardHeader
        title='Dashboard Admin Empresa'
        subtitle='Panel de Control Empresarial'
        description='Gestión completa de tu empresa con acceso a configuraciones, usuarios y reportes empresariales.'
        backgroundImage='bg-gradient-to-r from-blue-600 to-indigo-600'
      />

      {/* Module Navigation */}
      <ModuleNavigationCards
        currentModule='company-admin'
        showAllModules={true}
        maxColumns={4}
      />

      <CompanyAdminDashboard />
    </ProtectedLayout>
  )
}

export const metadata = {
  title: 'Dashboard Admin Empresa - ERP Solutions',
  description: 'Dashboard para Administradores de Empresa'
}
