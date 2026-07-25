import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BRAND, ROUTES } from '../constants';
import Button from '../components/common/Button';

function LoginPage() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('demo@shopverse.com');
  const [password, setPassword] = useState('Demo@123');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const from =
    location.state?.from && location.state.from !== ROUTES.login
      ? location.state.from
      : ROUTES.home;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      pushToast('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-panel animate-fade-up">
      <p className="section-eyebrow">Welcome back</p>
      <h1 className="auth-title">Sign in to {BRAND.name}</h1>
      <p className="auth-lead">
        Access the shop, vibe studio, bag, and orders. Demo account is
        pre-filled for a quick start.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <label className="auth-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="auth-switch">
        New here? <Link to={ROUTES.register}>Create an account</Link>
      </p>
      <p className="auth-demo-hint">demo@shopverse.com · Demo@123</p>
    </div>
  );
}

export default LoginPage;
