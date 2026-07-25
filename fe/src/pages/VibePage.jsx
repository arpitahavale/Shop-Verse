import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { ROUTES, VIBES, VIBE_BUNDLE_DISCOUNT } from '../constants';
import { sortByVibeMatch, getMatchScore } from '../utils/vibe';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import Reveal from '../components/common/Reveal';
import ShimmerFallback from '../components/ShimmerFallback';

function VibePage() {
  const navigate = useNavigate();
  const { activeVibe, toggleVibe } = useCart();
  const { data: products, loading, error } = useFetch(fetchProducts);
  const discountPct = Math.round(VIBE_BUNDLE_DISCOUNT * 100);

  const ranked = useMemo(() => {
    if (!products) return [];
    if (!activeVibe) return products;
    return sortByVibeMatch(products, activeVibe).filter(
      (p) => getMatchScore(p, activeVibe) >= 50
    );
  }, [products, activeVibe]);

  if (error) {
    return <div className="error-panel">{error}</div>;
  }

  if (loading || !products) return <ShimmerFallback />;

  return (
    <div className="page-vibe">
      <Reveal className="vibe-page-hero">
        <p className="section-eyebrow">Only on ShopVerse</p>
        <h1 className="page-title">Vibe Match Studio</h1>
        <p className="page-sub">
          Choose how you want to feel. Products reshuffle with live match scores.
          Add two strong matches (70+) and unlock {discountPct}% off in your bag.
        </p>
      </Reveal>

      <div className="vibe-picker">
        {VIBES.map((vibe, index) => {
          const isActive = activeVibe === vibe.id;
          return (
            <motion.button
              key={vibe.id}
              type="button"
              className={`vibe-panel ${isActive ? 'vibe-panel-active' : ''}`}
              style={{ '--vibe-accent': vibe.accent }}
              onClick={() => toggleVibe(vibe.id)}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="vibe-chip-dot" />
              <span className="vibe-panel-label">{vibe.label}</span>
              <span className="vibe-panel-blurb">{vibe.blurb}</span>
              {isActive && <span className="vibe-panel-live">Live</span>}
            </motion.button>
          );
        })}
      </div>

      <Reveal className="vibe-results">
        <div className="section-heading">
          <div>
            <h2 className="section-title">
              {activeVibe ? 'Your ranked floor' : 'Pick a vibe to begin'}
            </h2>
            <p className="section-desc">
              {activeVibe
                ? `${ranked.length} pieces scoring 50%+ for this energy.`
                : 'Activate a vibe above to personalize ranking and unlock bundles.'}
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(ROUTES.shop)}>
            Browse shop
          </Button>
        </div>

        {activeVibe ? (
          <div className="product-grid">
            {ranked.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="vibe-empty-hint">
            Tap a vibe card — the catalog will animate into your energy.
          </div>
        )}
      </Reveal>
    </div>
  );
}

export default VibePage;
