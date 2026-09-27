import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDispute, useWithdrawDisputeMutation } from '../hooks/useBookings';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { DisputeIllustration } from '../components/VisualAssets';
import { ArrowLeft, ArrowUpRight, Flag, MessageSquare, CalendarDays, Wallet } from 'lucide-react';

export function DisputeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: dispute, isLoading, isError, error, refetch } = useDispute(id);
  const withdraw = useWithdrawDisputeMutation();
  const [confirming, setConfirming] = useState(false);

  const handleWithdraw = async () => {
    try {
      await withdraw.mutateAsync(id);
      showToast('Dispute withdrawn', 'success');
      setConfirming(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to withdraw dispute', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load this report." onRetry={refetch} backTo="/bookings" backLabel="Back to bookings" />;
  if (!dispute) return <EmptyState kind="not-found" title="This report isn’t available." description="It may have been removed, or the link is out of date." action={{ label: 'Back to bookings', to: '/bookings' }} />;

  const canWithdraw = dispute.raised_by === user.id && ['open', 'under_review'].includes(dispute.status);
  const raisedByYou = dispute.raised_by === user.id;
  const otherParty = user.role === 'business'
    ? `Artisan: ${dispute.artisan_name || '—'}`
    : `Business: ${dispute.business_name || '—'}`;

  return (
    <div className="dash-page dispute-page">
      <Link to={`/bookings/${dispute.booking_public_id || dispute.booking_id}`} className="dispute-back">
        <ArrowLeft size={15} aria-hidden="true" /> Back to booking
      </Link>

      <header className="dispute-head">
        <div className="dispute-head-copy">
          <p className="market-kicker">Report #{dispute.id}</p>
          <h1>{dispute.request_title || `Booking ${dispute.booking_public_id || `#${dispute.booking_id}`}`}</h1>
          <p className="dash-head-sub">{otherParty}</p>
        </div>
        <div className="dispute-head-side">
          <DisputeIllustration className="dispute-illustration" />
          <StatusBadge status={dispute.status} />
        </div>
      </header>

      <div className="dispute-grid">
        <div className="dispute-main">
          <section className="dispute-card">
            <p className="market-kicker"><MessageSquare size={12} aria-hidden="true" /> The report</p>
            <p className="dispute-reason">{dispute.reason}</p>
            <div className="dispute-meta">
              <span><Flag size={13} aria-hidden="true" />{raisedByYou ? 'Raised by you' : 'Raised by the other party'}</span>
              <span><CalendarDays size={13} aria-hidden="true" />{new Date(dispute.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              {dispute.agreed_price && <span><Wallet size={13} aria-hidden="true" />GHS {dispute.agreed_price}</span>}
            </div>
          </section>

          {dispute.resolution_notes && (
            <section className="dispute-card dispute-resolution">
              <p className="market-kicker">Resolution from customer service</p>
              <p>{dispute.resolution_notes}</p>
            </section>
          )}

          {dispute.status === 'withdrawn' && (
            <p className="booking-policy-inline">This report was withdrawn — no further action is needed.</p>
          )}
        </div>

        <aside className="dispute-side">
          <div className="dispute-card dispute-booking-card">
            <p className="market-kicker">Linked booking</p>
            <p className="dispute-booking-title">{dispute.request_title || `Booking ${dispute.booking_public_id || `#${dispute.booking_id}`}`}</p>
            <p className="booking-policy-inline">Booking status: <StatusBadge status={dispute.booking_status} /></p>
            <Link to={`/bookings/${dispute.booking_public_id || dispute.booking_id}`} className="dispute-booking-link">
              View booking <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>

          {canWithdraw && (
            <div className="dispute-card dispute-withdraw-card">
              {confirming ? (
                <>
                  <p className="dispute-withdraw-title">Withdraw this report?</p>
                  <p className="booking-policy-inline">Customer service will stop reviewing it. You can raise a new dispute on the booking if needed.</p>
                  <div className="booking-actions">
                    <button type="button" className="btn btn-primary" disabled={withdraw.isPending} onClick={handleWithdraw}>
                      {withdraw.isPending ? 'Withdrawing…' : 'Yes, withdraw'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
                      Keep it
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="dispute-withdraw-title">Changed your mind?</p>
                  <p className="booking-policy-inline">If the issue is resolved between you and the other party, you can withdraw this report.</p>
                  <button type="button" className="btn btn-ghost btn-danger-ghost" onClick={() => setConfirming(true)}>
                    Withdraw report
                  </button>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
