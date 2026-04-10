import { motion, useReducedMotion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1]   // мягко и быстро
const easeIn = [0.4, 0, 1, 1]

export default function PageTransition({ children }) {
    const reduce = useReducedMotion()

    // Минимальная “дорогая” анимация: fade + лёгкий подъём/опускание.
    // Без scale и без spring — именно они чаще всего дают “дёрганье”.
    const variants = {
        initial: {
            opacity: 0,
            y: reduce ? 0 : 8,
        },
        animate: {
            opacity: 1,
            y: 0,
            transition: reduce
                ? { duration: 0.12 }
                : { duration: 0.22, ease: easeOut },
        },
        exit: {
            opacity: 0,
            y: reduce ? 0 : -6,
            transition: reduce
                ? { duration: 0.1 }
                : { duration: 0.16, ease: easeIn },
        },
    }

    return (
        <motion.div
            style={{ width: '100%', willChange: 'transform, opacity' }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {children}
        </motion.div>
    )
}