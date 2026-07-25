import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchProductById, fetchProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { ROUTES } from '../constants';
import { categoryPath } from '../utils/shop';
import { formatCurrency } from '../utils/format';
import {
  getMatchScore,
  getVibeById,
  suggestCompanion,
} from '../utils/vibe';
import ProductImage from '../components/common/ProductImage';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import QuantityStepper from '../components/common/QuantityStepper';
import ShimmerFallback from '../components/ShimmerFallback';

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { isAuthenticated } = useAuth();
  const { addToCart, activeVibe } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { pushToast } = useToast();

  const { data: product, loading, error } = useFetch(
    () => fetchProductById(id),
    [id]
  );
  const { data: catalog } = useFetch(fetchProducts);

  if (error) {
    return (
      <div className="error-panel">
        {error}
        <Link to={ROUTES.shop} className="text-link">
          ← Back to shop
        </Link>
      </div>
    );
  }

  if (loading || !product) {
    return <ShimmerFallback />;
  }

  const score = getMatchScore(product, activeVibe);
  const vibe = getVibeById(activeVibe);
  const saved = isWishlisted(product.id);
  const companion =
    catalog && activeVibe
      ? suggestCompanion(product, catalog, activeVibe)
      : null;

  const requireLogin = () => {
    pushToast('Log in to continue', 'info');
    navigate(ROUTES.login, { state: { from: ROUTES.product(product.id) } });
  };

  const handleAdd = async () => {
    if (!isAuthenticated) return requireLogin();
    try {
      await addToCart(product.id, quantity);
      pushToast(`${product.name} × ${quantity} added to bag`);
    } catch (err) {
      pushToast(err.message || 'Could not add to bag', 'info');
    }
  };

  const handleAddPair = async () => {
    if (!companion) return;
    if (!isAuthenticated) return requireLogin();
    try {
      await addToCart(product.id, quantity);
      await addToCart(companion.id, 1);
      pushToast('Vibe pair added — check bag for bundle savings');
    } catch (err) {
      pushToast(err.message || 'Could not add pair', 'info');
    }
  };

  return (
    <div className="page-detail">
      <nav className="breadcrumb">
        <Link to={ROUTES.home}>Home</Link>
        <span>/</span>
        <Link to={ROUTES.shop}>Shop</Link>
        <span>/</span>
        <Link to={categoryPath(product.category)}>{product.category}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </nav>

      <div className="detail-grid">
        <motion.div
          className="detail-media"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ProductImage src={product.image} alt={product.name} />
          {activeVibe && score != null && (
            <div
              className="match-ring match-ring-lg"
              style={{ '--match': `${score}%` }}
            >
              <span>{score}</span>
            </div>
          )}
        </motion.div>

        <motion.div
          className="detail-copy"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          {product.badge && <Badge tone="brand">{product.badge}</Badge>}
          <p className="detail-cat">{product.category}</p>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-meta">
            <span className="detail-price">{formatCurrency(product.price)}</span>
            <span className="detail-rating">★ {product.rating}</span>
          </div>

          <p className="detail-desc">{product.description}</p>

          {vibe && (
            <div
              className="vibe-callout"
              style={{ '--vibe-accent': vibe.accent }}
            >
              <strong>
                {score}% {vibe.label} match
              </strong>
              <span>
                Strong matches (70+) count toward your Vibe Bundle discount.
              </span>
            </div>
          )}

          <div className="detail-actions">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <Button variant="primary" className="flex-1" onClick={handleAdd}>
              Add to bag
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!isAuthenticated) return requireLogin();
                try {
                  await toggleWishlist(product.id);
                  pushToast(
                    saved ? 'Removed from wishlist' : 'Saved to wishlist'
                  );
                } catch (err) {
                  pushToast(err.message || 'Wishlist update failed', 'info');
                }
              }}
            >
              {saved ? '♥ Saved' : '♡ Save'}
            </Button>
          </div>

          {companion && (
            <motion.div
              className="companion-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="companion-copy">
                <p className="companion-label">Vibe Concierge pick</p>
                <p className="companion-name">{companion.name}</p>
                <p className="companion-meta">
                  {getMatchScore(companion, activeVibe)}% match ·{' '}
                  {formatCurrency(companion.price)}
                </p>
              </div>
              <Button variant="accent" onClick={handleAddPair}>
                Add pair
              </Button>
            </motion.div>
          )}

          <ul className="detail-perks">
            <li>
              <span>Free delivery</span>
              <strong>2–4 business days</strong>
            </li>
            <li>
              <span>Return policy</span>
              <strong>30-day free returns</strong>
            </li>
            <li>
              <span>Warranty</span>
              <strong>1 year manufacturer</strong>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
