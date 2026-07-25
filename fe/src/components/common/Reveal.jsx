import { motion, useReducedMotion } from 'framer-motion';

function Reveal({
  children,
  className = '',
  delay = 0,
  y = 36,
  as = 'div',
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
