import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants';
import { formatCurrency } from '../../utils/format';
import { getMatchLabel, getMatchScore } from '../../utils/vibe';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import Badge from './Badge';
import Button from './Button';
import ProductImage from './ProductImage';

function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, activeVibe, lastAddedId } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { pushToast } = useToast();
  const score = getMatchScore(product, activeVibe);
  const matchLabel = getMatchLabel(score);
  const justAdded = lastAddedId === product.id;
  const saved = isWishlisted(product.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      pushToast('Log in to add items to your bag', 'info');
      navigate(ROUTES.login, { state: { from: ROUTES.shop } });
      return;
    }
    try {
      await addToCart(product.id, 1);
      pushToast(`${product.name} added to bag`);
    } catch (err) {
      pushToast(err.message || 'Could not add to bag', 'info');
    }
  };

  const handleWish = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      pushToast('Log in to save wishlist items', 'info');
      navigate(ROUTES.login, { state: { from: ROUTES.wishlist } });
      return;
    }
    try {
      await toggleWishlist(product.id);
      pushToast(
        saved ? 'Removed from wishlist' : 'Saved to wishlist',
        saved ? 'info' : 'success'
      );
    } catch (err) {
      pushToast(err.message || 'Wishlist update failed', 'info');
    }
  };

  return (
    <motion.article
      className={`product-card ${justAdded ? 'product-card-pulse' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
    >
      <Link to={ROUTES.product(product.id)} className="product-card-media">
        <ProductImage src={product.image} alt={product.name} />
        {product.badge && <Badge tone="brand">{product.badge}</Badge>}
        {activeVibe && score != null && (
          <div
            className="match-ring"
            style={{ '--match': `${score}%` }}
            title={`${score}% vibe match`}
          >
            <span>{score}</span>
          </div>
        )}
        <button
          type="button"
          className={`wish-btn ${saved ? 'wish-btn-on' : ''}`}
          onClick={handleWish}
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {saved ? '♥' : '♡'}
        </button>
      </Link>

      <div className="product-card-body">
        <p className="product-card-cat">{product.category}</p>
        <Link to={ROUTES.product(product.id)}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        {matchLabel && <p className="product-card-match">{matchLabel}</p>}
        <div className="product-card-footer">
          <div>
            <p className="product-card-price">{formatCurrency(product.price)}</p>
            <p className="product-card-rating">★ {product.rating}</p>
          </div>
          <Button variant="accent" className="btn-sm" onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
