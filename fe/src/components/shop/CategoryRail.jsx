import { Link, NavLink } from 'react-router-dom';
import { CATEGORIES, ROUTES } from '../../constants';
import { categoryPath } from '../../utils/shop';

function CategoryRail({ activeCategory = null }) {
  return (
    <div className="category-rail" role="navigation" aria-label="Categories">
      <NavLink
        to={ROUTES.shop}
        end
        className={({ isActive }) =>
          `category-chip ${isActive && !activeCategory ? 'category-chip-active' : ''}`
        }
      >
        All
      </NavLink>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          to={categoryPath(cat)}
          className={`category-chip ${
            activeCategory === cat ? 'category-chip-active' : ''
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}

export default CategoryRail;
