import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
};

export const pageTransition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

interface DesignProviderProps {
  children: React.ReactNode;
  className?: string;
}

export const DesignProvider: React.FC<DesignProviderProps> = ({ children, className = '' }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className={`w-full h-full ${className}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
