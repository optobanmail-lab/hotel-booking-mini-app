import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children, direction = 1 }) {
  const reduce = useReducedMotion()

  const variants = {
    initial: (dir) => ({
      x: reduce ? 0 : (dir > 0 ? 26 : -18),
      opacity: 0,
      scale: reduce ? 1 : 0.995,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: reduce
          ? { duration: 0.12 }
          : { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 },
    },
    exit: (dir) => ({
      x: reduce ? 0 : (dir > 0 ? -14 : 20),
      opacity: 0,
      scale: reduce ? 1 : 0.995,
      transition: { duration: 0.16, ease: 'easeOut' },
    }),
  }

  return (
      <motion.div
          style={{ width: '100%' }}
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
      >
        {children}
      </motion.div>
  )
}