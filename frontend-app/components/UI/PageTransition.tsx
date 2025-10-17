/**
 * Page Transition Component
 * @description: Componente para transiciones avanzadas entre páginas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
    children: ReactNode
    className?: string
}

// Variantes de animación personalizadas
const pageVariants = {
    initial: {
        opacity: 0,
        x: 20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        x: -20,
        scale: 0.98
    }
}

const pageTransition = {
    type: 'tween' as const,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
    duration: 0.4
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className={`w-full ${className}`}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

// Hook personalizado para detectar tipo de transición
export const usePageTransition = () => {
    const pathname = usePathname()

    // Determinar el tipo de transición basado en la ruta
    const getTransitionType = () => {
        if (pathname.includes('/warehouse')) return 'warehouse'
        if (pathname.includes('/cost-center')) return 'finance'
        if (pathname.includes('/settings')) return 'settings'
        return 'default'
    }

    return {
        transitionType: getTransitionType(),
        pathname
    }
}