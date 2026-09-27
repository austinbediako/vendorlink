import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookings } from '../hooks/useBookings';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { BookingsIllustration } from '../components/VisualAssets';
import { ArrowUpRight, Bell, CheckCircle2, Wrench, BadgeCheck, XCircle, CalendarDays, Wallet } from 'lucide-react';

const STATUS_META = {
  requested: { icon: Bell, tone: 'is-pending' },
  accepted: { icon: CheckCircle2, tone: 'is-active' },
  in_progress: { icon: Wrench, tone: 'is-active' },
  completed: { icon: BadgeCheck, tone: 'is-done' },
  cancelled: { icon: XCircle, tone: 'is-closed' },
  rejected: { icon: XCircle, tone: 'is-closed' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active', statuses: ['requested', 'accepted', 'in_progress'] },
  { key: 'completed', label: 'Completed', statuses: ['completed'] },
  { key: 'closed', label: 'Closed', statuses: ['cancelled', 'rejected'] },
];

export function Bookings() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading, isError, error, refetch } = useBookings();
  const [filter, setFilter] = useState('all');
  const isBusiness = user.role === 'business';

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load your bookings." onRetry={refetch} />;

  const activeFilter = FILTERS.find((f) => f.key === filter);
  const visible = activeFilter.statuses
    ? bookings.filter((b) => activeFilter.statuses.includes(b.status))
    : bookings;

  return (
    <div className="dash-page">
      <header className="dash-head bookings-head">
        <div>
          <p className="market-kicker">{isBusiness ? 'Bookings' : 'Jobs'}</p>
          <h1>{isBusiness ? 'My bookings' : 'My jobs'}</h1>
          <p className="dash-head-sub">
            {isBusiness
              ? 'Every artisan you’ve booked and where each job stands.'
              : 'Booking requests and jobs you’ve taken on, in one place.'}
          </p>
        </div>
        <div className="bookings-head-side">
          <BookingsIllustration className="bookings-head-illus" />
          {isBusiness && (
            <Link to="/bookings/new" className="btn btn-primary">Book an artisan</Link>
          )}
        </div>
      </header>

      {bookings.length === 0 ? (
        <EmptyState kind="bookings" title={isBusiness ? 'Your next project starts here.' : 'Your first job is ahead of you.'} description={isBusiness ? 'Once you book an artisan, you can follow progress and manage the details here.' : 'Accepted applications and direct bookings will appear here, ready for you to track.'} action={{ label: isBusiness ? 'Book an artisan' : 'Browse requests', to: isBusiness ? '/bookings/new' : '/service-requests' }} />
      ) : (
        <>
          <div className="applications-tabs" role="tablist">
            {FILTERS.map((f) => {
              const count = f.statuses ? bookings.filter((b) => f.statuses.includes(b.status)).length : bookings.length;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`applications-tab${filter === f.key ? ' active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label} <span className="booking-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <EmptyState compact kind="bookings" title={`No ${activeFilter.label.toLowerCase()} bookings.`} description="Switch to another tab to see the rest of your bookings." />
          ) : (
            <div className="booking-list">
              {visible.map((booking) => {
                const meta = STATUS_META[booking.status] || STATUS_META.requested;
                const Icon = meta.icon;
                return (
                  <Link key={booking.id} to={`/bookings/${booking.public_id || booking.id}`} className={`attention-row booking-row ${meta.tone}`}>
                    <span className="attention-ico" aria-hidden="true"><Icon size={16} /></span>
                    <div className="booking-row-titles">
                      <p className="booking-row-title">{booking.request_title || 'Direct booking'}</p>
                      <p className="booking-row-party">
                        {isBusiness ? `Artisan: ${booking.artisan_name || 'Unknown'}` : `Business: ${booking.business_name || 'Unknown'}`}
                      </p>
                    </div>
                    <div className="booking-row-meta">
                      {booking.scheduled_date && (
                        <span><CalendarDays size={13} aria-hidden="true" />{new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                      )}
                      {booking.agreed_price && (
                        <span className="booking-row-price"><Wallet size={13} aria-hidden="true" />GHS {booking.agreed_price}</span>
                      )}
                    </div>
                    <StatusBadge status={booking.status} />
                    <ArrowUpRight size={16} className="request-card-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
