/**
 * Home Template Component
 * @description: Template específico para las páginas del área home con transiciones optimizadas
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import { motion } from 'framer-motion'

export default function HomeTemplate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94] // Curva de animación personalizada para mejor UX
            }}
            className="h-full"
        >
            {children}
        </motion.div>
    )
}