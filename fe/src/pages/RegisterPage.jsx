import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BRAND, ROUTES } from '../constants';
import Button from '../components/common/Button';

function RegisterPage() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      pushToast('Account created — welcome in');
      navigate(ROUTES.home, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-panel animate-fade-up">
      <p className="section-eyebrow">Join {BRAND.name}</p>
      <h1 className="auth-title">Create your account</h1>
      <p className="auth-lead">
        Sign up to browse the floor, save wishlist items, and check out with
        vibe bundle rewards.
      </p>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>

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
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Creating…' : 'Create account'}
        </Button>
      </form>

      <p className="auth-switch">
        Already shopping? <Link to={ROUTES.login}>Sign in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
