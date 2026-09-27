import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminDisputes, useResolveDisputeMutation } from '../hooks/useAdmin';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export function AdminDisputes() {
  const { data: disputes = [], isLoading, isError, error, refetch } = useAdminDisputes();
  const resolve = useResolveDisputeMutation();
  const [resolutions, setResolutions] = useState({});

  const handleResolve = async (id, status) => {
    try {
      await resolve.mutateAsync({ id, status, resolution_notes: resolutions[id] || '' });
      showToast(`Dispute ${status}`, 'success');
      setResolutions((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve dispute', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load disputes." onRetry={refetch} />;

  return (
    <div className="dash-page">
      <Link to="/admin" className="admin-back">
        <ArrowLeft size={14} /> Admin console
      </Link>

      <header className="dash-head">
        <p className="market-kicker">Admin console</p>
        <h1>Dispute resolution</h1>
        <p className="dash-head-sub">Review disagreements between businesses and artisans, then record your decision.</p>
      </header>

      {disputes.length === 0 ? (
        <EmptyState kind="clear" title="Nothing to resolve right now." description="No disputes have been raised. If a booking needs your attention, it will appear here." action={{ label: 'Admin overview', to: '/admin' }} />
      ) : (
        <div className="admin-dispute-list">
          {disputes.map((dispute) => (
            <article key={dispute.id} className="admin-dispute-card">
              <div className="admin-dispute-head">
                <div>
                  <h3 className="admin-dispute-title">
                    <MessageSquare size={17} aria-hidden="true" />
                    Booking #{dispute.booking_id}
                  </h3>
                  <p className="admin-dispute-parties">
                    Business: {dispute.business_name || '—'} · Artisan: {dispute.artisan_name || '—'}
                  </p>
                </div>
                <StatusBadge status={dispute.status} />
              </div>

              <div className="admin-dispute-reason">
                <p>{dispute.reason}</p>
              </div>

              {dispute.status !== 'resolved' && dispute.status !== 'dismissed' && (
                <div className="admin-dispute-resolve">
                  <textarea
                    placeholder="Enter resolution notes…"
                    className="admin-dispute-notes"
                    rows={3}
                    value={resolutions[dispute.id] || ''}
                    onChange={(e) =>
                      setResolutions({ ...resolutions, [dispute.id]: e.target.value })
                    }
                  />
                  <div className="dash-actions">
                    <button
                      type="button"
                      onClick={() => handleResolve(dispute.id, 'resolved')}
                      disabled={resolve.isPending}
                      className="btn btn-primary"
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolve(dispute.id, 'dismissed')}
                      disabled={resolve.isPending}
                      className="btn btn-ghost"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {dispute.resolution_notes && (
                <div className="admin-dispute-resolution">
                  <span className="dash-stat-label">Resolution</span>
                  <p>{dispute.resolution_notes}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
