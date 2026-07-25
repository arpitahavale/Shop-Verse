import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import { useFetch } from '../hooks/useFetch';
import { useCart } from '../context/CartContext';
import { CATEGORY_META } from '../constants';
import { categoryFromSlug, sortProducts } from '../utils/shop';
import { sortByVibeMatch } from '../utils/vibe';
import CategoryRail from '../components/shop/CategoryRail';
import ShopToolbar from '../components/shop/ShopToolbar';
import ProductCard from '../components/common/ProductCard';
import Reveal from '../components/common/Reveal';
import ShimmerFallback from '../components/ShimmerFallback';

function ShopPage() {
  const { category: categorySlug } = useParams();
  const activeCategory = categoryFromSlug(categorySlug || '');
  const { activeVibe } = useCart();
  const { data: products, loading, error } = useFetch(fetchProducts);
  const [sort, setSort] = useState(activeVibe ? 'vibe' : 'featured');
  const [search, setSearch] = useState('');

  const meta = categorySlug
    ? CATEGORY_META[decodeURIComponent(categorySlug).toLowerCase()]
    : null;

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products;
    if (activeCategory) {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    if (sort === 'featured' && activeVibe) {
      return sortByVibeMatch(list, activeVibe);
    }
    return sortProducts(list, sort, activeVibe);
  }, [products, activeCategory, search, sort, activeVibe]);

  if (error) {
    return <div className="error-panel">Failed to load products: {error}</div>;
  }

  if (loading || !products) return <ShimmerFallback />;

  return (
    <div className="page-shop">
      <Reveal className="shop-hero">
        {meta ? (
          <div className="shop-hero-banner">
            <img src={meta.image} alt="" />
            <div className="shop-hero-copy">
              <p className="section-eyebrow">Category</p>
              <h1 className="page-title">{meta.label}</h1>
              <p className="page-sub">{meta.blurb}</p>
            </div>
          </div>
        ) : (
          <div className="shop-hero-plain">
            <p className="section-eyebrow">Catalog</p>
            <h1 className="page-title">Shop all</h1>
            <p className="page-sub">
              Browse every aisle, search the floor, or sort by vibe match.
            </p>
          </div>
        )}
      </Reveal>

      <CategoryRail activeCategory={activeCategory} />

      <ShopToolbar
        resultCount={filtered.length}
        sort={sort}
        onSortChange={setSort}
        search={search}
        onSearchChange={setSearch}
      />

      {filtered.length === 0 ? (
        <p className="catalog-empty">No products match your filters.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShopPage;
