import { CATEGORIES } from '../../constants';

function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Product categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          className={`category-chip ${active === cat ? 'category-chip-active' : ''}`}
          onClick={() => onChange(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;
