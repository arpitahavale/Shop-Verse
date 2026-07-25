import { Link } from 'react-router-dom';
import { BRAND, FOOTER_LINKS, ROUTES } from '../constants';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="footer-brand-block">
          <Link to={ROUTES.home} className="footer-brand">
            {BRAND.name}
          </Link>
          <p className="footer-tag">{BRAND.tagline}</p>
          <p className="footer-meta">
            Free shipping over $100 · 30-day returns · Vibe Bundle rewards
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title} className="footer-col">
            <p className="footer-col-title">{group.title}</p>
            <ul>
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
