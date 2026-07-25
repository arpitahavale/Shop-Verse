import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  addWishlistItem,
  fetchWishlist,
  removeWishlistItem,
} from '../api/wishlist';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isAuthenticated) {
        setItems([]);
        return;
      }
      setLoading(true);
      try {
        const list = await fetchWishlist();
        if (active) setItems(list);
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
  }, [isAuthenticated, user?.id]);

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        throw new Error('Please log in to save wishlist items');
      }
      const exists = items.some((p) => p.id === productId);
      const list = exists
        ? await removeWishlistItem(productId)
        : await addWishlistItem(productId);
      setItems(list);
    },
    [isAuthenticated, items]
  );

  const isWishlisted = useCallback(
    (productId) => items.some((p) => p.id === productId),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      loading,
      ids: items.map((p) => p.id),
      count: items.length,
      toggleWishlist,
      isWishlisted,
    }),
    [items, loading, toggleWishlist, isWishlisted]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
