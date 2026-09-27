import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import { LoginIllustration } from '../components/VisualAssets';
import { BrandMark } from '../components/VisualAssets';
import { ArrowRight } from 'lucide-react';

export function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const safeTarget = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      showToast('Login successful', 'success');
      navigate(safeTarget);
    } catch (err) {
      showToast(err.response?.data?.message || err?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel--brand">
        <Link to="/" className="auth-brand">
          <BrandMark className="w-7 h-7 text-accent" />
          <span className="whitespace-nowrap">
            VendorLink<span className="brand-dash" aria-hidden="true">—</span>
          </span>
        </Link>
        <h1 className="auth-headline">Welcome back.</h1>
        <p className="auth-lead">
          Sign in to discover verified artisans, manage bookings, and keep your projects moving.
        </p>
        <LoginIllustration className="auth-illustration" />
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h2 className="auth-title">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              <span>{loading ? 'Signing in…' : 'Sign in'}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to={`/register${nextQuery}`} className="auth-link">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
