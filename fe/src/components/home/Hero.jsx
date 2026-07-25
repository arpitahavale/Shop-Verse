import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BRAND, ROUTES } from '../../constants';
import Button from '../common/Button';

function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-atmosphere" aria-hidden>
        <motion.div
          className="hero-orb hero-orb-a"
          animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="hero-orb hero-orb-b"
          animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="hero-grain" />
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="hero-brand">{BRAND.name}</p>
        <h1 className="hero-title">{BRAND.heroLine}</h1>
        <p className="hero-sub">
          Multi-room shopping with Vibe Match scores, curated collections, and a
          bag that rewards how you feel — not just what you filter.
        </p>
        <div className="hero-cta">
          <Button variant="primary" onClick={() => navigate(ROUTES.shop)}>
            Enter the shop
          </Button>
          <Button variant="ghost" onClick={() => navigate(ROUTES.vibe)}>
            Open Vibe Studio
          </Button>
        </div>
      </motion.div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: -1.5 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <div className="hero-visual-frame">
          <img
            src="/images/hero.jpg"
            alt=""
          />
        </div>
      </motion.div>
    </section>
  );
}

export default Hero;
