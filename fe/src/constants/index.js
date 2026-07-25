export const BRAND = {
  name: 'ShopVerse',
  tagline: 'Shop by feel, not just by filter',
  heroLine: 'A store that moves with your mood',
};

export const ROUTES = {
  home: '/',
  shop: '/shop',
  shopCategory: (category) => `/shop/${encodeURIComponent(category.toLowerCase())}`,
  vibe: '/vibe',
  wishlist: '/wishlist',
  product: (id) => `/product/${id}`,
  cart: '/cart',
  orders: '/orders',
  collection: (slug) => `/collections/${slug}`,
  login: '/login',
  register: '/register',
};

export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home',
  'Footwear',
  'Accessories',
];

export const CATEGORY_META = {
  electronics: {
    label: 'Electronics',
    blurb: 'Focus tools and body tech that stay out of the way.',
    image: '/images/cat-electronics.jpg',
  },
  clothing: {
    label: 'Clothing',
    blurb: 'Soft layers for home days and city miles.',
    image: '/images/cat-clothing.jpg',
  },
  home: {
    label: 'Home',
    blurb: 'Ritual objects that make everyday feel intentional.',
    image: '/images/cat-home.jpg',
  },
  footwear: {
    label: 'Footwear',
    blurb: 'Cushioned steps for people who keep moving.',
    image: '/images/cat-footwear.jpg',
  },
  accessories: {
    label: 'Accessories',
    blurb: 'Finishing pieces that carry the outfit.',
    image: '/images/cat-accessories.jpg',
  },
};

export const COLLECTIONS = [
  {
    slug: 'workday-flow',
    title: 'Workday Flow',
    blurb: 'Desk-ready pieces for deep focus blocks.',
    vibe: 'focus',
    image: '/images/col-workday.jpg',
  },
  {
    slug: 'weekend-motion',
    title: 'Weekend Motion',
    blurb: 'Gear for runs, rambles, and outdoors.',
    vibe: 'motion',
    image: '/images/col-weekend.jpg',
  },
  {
    slug: 'soft-nest',
    title: 'Soft Nest',
    blurb: 'Home comforts that slow the morning down.',
    vibe: 'nest',
    image: '/images/col-nest.jpg',
  },
];

export const SHIPPING = {
  freeThreshold: 100,
  flatRate: 9.99,
};

export const ORDER_STATUS = {
  Delivered: 'Delivered',
  Shipped: 'Shipped',
  Processing: 'Processing',
  Cancelled: 'Cancelled',
};

export const ORDER_STATUS_STYLES = {
  Delivered: 'status-delivered',
  Shipped: 'status-shipped',
  Processing: 'status-processing',
  Cancelled: 'status-cancelled',
};

export const VIBES = [
  {
    id: 'focus',
    label: 'Deep Focus',
    blurb: 'Clean tools that disappear into your flow',
    accent: '#0D9488',
  },
  {
    id: 'motion',
    label: 'In Motion',
    blurb: 'Built for pace, sweat, and outdoor miles',
    accent: '#EA580C',
  },
  {
    id: 'nest',
    label: 'Soft Nest',
    blurb: 'Home rituals and everyday comfort',
    accent: '#65A30D',
  },
  {
    id: 'signal',
    label: 'Bold Signal',
    blurb: 'Statement pieces that turn heads',
    accent: '#DB2777',
  },
];

export const VIBE_BUNDLE_DISCOUNT = 0.12;

export const TOAST_DURATION_MS = 2800;

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' },
  { id: 'vibe', label: 'Best Vibe Match' },
];

/** Primary desktop nav */
export const NAV_LINKS = [
  { to: ROUTES.home, label: 'Home', end: true },
  { to: ROUTES.shop, label: 'Shop', end: false },
  { to: ROUTES.vibe, label: 'Vibe Studio', end: false },
  { to: ROUTES.wishlist, label: 'Wishlist', end: false },
  { to: ROUTES.orders, label: 'Orders', end: false },
];

export const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: ROUTES.shop },
      { label: 'Electronics', to: ROUTES.shopCategory('electronics') },
      { label: 'Clothing', to: ROUTES.shopCategory('clothing') },
      { label: 'Home', to: ROUTES.shopCategory('home') },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Vibe Studio', to: ROUTES.vibe },
      { label: 'Workday Flow', to: ROUTES.collection('workday-flow') },
      { label: 'Weekend Motion', to: ROUTES.collection('weekend-motion') },
      { label: 'Soft Nest', to: ROUTES.collection('soft-nest') },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Wishlist', to: ROUTES.wishlist },
      { label: 'Bag', to: ROUTES.cart },
      { label: 'Orders', to: ROUTES.orders },
    ],
  },
];
