import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { COLLECTIONS, ROUTES } from '../constants';
import { sortByVibeMatch } from '../utils/vibe';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import Reveal from '../components/common/Reveal';
import ShimmerFallback from '../components/ShimmerFallback';

function CollectionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setActiveVibe } = useCart();
  const collection = COLLECTIONS.find((c) => c.slug === slug);
  const { data: products, loading, error } = useFetch(fetchProducts);

  useEffect(() => {
    if (collection?.vibe) setActiveVibe(collection.vibe);
  }, [collection, setActiveVibe]);

  const list = useMemo(() => {
    if (!products || !collection) return [];
    return sortByVibeMatch(products, collection.vibe).slice(0, 6);
  }, [products, collection]);

  if (!collection) {
    return (
      <div className="error-panel">
        Collection not found
        <Link to={ROUTES.home} className="text-link">
          ← Home
        </Link>
      </div>
    );
  }

  if (error) return <div className="error-panel">{error}</div>;
  if (loading || !products) return <ShimmerFallback />;

  return (
    <div className="page-collection">
      <Reveal className="collection-hero">
        <img src={collection.image} alt="" className="collection-hero-img" />
        <div className="collection-hero-copy">
          <p className="section-eyebrow">Collection</p>
          <h1 className="page-title">{collection.title}</h1>
          <p className="page-sub">{collection.blurb}</p>
          <div className="hero-cta">
            <Button variant="primary" onClick={() => navigate(ROUTES.vibe)}>
              Open Vibe Studio
            </Button>
            <Button variant="ghost" onClick={() => navigate(ROUTES.shop)}>
              Full shop
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal className="home-section">
        <h2 className="section-title">Picks for this path</h2>
        <div className="product-grid" style={{ marginTop: '1.25rem' }}>
          {list.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </Reveal>
    </div>
  );
}

export default CollectionPage;
