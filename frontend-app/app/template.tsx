/**
 * Template Component
 * @description: Componente de template que envuelve todas las páginas para agregar transiciones
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

'use client'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="h-full"
        >
            {children}
        </motion.div>
    )
}