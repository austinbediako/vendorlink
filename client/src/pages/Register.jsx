import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/toast';
import { RegisterIllustration, BrandMark, BusinessIcon, ArtisanIcon } from '../components/VisualAssets';
import { ArrowRight } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'business' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next');
  const safeTarget = next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(formData.email, formData.password, formData.role);
      showToast('Account created successfully', 'success');
      if (user.role === 'artisan') {
        navigate(`/complete-profile${nextQuery}`);
      } else {
        navigate(safeTarget);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed', 'error');
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
        <h1 className="auth-headline">Join VendorLink.</h1>
        <p className="auth-lead">
          Connect with skilled artisans, or build a reputation that brings more work your way.
        </p>
        <RegisterIllustration className="auth-illustration" />
      </div>

      <div className="auth-panel auth-panel--form">
        <div className="auth-card">
          <h2 className="auth-title">Create your account</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="register-email">Email address</label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@company.com"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
              />
            </div>
            <fieldset className="auth-role-fieldset">
              <legend>I am joining as</legend>
              <div className="auth-role-toggle">
                <button
                  type="button"
                  className={formData.role === 'business' ? 'is-active' : ''}
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'business' }))}
                  aria-pressed={formData.role === 'business'}
                >
                  <BusinessIcon size={20} />
                  <span>Business</span>
                </button>
                <button
                  type="button"
                  className={formData.role === 'artisan' ? 'is-active' : ''}
                  onClick={() => setFormData((prev) => ({ ...prev, role: 'artisan' }))}
                  aria-pressed={formData.role === 'artisan'}
                >
                  <ArtisanIcon size={20} />
                  <span>Artisan</span>
                </button>
              </div>
              <input type="hidden" name="role" value={formData.role} />
            </fieldset>
            <button
              type="submit"
              disabled={loading}
              className="auth-submit"
            >
              <span>{loading ? 'Creating account…' : 'Create account'}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="auth-footer">
            Already have an account?{' '}
            <Link to={`/login${nextQuery}`} className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
