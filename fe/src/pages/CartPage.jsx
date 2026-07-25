import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useToast } from '../context/ToastContext';
import { ROUTES, SHIPPING, VIBE_BUNDLE_DISCOUNT } from '../constants';
import { formatCurrency, pluralize } from '../utils/format';
import { getVibeById } from '../utils/vibe';
import ProductImage from '../components/common/ProductImage';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import QuantityStepper from '../components/common/QuantityStepper';

function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totals,
    activeVibe,
  } = useCart();
  const { placeOrder } = useOrders();
  const { pushToast } = useToast();
  const vibe = getVibeById(activeVibe);
  const discountPct = Math.round(VIBE_BUNDLE_DISCOUNT * 100);

  const handleCheckout = async () => {
    try {
      const order = await placeOrder(totals.total);
      await clearCart();
      pushToast(`Order ${order.id} placed — now Processing`);
      navigate(ROUTES.orders);
    } catch (err) {
      pushToast(err.message || 'Checkout failed', 'info');
    }
  };

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Explore the floor or activate a vibe to discover pieces that fit your energy."
        actionLabel="Continue shopping"
        onAction={() => navigate(ROUTES.shop)}
      />
    );
  }

  const amountToFreeShip = Math.max(
    0,
    SHIPPING.freeThreshold - (totals.subtotal - totals.vibeDiscount)
  );

  return (
    <div className="page-cart animate-fade-up">
      <header className="page-header">
        <h1 className="page-title">Your bag</h1>
        <p className="page-sub">{pluralize(items.length, 'item')} ready to go</p>
      </header>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article key={item.productId} className="cart-row">
              <Link
                to={ROUTES.product(item.product.id)}
                className="cart-thumb"
              >
                <ProductImage src={item.product.image} alt={item.product.name} />
              </Link>
              <div className="cart-row-body">
                <div>
                  <Link
                    to={ROUTES.product(item.product.id)}
                    className="cart-name"
                  >
                    {item.product.name}
                  </Link>
                  <p className="cart-cat">{item.product.category}</p>
                </div>
                <div className="cart-row-actions">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(qty) => updateQuantity(item.productId, qty)}
                    min={1}
                  />
                  <span className="cart-line-total">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="cart-remove"
                onClick={() => {
                  removeFromCart(item.productId);
                  pushToast('Removed from bag', 'info');
                }}
              >
                Remove
              </button>
            </article>
          ))}
        </div>

        <aside className="order-summary">
          <h2>Order summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.vibeDiscount > 0 && (
              <div className="summary-row summary-discount">
                <span>
                  Vibe Bundle (−{discountPct}%)
                  {vibe ? ` · ${vibe.label}` : ''}
                </span>
                <span>−{formatCurrency(totals.vibeDiscount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>
                {totals.shipping === 0
                  ? 'FREE'
                  : formatCurrency(totals.shipping)}
              </span>
            </div>
            {totals.shipping > 0 && (
              <p className="summary-hint">
                Add {formatCurrency(amountToFreeShip)} more for free shipping
              </p>
            )}
            {activeVibe && totals.vibeDiscount === 0 && (
              <p className="summary-hint">
                Add 2+ strong vibe matches (70+) to unlock {discountPct}% off
              </p>
            )}
            <div className="summary-total">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
          <Button variant="primary" className="w-full" onClick={handleCheckout}>
            Proceed to checkout
          </Button>
          <Link to={ROUTES.shop} className="text-link summary-continue">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
