/**
 * User Management Page
 * @description: Página principal del módulo de gestión de usuarios
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import {UserManagementPage} from '@/components/Modules/UserManagement'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import DashboardHeader from '@/components/Layout/DashboardHeader'

export default function UsersPage() {
  return (
    <ProtectedLayout>
      <DashboardHeader
        title='Gestión de Usuarios'
        subtitle='Sistema Multi-Empresa'
        description='Administración completa de usuarios con roles jerárquicos y control de acceso por empresa.'
        backgroundImage='bg-gradient-to-r from-indigo-600 to-blue-600'
      />
      <UserManagementPage />
    </ProtectedLayout>
  )
}

export const metadata = {
  title: 'Gestión de Usuarios - ERP Solutions',
  description: 'Módulo completo de gestión de usuarios multi-empresa'
}
