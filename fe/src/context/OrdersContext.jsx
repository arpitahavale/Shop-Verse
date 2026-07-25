import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchOrders, placeOrderRequest } from '../api/orders';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      return [];
    }
    setLoading(true);
    try {
      const list = await fetchOrders();
      setOrders(list);
      return list;
    } catch (err) {
      console.error(err);
      setOrders([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders, user?.id]);

  const placeOrder = useCallback(
    async (total) => {
      const order = await placeOrderRequest(total);
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    []
  );

  const value = useMemo(
    () => ({ orders, loading, placeOrder, refreshOrders }),
    [orders, loading, placeOrder, refreshOrders]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}
