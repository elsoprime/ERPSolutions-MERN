/**
 * Companies Management Page
 * @description: Página de gestión de empresas para Super Administrador
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import CompanyManagementPage from '@/components/Modules/CompanyManagement/Views/CompanyManagementPage'
import ProtectedLayout from '@/components/Layout/ProtectedLayout'
import {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Empresas | ERP Solutions',
  description: 'Panel de administración para gestionar empresas del sistema'
}

export default function CompaniesPage() {
  return (
    <ProtectedLayout>
      <CompanyManagementPage />
    </ProtectedLayout>
  )
}
