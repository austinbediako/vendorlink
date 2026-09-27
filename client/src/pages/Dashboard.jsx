import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useBookings } from '../hooks/useBookings';
import { useServiceRequests } from '../hooks/useServiceRequests';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StarRating } from '../components/StarRating';
import { ArrowUpRight, BellRing, Briefcase, CheckCircle2, ClipboardList, ShieldCheck, Star, Wrench } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

function StatCard({ icon: Icon, label, children }) {
  return (
    <div className="dash-stat">
      <span className="dash-stat-icon" aria-hidden="true"><Icon size={18} /></span>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{label}</span>
        <div className="dash-stat-value">{children}</div>
      </div>
    </div>
  );
}

const ATTENTION_ORDER = { requested: 0, accepted: 1, in_progress: 2 };

function AttentionList({ bookings, role }) {
  const attention = bookings
    .filter((b) => ['requested', 'accepted', 'in_progress'].includes(b.status))
    .sort((a, b) => (ATTENTION_ORDER[a.status] ?? 9) - (ATTENTION_ORDER[b.status] ?? 9));
  if (!attention.length) return null;

  const pendingCount = attention.filter((b) => b.status === 'requested').length;
  const heading = role === 'artisan' && pendingCount
    ? `${pendingCount} booking ${pendingCount === 1 ? 'request needs' : 'requests need'} your response`
    : 'Active bookings';

  return (
    <section className="dash-attention" aria-label="Bookings needing attention">
      <div className="dash-attention-head">
        <h2>{heading}</h2>
        <Link to="/bookings">View all</Link>
      </div>
      <div className="dash-attention-list">
        {attention.slice(0, 4).map((b) => {
          const pending = b.status === 'requested';
          const Ico = pending ? BellRing : Wrench;
          return (
            <Link key={b.id} to={`/bookings/${b.public_id || b.id}`} className={`attention-row${pending ? ' is-pending' : ''}`}>
              <span className="attention-ico" aria-hidden="true"><Ico size={16} /></span>
              <span className="attention-row-main">
                <strong>{b.request_title || 'Direct booking'}</strong>
                <span className="attention-row-meta">
                  {role === 'business' ? b.artisan_name : b.business_name}
                  {b.scheduled_date && <> · {new Date(b.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</>}
                  {b.agreed_price && <> · GHS {b.agreed_price}</>}
                </span>
              </span>
              <StatusBadge status={b.status} />
              <ArrowUpRight size={16} className="attention-row-arrow" aria-hidden="true" />
            </Link>
          );
        })}
        {attention.length > 4 && (
          <Link to="/bookings" className="attention-more">+{attention.length - 4} more bookings</Link>
        )}
      </div>
    </section>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const profileQuery = useProfile(!isAdmin);
  const bookingsQuery = useBookings(!isAdmin);
  const requestsQuery = useServiceRequests(user.role === 'business');
  const { data: profile, isLoading: profileLoading } = profileQuery;
  const { data: bookings = [], isLoading: bookingsLoading } = bookingsQuery;
  const { data: requests = [], isLoading: requestsLoading } = requestsQuery;

  if (isAdmin) return <Navigate to="/admin" replace />;

  const isLoading = profileLoading || bookingsLoading || requestsLoading;

  if (isLoading) return <LoadingSpinner />;
  const failedQuery = [profileQuery, bookingsQuery, requestsQuery].find((query) => query.isError);
  if (failedQuery) return <DataErrorState error={failedQuery.error} title="We couldn’t load your dashboard." onRetry={failedQuery.refetch} />;

  const completedRatings = bookings.filter((b) => b.status === 'completed' && b.rating);
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const avgRating = (completedRatings.reduce((a, b) => a + b.rating, 0) + 10) / (completedRatings.length + 2);

  const renderBusinessDashboard = () => (
    <>
      <AttentionList bookings={bookings} role="business" />
      <div className="dash-grid">
        <StatCard icon={ClipboardList} label="My requests">
          <span className="dash-stat-number">{requests.length}</span>
        </StatCard>
        <StatCard icon={Briefcase} label="Bookings">
          <span className="dash-stat-number">{bookings.length}</span>
        </StatCard>
        <StatCard icon={CheckCircle2} label="Completed jobs">
          <span className="dash-stat-number">{completedCount}</span>
        </StatCard>
      </div>
      {requests.length === 0 && bookings.length === 0 && (
        <EmptyState compact kind="activity" title="Make room for your first project." description="Post a request or find an artisan. Your bookings and requests will take shape here." />
      )}
      <div className="dash-actions">
        <Link to="/service-requests/new" className="btn btn-primary">Post service request</Link>
        <Link to="/bookings/new" className="btn btn-primary">Book an artisan</Link>
        <Link to="/artisans" className="btn btn-ghost">Browse directory</Link>
      </div>
    </>
  );

  const renderArtisanDashboard = () => (
    <>
      <AttentionList bookings={bookings} role="artisan" />
      <div className="dash-grid">
        <StatCard icon={Briefcase} label="Total jobs">
          <span className="dash-stat-number">{bookings.length}</span>
        </StatCard>
        <StatCard icon={Star} label="Average rating">
          <span className="dash-stat-number">{avgRating.toFixed(1)}</span>
          <StarRating rating={avgRating} />
          {!completedRatings.length && <span className="dash-stat-desc">No reviews yet</span>}
        </StatCard>
        <StatCard icon={ShieldCheck} label="Verification">
          <span className="dash-stat-text capitalize">{profile?.verification_status || 'Pending'}</span>
        </StatCard>
      </div>
      {bookings.length === 0 && (
        <EmptyState compact kind="bookings" title="Ready for your first collaboration?" description="Browse work that matches your skills. Your jobs and ratings will appear here as you get started." />
      )}
      <div className="dash-actions">
        <Link to="/service-requests" className="btn btn-primary">Browse available requests</Link>
      </div>
    </>
  );

  const displayName =
    (user.role === 'business' ? profile?.business_name : profile?.full_name) || user.email;

  return (
    <div className="dash-page">
      <header className="dash-head">
        <p className="market-kicker capitalize">{user.role} account</p>
        <h1>Hello, {displayName}</h1>
      </header>

      {user.role === 'business' && renderBusinessDashboard()}
      {user.role === 'artisan' && renderArtisanDashboard()}
    </div>
  );
}
