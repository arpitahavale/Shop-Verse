import { SORT_OPTIONS } from '../../constants';

function ShopToolbar({
  resultCount,
  sort,
  onSortChange,
  search,
  onSearchChange,
}) {
  const activeLabel =
    SORT_OPTIONS.find((opt) => opt.id === sort)?.label || 'Featured';

  return (
    <div className="shop-toolbar">
      <p className="shop-count">{resultCount} products</p>
      <div className="shop-toolbar-controls">
        <label className="shop-search">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            placeholder="Search the floor…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
        <label className="shop-sort">
          <span className="sr-only">Sort by {activeLabel}</span>
          <select
            className="shop-sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="shop-sort-caret" aria-hidden>
            ▾
          </span>
        </label>
      </div>
    </div>
  );
}

export default ShopToolbar;
