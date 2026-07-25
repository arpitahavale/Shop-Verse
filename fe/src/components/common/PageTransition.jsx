import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const variants = {
  initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -16, filter: 'blur(4px)' },
};

function PageTransition({ children }) {
  const location = useLocation();
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className="page-transition">{children}</div>;
  }

  return (
    <motion.div
      key={location.pathname}
      className="page-transition"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;
