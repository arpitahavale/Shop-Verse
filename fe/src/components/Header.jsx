import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BRAND,
  CATEGORIES,
  NAV_LINKS,
  ROUTES,
} from '../constants';
import { categoryPath } from '../utils/shop';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getVibeById } from '../utils/vibe';

const navClass = ({ isActive }) =>
  `nav-link ${isActive ? 'nav-link-active' : ''}`;

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount, activeVibe, lastAddedId } = useCart();
  const { count: wishCount } = useWishlist();
  const vibe = getVibeById(activeVibe);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setShopOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.home);
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button
          type="button"
          className="nav-burger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <Link to={ROUTES.home} className="brand-mark">
          <span className="brand-mark-dot" aria-hidden />
          {BRAND.name}
        </Link>

        <nav className="site-nav desktop-nav" aria-label="Primary">
          {NAV_LINKS.map(({ to, label, end }) =>
            label === 'Shop' ? (
              <div
                key={to}
                className="nav-dropdown"
                onMouseEnter={() => setShopOpen(true)}
                onMouseLeave={() => setShopOpen(false)}
              >
                <NavLink to={to} className={navClass}>
                  Shop
                  <span className="nav-caret" aria-hidden>
                    ▾
                  </span>
                </NavLink>
                <AnimatePresence>
                  {shopOpen && (
                    <motion.div
                      className="mega-menu"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link to={ROUTES.shop} className="mega-link mega-link-all">
                        All products
                      </Link>
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat}
                          to={categoryPath(cat)}
                          className="mega-link"
                        >
                          {cat}
                        </Link>
                      ))}
                      <Link to={ROUTES.vibe} className="mega-link mega-accent">
                        Shop by Vibe →
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <NavLink key={to} to={to} end={end} className={navClass}>
                {label}
                {to === ROUTES.wishlist && wishCount > 0 && (
                  <span className="cart-badge cart-badge-on cart-badge-wish">
                    {wishCount}
                  </span>
                )}
              </NavLink>
            )
          )}
        </nav>

        <div className="header-actions">
          {vibe && (
            <Link
              to={ROUTES.vibe}
              className="header-vibe"
              style={{ '--vibe-accent': vibe.accent }}
            >
              <span className="header-vibe-dot" />
              {vibe.label}
            </Link>
          )}

          <div className="header-user">
            <span className="header-user-name">{user?.name?.split(' ')[0]}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </div>

          <NavLink to={ROUTES.cart} className="cart-launch">
            Bag
            <span
              className={`cart-badge ${lastAddedId ? 'cart-badge-bounce' : ''} ${
                cartCount ? 'cart-badge-on' : ''
              }`}
            >
              {cartCount}
            </span>
          </NavLink>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-nav-sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.nav
              className="mobile-nav-panel"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              aria-label="Mobile"
            >
              <p className="mobile-nav-label">Navigate</p>
              {NAV_LINKS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className="mobile-nav-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <p className="mobile-nav-label">Account</p>
              <button
                type="button"
                className="mobile-nav-link"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                Log out ({user?.name})
              </button>
              <p className="mobile-nav-label">Categories</p>
              {CATEGORIES.map((cat) => (
                <NavLink
                  key={cat}
                  to={categoryPath(cat)}
                  className="mobile-nav-link mobile-nav-sub"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </NavLink>
              ))}
              <NavLink
                to={ROUTES.cart}
                className="mobile-nav-link mobile-nav-cart"
                onClick={() => setMenuOpen(false)}
              >
                Bag ({cartCount})
              </NavLink>
            </motion.nav>
            <button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
