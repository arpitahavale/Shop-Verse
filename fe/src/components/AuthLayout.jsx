import { Link, Outlet } from 'react-router-dom';
import { BRAND, ROUTES } from '../constants';
import ToastStack from './common/ToastStack';

/** Standalone shell for login / register — no store navigation */
function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-shell-bg" aria-hidden>
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
      </div>

      <header className="auth-shell-header">
        <Link to={ROUTES.login} className="brand-mark auth-brand">
          <span className="brand-mark-dot" aria-hidden />
          {BRAND.name}
        </Link>
      </header>

      <main className="auth-shell-main">
        <Outlet />
      </main>

      <p className="auth-shell-foot">{BRAND.tagline}</p>
      <ToastStack />
    </div>
  );
}

export default AuthLayout;
