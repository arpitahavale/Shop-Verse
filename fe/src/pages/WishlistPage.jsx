import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { ROUTES } from '../constants';
import ProductCard from '../components/common/ProductCard';
import EmptyState from '../components/common/EmptyState';
import Reveal from '../components/common/Reveal';

function WishlistPage() {
  const navigate = useNavigate();
  const { items } = useWishlist();

  if (!items.length) {
    return (
      <EmptyState
        title="Wishlist is empty"
        description="Tap the heart on any product to save it here across sessions."
        actionLabel="Browse shop"
        onAction={() => navigate(ROUTES.shop)}
      />
    );
  }

  return (
    <div className="page-wishlist">
      <Reveal>
        <p className="section-eyebrow">Saved</p>
        <h1 className="page-title">Wishlist</h1>
        <p className="page-sub">{items.length} pieces waiting for you</p>
      </Reveal>
      <div className="product-grid" style={{ marginTop: '1.5rem' }}>
        {items.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}

export default WishlistPage;
