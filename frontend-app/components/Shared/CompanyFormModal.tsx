/**
 * Modal Component for Company Form (DEPRECATED - Use FormModal instead)
 * @description: Wrapper de compatibilidad hacia FormModal genérico
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0
 * @deprecated Use FormModal instead
 */

import FormModal from './FormModal'

interface CompanyFormModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
  enableOverlayClose?: boolean
  showCloseButton?: boolean
  className?: string
}

/**
 * @deprecated Use FormModal instead
 * Wrapper para mantener compatibilidad con código existente
 */
export const CompanyFormModal: React.FC<CompanyFormModalProps> = props => {
  return <FormModal {...props} />
}

export default CompanyFormModal
