import catalog from './catalog.json';

export const products = catalog;

/** Seed bag for first visit only (overridden once localStorage exists) */
export const cartItems = [];

export const orders = [
  {
    id: 'ORD-1042',
    date: '2026-07-10',
    status: 'Delivered',
    total: 539.97,
    items: 3,
    products: [
      { name: 'Wireless Noise-Cancel Headphones', qty: 1 },
      { name: 'Smart Fitness Tracker', qty: 2 },
    ],
  },
  {
    id: 'ORD-1038',
    date: '2026-06-28',
    status: 'Shipped',
    total: 189.0,
    items: 1,
    products: [{ name: 'Minimalist Leather Watch', qty: 1 }],
  },
  {
    id: 'ORD-1031',
    date: '2026-06-15',
    status: 'Processing',
    total: 134.98,
    items: 2,
    products: [
      { name: 'Ceramic Pour-Over Set', qty: 1 },
      { name: 'Organic Cotton Hoodie', qty: 1 },
    ],
  },
  {
    id: 'ORD-1025',
    date: '2026-05-30',
    status: 'Cancelled',
    total: 79.99,
    items: 1,
    products: [{ name: 'Organic Cotton Hoodie', qty: 1 }],
  },
];
