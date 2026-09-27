import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServiceRequests, useMyApplications } from '../hooks/useServiceRequests';
import { showToast } from '../lib/toast';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, MapPin, CalendarDays, Wallet, ArrowUpRight, Send } from 'lucide-react';

function MyApplications({ enabled }) {
  const { data: applications = [], isLoading, isError, error, refetch } = useMyApplications(enabled);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load your applications." onRetry={refetch} />;
  if (!applications.length) {
    return (
      <EmptyState
        compact
        kind="requests"
        title="No applications sent yet."
        description="When you apply to a request, it will show up here so you can track its status."
      />
    );
  }

  return (
    <div className="request-list">
      {applications.map((app) => (
        <article key={app.id} className="request-card">
          <Link to={`/service-requests/${app.request_id}`} className="request-card-link">
            <div className="request-card-head">
              <div className="request-card-titles">
                <p className="market-kicker">{app.category_name || 'Service request'}</p>
                <h3>{app.title}</h3>
                <p className="request-card-by">
                  Posted by {app.business_name || 'a business'} · applied {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>
            <div className="request-card-meta">
              <span><MapPin size={14} aria-hidden="true" />{app.location || 'No location'}{app.status !== 'approved' && <em>approx.</em>}</span>
              {app.budget && <span className="request-card-budget"><Wallet size={14} aria-hidden="true" />GHS {app.budget}</span>}
              {app.request_status === 'closed' && app.status !== 'approved' && <em className="application-closed-note">Request closed</em>}
              <ArrowUpRight size={16} className="request-card-arrow" aria-hidden="true" />
            </div>
          </Link>
          {app.status === 'approved' && (
            <div className="request-card-actions">
              {app.booking_id ? (
                <Link to={`/bookings/${app.booking_id}`} className="request-card-apply">View booking</Link>
              ) : (
                <Link to="/bookings" className="request-card-apply">Go to my jobs</Link>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

export function ServiceRequests() {
  const { user } = useAuth();
  const { data: requests = [], isLoading, isError, error, refetch } = useServiceRequests();
  const isBusiness = user.role === 'business';
  const isArtisan = user.role === 'artisan';
  const [tab, setTab] = useState('available');

  const handleCloseRequest = async (e, id) => {
    e.stopPropagation();
    try {
      await api.put(`/service-requests/${id}`, { status: 'closed' });
      showToast('Request closed', 'success');
      refetch();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to close request', 'error');
    }
  };

  return (
    <div className="dash-page">
      <header className="dash-head bookings-head">
        <div>
          <p className="market-kicker">{isBusiness ? 'Your requests' : 'Open work'}</p>
          <h1>{isBusiness ? 'Service requests' : 'Available requests'}</h1>
          <p className="dash-head-sub">
            {isBusiness
              ? 'Post work, review applications, and follow each request to a booking.'
              : 'Work posted by businesses that matches your skills, plus the applications you’ve sent.'}
          </p>
        </div>
        {isBusiness && (
          <Link to="/service-requests/new" className="btn btn-primary">
            <Plus size={15} /> New request
          </Link>
        )}
      </header>

      {isArtisan && (
        <div className="applications-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'available'}
            className={`applications-tab${tab === 'available' ? ' active' : ''}`}
            onClick={() => setTab('available')}
          >
            Available
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'applications'}
            className={`applications-tab${tab === 'applications' ? ' active' : ''}`}
            onClick={() => setTab('applications')}
          >
            <Send size={13} aria-hidden="true" /> My applications
          </button>
        </div>
      )}

      {isArtisan && tab === 'applications' ? (
        <MyApplications enabled={isArtisan} />
      ) : isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <DataErrorState error={error} title="We couldn’t load service requests." onRetry={refetch} />
      ) : requests.length === 0 ? (
        <EmptyState kind="requests" title={isBusiness ? 'Put your next project into motion.' : 'No matching requests right now.'} description={isBusiness ? 'Describe the work you need done. Artisan applications and project details will start here.' : 'New opportunities will appear when businesses post work in your service categories.'} action={isBusiness ? { label: 'Post a service request', to: '/service-requests/new' } : { label: 'Refresh requests', onClick: () => refetch() }} secondaryAction={user.role === 'artisan' ? { label: 'Review my skills', to: '/profile/edit' } : undefined} />
      ) : (
        <div className="request-list">
          {requests.map((request) => (
            <article key={request.id} className="request-card">
              <Link to={`/service-requests/${request.id}`} className="request-card-link">
                <div className="request-card-head">
                  <div className="request-card-titles">
                    <p className="market-kicker">{request.category_name || 'Service request'}</p>
                    <h3>{request.title}</h3>
                    <p className="request-card-by">
                      {isBusiness ? 'Posted by you' : `Posted by ${request.business_name || 'a business'}`}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <p className="request-card-desc">{request.description}</p>
                <div className="request-card-meta">
                  <span><MapPin size={14} aria-hidden="true" />{request.location || 'No location'}{!isBusiness && <em>approx.</em>}</span>
                  <span><CalendarDays size={14} aria-hidden="true" />{request.preferred_timeframe ? new Date(request.preferred_timeframe).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No timeframe'}</span>
                  {request.budget && <span className="request-card-budget"><Wallet size={14} aria-hidden="true" />GHS {request.budget}</span>}
                  <ArrowUpRight size={16} className="request-card-arrow" aria-hidden="true" />
                </div>
              </Link>
              {(isBusiness && request.status === 'open') || (!isBusiness && request.status === 'open' && !request.has_applied) ? (
                <div className="request-card-actions">
                  {isBusiness ? (
                    <button type="button" onClick={(e) => handleCloseRequest(e, request.id)} className="request-card-close">
                      Close request
                    </button>
                  ) : (
                    <Link to={`/service-requests/${request.id}`} className="request-card-apply">
                      View &amp; apply
                    </Link>
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
