import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import {
  CATEGORIES,
  COLLECTIONS,
  ROUTES,
  CATEGORY_META,
} from '../constants';
import { categoryPath } from '../utils/shop';
import Hero from '../components/home/Hero';
import AiPicks from '../components/home/AiPicks';
import ProductCard from '../components/common/ProductCard';
import Reveal from '../components/common/Reveal';
import Button from '../components/common/Button';
import SectionHeading from '../components/common/SectionHeading';
import ShimmerFallback from '../components/ShimmerFallback';

function HomePage() {
  const navigate = useNavigate();
  const { data: products, loading, error } = useFetch(fetchProducts);

  const featured = useMemo(
    () => (products || []).filter((p) => p.badge).slice(0, 4),
    [products]
  );

  if (error) {
    return <div className="error-panel">Failed to load: {error}</div>;
  }

  if (loading || !products) return <ShimmerFallback />;

  return (
    <div className="page-home">
      <Hero />
      <AiPicks />

      <Reveal className="home-marquee" y={20}>
        <div className="marquee-track">
          {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
            <Link key={`${cat}-${i}`} to={categoryPath(cat)} className="marquee-item">
              {cat}
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal className="home-section">
        <SectionHeading
          eyebrow="Rooms"
          title="Shop by category"
          description="Each aisle is its own destination — not a filter chip on one page."
          action={
            <Button variant="secondary" onClick={() => navigate(ROUTES.shop)}>
              View all
            </Button>
          }
        />
        <div className="category-tiles">
          {CATEGORIES.map((cat, index) => {
            const meta = CATEGORY_META[cat.toLowerCase()];
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
              >
                <Link to={categoryPath(cat)} className="category-tile">
                  <img src={meta.image} alt="" />
                  <div className="category-tile-copy">
                    <h3>{meta.label}</h3>
                    <p>{meta.blurb}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="home-section">
        <SectionHeading
          eyebrow="Collections"
          title="Curated paths in"
          description="Editorial drops you can enter like a room — each tied to a vibe."
        />
        <div className="collection-grid">
          {COLLECTIONS.map((col, index) => (
            <motion.div
              key={col.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -6 }}
            >
              <Link
                to={ROUTES.collection(col.slug)}
                className="collection-card"
              >
                <img src={col.image} alt="" />
                <div className="collection-card-copy">
                  <p className="collection-eyebrow">Collection</p>
                  <h3>{col.title}</h3>
                  <p>{col.blurb}</p>
                  <span className="collection-cta">Explore →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </Reveal>

      <Reveal className="home-section vibe-banner">
        <div className="vibe-banner-copy">
          <p className="section-eyebrow">Signature</p>
          <h2 className="section-title">Vibe Match Studio</h2>
          <p className="section-desc">
            Pick an energy. Watch products re-rank with live scores. Unlock
            bundle savings when your bag matches your mood.
          </p>
          <Button variant="primary" onClick={() => navigate(ROUTES.vibe)}>
            Launch studio
          </Button>
        </div>
        <div className="vibe-banner-visual" aria-hidden>
          <motion.div
            className="vibe-pulse"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          />
          <span>Live match</span>
        </div>
      </Reveal>

      <Reveal className="home-section">
        <SectionHeading
          eyebrow="Spotlight"
          title="Featured right now"
          description="Badged picks from across the floor."
          action={
            <Button variant="ghost" onClick={() => navigate(ROUTES.shop)}>
              Full catalog →
            </Button>
          }
        />
        <div className="product-grid">
          {featured.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

export default HomePage;
