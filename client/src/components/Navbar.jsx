import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { BrandMark } from './VisualAssets';
import { ProtectedImage } from './ProtectedImage';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLinkActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLinkClass = (path) => {
    const isActive = isLinkActive(path);
    return `relative px-3 py-2 text-[15px] font-medium transition-colors duration-200 group ${
      isActive ? 'text-text' : 'text-muted hover:text-text'
    }`;
  };

  const underlineClass = (path) => {
    const isActive = isLinkActive(path);
    return `absolute bottom-0 left-3 right-3 h-[2px] bg-accent transition-transform duration-280 origin-left ${
      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
    }`;
  };

  const commonLinks = [{ path: '/artisans', label: 'Find Artisans' }];

  const roleLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') return [{ path: '/admin', label: 'Dashboard' }];
    const links = [{ path: '/dashboard', label: 'Dashboard' }];
    if (user.role === 'business') {
      links.push(
        { path: '/service-requests', label: 'Requests' },
        { path: '/bookings', label: 'Bookings' }
      );
    } else if (user.role === 'artisan') {
      links.push(
        { path: '/service-requests', label: 'Requests' },
        { path: '/bookings', label: 'Jobs' }
      );
    }
    return links;
  };

  const links = user ? roleLinks() : commonLinks;

  const avatarMonogram = (user?.email || 'U').slice(0, 1).toUpperCase();
  const showAvatar = user && user.role !== 'admin';
  const avatarInner = user?.role === 'artisan' ? (
    <ProtectedImage
      src="/profile/photo"
      alt=""
      className="nav-avatar-img"
      fallback={<span className="nav-avatar-mono">{avatarMonogram}</span>}
    />
  ) : (
    <span className="nav-avatar-mono">{avatarMonogram}</span>
  );
  const avatar = showAvatar ? (
    <Link
      to="/profile/edit"
      className="nav-avatar"
      aria-label="Open your profile"
      title="Your profile"
      onClick={() => setMobileOpen(false)}
    >
      {avatarInner}
    </Link>
  ) : null;

  const cta = user ? (
    <button
      onClick={handleLogout}
      className="font-mono text-xs font-bold uppercase tracking-wider bg-transparent text-text border border-border px-4 py-2 rounded-sm hover:border-accent hover:text-accent transition-colors duration-200"
    >
      Logout
    </button>
  ) : (
    <Link
      to="/register"
      className="font-mono text-xs font-bold uppercase tracking-wider bg-accent text-white !text-white px-4 py-2 rounded-sm hover:bg-accent-deep transition-colors duration-200"
    >
      Get Started
    </Link>
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[120] bg-bg/88 backdrop-blur-[16px] backdrop-saturate-[180%] transition-[padding,border-color,box-shadow] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'border-b border-border shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_4px_16px_-2px_rgba(0,0,0,0.08)] py-3'
            : 'border-b border-transparent py-4'
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-text font-bold text-xl tracking-tight transition-all duration-240 hover:opacity-70 hover:-translate-y-[1px]"
          >
            <BrandMark className="w-7 h-7 text-accent shrink-0" />
            <span className="whitespace-nowrap">VendorLink<span className="brand-dash" aria-hidden="true">—</span></span>
          </Link>

          <ul className="hidden md:flex items-center gap-1 ml-14">
            <li>
              <Link to="/" className={navLinkClass('/')}>
                Home
                <span className={underlineClass('/')} />
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.path}>
                <Link to={link.path} className={navLinkClass(link.path)}>
                  {link.label}
                  <span className={underlineClass(link.path)} />
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3 ml-auto">
            {avatar}
            {!user && (
              <Link
                to="/login"
                className="font-mono text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition-colors duration-200 px-3 py-2"
              >
                Login
              </Link>
            )}
            {cta}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative z-[130] flex flex-col justify-center items-center w-9 h-9 border-0 bg-transparent p-2 gap-[5px]"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span
              className={`block w-5 h-[2px] bg-text transition-transform duration-280 ${
                mobileOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-text transition-opacity duration-200 ${
                mobileOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block w-5 h-[2px] bg-text transition-transform duration-280 ${
                mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 z-[115] h-full w-[min(320px,80vw)] bg-surface shadow-2xl p-6 pt-20 md:hidden">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 p-2 text-muted hover:text-text transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  to="/"
                  className="text-text font-medium text-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Home
                </Link>
              </li>
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-text font-medium text-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {showAvatar && (
                <li>
                  <Link
                    to="/profile/edit"
                    className="text-text font-medium text-lg flex items-center gap-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="nav-avatar">{avatarInner}</span>
                    Profile
                  </Link>
                </li>
              )}
              {!user && (
                <li>
                  <Link
                    to="/login"
                    className="text-muted font-medium text-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              )}
              <li className="pt-4">{cta}</li>
            </ul>
          </div>
        </>
      )}

      <div className="h-[72px] md:h-[80px]" />
    </>
  );
}
