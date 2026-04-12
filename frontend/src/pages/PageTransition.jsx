import { AnimatePresence, motion } from 'framer-motion'

export default function PageTransition({ enabled = true, routeKey, children }) {
    if (!enabled) return children

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={routeKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ height: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}