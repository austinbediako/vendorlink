import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useBooking,
  useUpdateBookingStatusMutation,
  useSubmitRatingMutation,
  useRaiseDisputeMutation,
} from '../hooks/useBookings';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { MapDisplay } from '../components/MapDisplay';
import { BookingsIllustration } from '../components/VisualAssets';
import { ArrowLeft, Star, ShieldAlert, Lock, ArrowUpRight, MapPin, Wallet, CalendarDays } from 'lucide-react';

export function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useBooking(id);
  const updateStatus = useUpdateBookingStatusMutation();
  const submitRating = useSubmitRatingMutation();
  const raiseDispute = useRaiseDisputeMutation();

  const booking = data?.booking;
  const history = data?.history || [];
  const disputes = data?.disputes || [];
  const showExactLocation = data?.showExactLocation || false;

  const [rating, setRating] = useState({ rating: 5, review: '' });
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const handleStatusChange = async (status) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      showToast(`Booking ${status.replace('_', ' ')}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await submitRating.mutateAsync({
        bookingId: booking.id,
        rating: parseInt(rating.rating, 10),
        review: rating.review,
      });
      showToast('Rating submitted', 'success');
      setRating({ rating: 5, review: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit rating', 'error');
    }
  };

  const handleRaiseDispute = async (e) => {
    e.preventDefault();
    try {
      await raiseDispute.mutateAsync({ bookingId: id, reason: disputeReason });
      showToast('Dispute raised', 'success');
      setShowDisputeForm(false);
      setDisputeReason('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to raise dispute', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load this booking." onRetry={refetch} backTo="/bookings" backLabel="Back to bookings" />;
  if (!booking) return <EmptyState kind="not-found" title="This booking isn’t available." description="Return to your bookings to find an existing job." action={{ label: 'Back to bookings', to: '/bookings' }} />;

  const isBusiness = user.role === 'business';
  const counterpart = isBusiness ? `Artisan: ${booking.artisan_name || '—'}` : `Business: ${booking.business_name || '—'}`;
  const canAccept = user.role === 'artisan' && booking.status === 'requested';
  const canStart = user.role === 'artisan' && booking.status === 'accepted';
  const canComplete = user.role === 'artisan' && booking.status === 'in_progress';
  const canCancel = isBusiness && booking.status === 'requested';
  const canRate = isBusiness && booking.status === 'completed';
  const canRaiseDispute =
    (isBusiness || user.role === 'artisan') &&
    !['completed', 'cancelled', 'rejected'].includes(booking.status);

  return (
    <div className="dash-page booking-detail-page">
      <Link to="/bookings" className="dispute-back">
        <ArrowLeft size={15} aria-hidden="true" /> Back to {isBusiness ? 'bookings' : 'jobs'}
      </Link>

      <header className="dispute-head">
        <div className="dispute-head-copy">
          <p className="market-kicker">Booking {booking.public_id || `#${booking.id}`}</p>
          <h1>{booking.request_title || 'Direct booking'}</h1>
          <p className="dash-head-sub">{counterpart}</p>
        </div>
        <div className="dispute-head-side">
          <BookingsIllustration className="dispute-illustration" />
          <StatusBadge status={booking.status} />
        </div>
      </header>

      <div className="booking-detail-card">
        <div className="booking-detail-meta">
          <span><MapPin size={14} aria-hidden="true" />{booking.business_location || booking.artisan_location || 'Location not set'}</span>
          <span className="booking-detail-price"><Wallet size={14} aria-hidden="true" />GHS {booking.agreed_price || 'Not set'}</span>
          {booking.scheduled_date && (
            <span><CalendarDays size={14} aria-hidden="true" />{new Date(booking.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          )}
        </div>

        {showExactLocation ? (
          (booking.business_latitude && booking.business_longitude) || (booking.artisan_latitude && booking.artisan_longitude) ? (
            <div className="booking-detail-maps">
              {booking.business_latitude && booking.business_longitude && (
                <MapDisplay
                  latitude={booking.business_latitude}
                  longitude={booking.business_longitude}
                  locationName={`Business: ${booking.business_location}`}
                />
              )}
              {booking.artisan_latitude && booking.artisan_longitude && (
                <MapDisplay
                  latitude={booking.artisan_latitude}
                  longitude={booking.artisan_longitude}
                  locationName={`Artisan: ${booking.artisan_location}`}
                />
              )}
            </div>
          ) : null
        ) : (
          <div className="booking-policy-note">
            <Lock size={14} aria-hidden="true" />
            <p>Exact locations are hidden until this booking is accepted.</p>
          </div>
        )}

        {canAccept && (
          <div className="booking-warning">
            <ShieldAlert size={16} aria-hidden="true" />
            <p>
              <strong>Before you accept:</strong> accepting commits you to this job. Once accepted,
              neither you nor the business can cancel it directly — cancellations only happen through
              VendorLink customer service. If something goes wrong later, raise a dispute below.
            </p>
          </div>
        )}

        {['accepted', 'in_progress'].includes(booking.status) && (
          <div className="booking-policy-note">
            <Lock size={14} aria-hidden="true" />
            <p>
              This booking is accepted and locked in — it can only be cancelled through VendorLink
              customer service. Raise a dispute below and the team will review it.
            </p>
          </div>
        )}

        {canCancel && (
          <p className="booking-policy-inline">
            You can cancel while this request is pending. Once the artisan accepts, cancellations go
            through customer service.
          </p>
        )}

        <div className="booking-actions">
          {canAccept && (
            <>
              <button
                onClick={() => handleStatusChange('accepted')}
                disabled={updateStatus.isPending}
                className="btn btn-primary"
              >
                Accept booking
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                disabled={updateStatus.isPending}
                className="btn btn-ghost btn-danger-ghost"
              >
                Decline
              </button>
            </>
          )}
          {canStart && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={updateStatus.isPending}
              className="btn btn-primary"
            >
              Start job
            </button>
          )}
          {canComplete && (
            <button
              onClick={() => handleStatusChange('completed')}
              disabled={updateStatus.isPending}
              className="btn btn-primary"
            >
              Mark as completed
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={updateStatus.isPending}
              className="btn btn-ghost btn-danger-ghost"
            >
              Cancel booking
            </button>
          )}
        </div>
      </div>

      <section className="booking-detail-card">
        <h2 className="booking-detail-section-title">Status history</h2>
        {history.length === 0 ? (
          <EmptyState compact kind="activity" title="No status updates yet." description="Changes to this booking will be recorded here as the job progresses." />
        ) : (
          <div className="booking-history">
            {history.map((entry) => (
              <div key={entry.id} className="booking-history-item">
                <span className="booking-history-dot" aria-hidden="true" />
                <div>
                  <p className="booking-history-status">{entry.status.replace('_', ' ')}</p>
                  <p className="booking-history-notes">{entry.notes}</p>
                  <p className="booking-history-date">{new Date(entry.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {canRate && (
        <section className="booking-detail-card">
          <h2 className="booking-detail-section-title">
            <Star size={17} aria-hidden="true" className="booking-star-ico" /> Rate {booking.artisan_name || 'the artisan'}
          </h2>
          <form onSubmit={handleSubmitRating} className="booking-rate-form">
            <label className="field">
              <span className="field-label">Rating</span>
              <select
                value={rating.rating}
                onChange={(e) => setRating({ ...rating, rating: e.target.value })}
              >
                <option value="5">5 — Excellent</option>
                <option value="4">4 — Good</option>
                <option value="3">3 — Average</option>
                <option value="2">2 — Poor</option>
                <option value="1">1 — Terrible</option>
              </select>
            </label>
            <label className="field">
              <span className="field-label">Review</span>
              <textarea
                required
                rows={3}
                placeholder="How was the work?"
                value={rating.review}
                onChange={(e) => setRating({ ...rating, review: e.target.value })}
              />
            </label>
            <button type="submit" disabled={submitRating.isPending} className="btn btn-primary">
              {submitRating.isPending ? 'Submitting…' : 'Submit rating'}
            </button>
          </form>
        </section>
      )}

      {(disputes.length > 0 || canRaiseDispute) && (
        <section className="booking-detail-card">
          <h2 className="booking-detail-section-title">Disputes &amp; cancellations</h2>
          <p className="booking-policy-inline">
            Cancellations are handled by customer service. Raise a dispute and the VendorLink team
            will review it.
          </p>

          {disputes.length > 0 && (
            <div className="dispute-list">
              {disputes.map((dispute) => (
                <Link key={dispute.id} to={`/disputes/${dispute.id}`} className="dispute-row">
                  <StatusBadge status={dispute.status} />
                  <span className="dispute-row-reason">{dispute.reason}</span>
                  <span className="dispute-row-date">
                    {new Date(dispute.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <ArrowUpRight size={15} className="dispute-row-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          )}

          {canRaiseDispute && (!showDisputeForm ? (
            <button onClick={() => setShowDisputeForm(true)} className="btn btn-ghost btn-danger-ghost">
              Report an issue
            </button>
          ) : (
            <form onSubmit={handleRaiseDispute} className="booking-rate-form">
              <label className="field">
                <span className="field-label">What happened?</span>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue — customer service will review it."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                />
              </label>
              <div className="booking-actions">
                <button type="submit" disabled={raiseDispute.isPending} className="btn btn-primary">
                  {raiseDispute.isPending ? 'Submitting…' : 'Submit dispute'}
                </button>
                <button type="button" onClick={() => setShowDisputeForm(false)} className="btn btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
