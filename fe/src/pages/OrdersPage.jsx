import { useState } from 'react';
import { useOrders } from '../context/OrdersContext';
import { ORDER_STATUS_STYLES } from '../constants';
import { formatCurrency, formatDate, pluralize } from '../utils/format';
import Button from '../components/common/Button';

function OrdersPage() {
  const { orders } = useOrders();
  const [openId, setOpenId] = useState(null);

  const totalSpent = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="page-orders animate-fade-up">
      <header className="orders-header">
        <div>
          <h1 className="page-title">Order history</h1>
          <p className="page-sub">Track and revisit your past purchases</p>
        </div>
        <div className="orders-spent">
          <p>Total spent</p>
          <strong>{formatCurrency(totalSpent)}</strong>
        </div>
      </header>

      <div className="orders-list">
        {orders.map((order, index) => {
          const isOpen = openId === order.id;
          return (
            <article key={order.id} className="order-card">
              <div className="order-card-main">
                <div className="order-index">{index + 1}</div>
                <div>
                  <p className="order-id">{order.id}</p>
                  <p className="order-meta">
                    {formatDate(order.date)} · {pluralize(order.items, 'item')}
                  </p>
                </div>
                <span
                  className={`order-status ${
                    ORDER_STATUS_STYLES[order.status] ||
                    ORDER_STATUS_STYLES.Processing
                  }`}
                >
                  {order.status}
                </span>
                <div className="order-total-block">
                  <p className="order-total">{formatCurrency(order.total)}</p>
                  <Button
                    variant="ghost"
                    className="btn-sm"
                    onClick={() =>
                      setOpenId((prev) => (prev === order.id ? null : order.id))
                    }
                  >
                    {isOpen ? 'Hide details' : 'View details'}
                  </Button>
                </div>
              </div>

              {isOpen && (
                <div className="order-details animate-fade-up">
                  <p className="order-details-label">Items in this order</p>
                  <ul>
                    {(order.products || []).map((line) => (
                      <li key={`${order.id}-${line.name}`}>
                        <span>{line.name}</span>
                        <span>× {line.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersPage;
