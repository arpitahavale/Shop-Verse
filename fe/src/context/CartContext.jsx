import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addCartItem,
  clearCartRequest,
  fetchCart,
  removeCartItem,
  replaceCart,
} from '../api/cart';
import { calcCartTotals, getCartCount } from '../utils/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, isAuthenticated, setActiveVibeOnUser } = useAuth();
  const [items, setItems] = useState([]);
  const [activeVibe, setActiveVibeState] = useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isAuthenticated) {
        setItems([]);
        setActiveVibeState(null);
        return;
      }
      setLoading(true);
      try {
        const cart = await fetchCart();
        if (active) {
          setItems(cart);
          setActiveVibeState(user?.activeVibe || null);
        }
      } catch (err) {
        console.error(err);
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id, user?.activeVibe]);

  const setActiveVibe = useCallback(
    async (vibeId) => {
      const next = vibeId || null;
      setActiveVibeState(next);
      if (isAuthenticated) {
        try {
          await setActiveVibeOnUser(next);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [isAuthenticated, setActiveVibeOnUser]
  );

  const toggleVibe = useCallback(
    async (vibeId) => {
      const next = activeVibe === vibeId ? null : vibeId;
      await setActiveVibe(next);
    },
    [activeVibe, setActiveVibe]
  );

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        throw new Error('Please log in to add items to your bag');
      }
      const cart = await addCartItem(productId, quantity);
      setItems(cart);
      setLastAddedId(productId);
      window.setTimeout(() => setLastAddedId(null), 700);
      return true;
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!isAuthenticated) return;
      const cart = await removeCartItem(productId);
      setItems(cart);
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!isAuthenticated) return;
      if (quantity < 1) {
        const cart = await removeCartItem(productId);
        setItems(cart);
        return;
      }
      const next = items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      setItems(next);
      const cart = await replaceCart(next);
      setItems(cart);
    },
    [isAuthenticated, items]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    await clearCartRequest();
    setItems([]);
  }, [isAuthenticated]);

  const totals = useMemo(
    () => calcCartTotals(items, activeVibe),
    [items, activeVibe]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      activeVibe,
      setActiveVibe,
      toggleVibe,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totals,
      cartCount: getCartCount(items),
      lastAddedId,
    }),
    [
      items,
      loading,
      activeVibe,
      setActiveVibe,
      toggleVibe,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totals,
      lastAddedId,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
