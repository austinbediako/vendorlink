import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  useServiceRequest,
  useServiceRequestApplications,
  useApplyToRequestMutation,
  useApproveApplicationMutation,
} from '../hooks/useServiceRequests';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { StarRating } from '../components/StarRating';
import { MapDisplay } from '../components/MapDisplay';
import { ToolsIllustration } from '../components/VisualAssets';
import { MapPin, CalendarDays, Wallet, ArrowLeft, ArrowUpRight, BadgeCheck, Lock } from 'lucide-react';

export function ServiceRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: request, isLoading: requestLoading, isError, error, refetch } = useServiceRequest(id);
  const { data: applications = [], isLoading: appsLoading, isError: appsError, error: applicationsError, refetch: refetchApplications } = useServiceRequestApplications(
    user.role === 'business' ? id : null
  );
  const apply = useApplyToRequestMutation();
  const approve = useApproveApplicationMutation();
  const [appMessage, setAppMessage] = useState('');

  const handleApply = async () => {
    try {
      await apply.mutateAsync({ id, message: appMessage });
      showToast('Application submitted successfully', 'success');
      setAppMessage('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to apply', 'error');
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      await approve.mutateAsync({ requestId: id, applicationId });
      showToast('Application approved and booking created', 'success');
      navigate('/bookings');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve application', 'error');
    }
  };

  if (requestLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load this request." onRetry={refetch} backTo="/service-requests" backLabel="Back to requests" />;
  if (!request) return <EmptyState kind="not-found" title="This request isn’t available." description="It may have been removed. Explore the current requests instead." action={{ label: 'Back to requests', to: '/service-requests' }} />;

  const isBusinessOwner = user.role === 'business' && request.business_id === user.id;
  const isArtisan = user.role === 'artisan';
  const canApply = isArtisan && request.status === 'open' && !request.has_applied;
  const exactLocation = Boolean(request.latitude && request.longitude);

  return (
    <div className="dash-page request-detail-page">
      <button type="button" onClick={() => navigate(-1)} className="admin-back request-back">
        <ArrowLeft size={14} /> Back
      </button>

      <article className="request-detail-card">
        <div className="request-card-head">
          <div className="request-card-titles">
            <p className="market-kicker">{request.category_name || 'Service request'}</p>
            <h1 className="request-detail-title">{request.title}</h1>
            <p className="request-card-by">
              {isArtisan ? `Posted by ${request.business_name || 'a business'}` : 'Posted by you'}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <p className="request-detail-desc">{request.description}</p>

        <div className="request-card-meta request-detail-meta">
          <span>
            <MapPin size={14} aria-hidden="true" />
            {request.location || 'No location'}
            {!exactLocation && isArtisan && <em>approximate area</em>}
          </span>
          <span><CalendarDays size={14} aria-hidden="true" />{request.preferred_timeframe ? new Date(request.preferred_timeframe).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date set'}</span>
          {request.budget && <span className="request-card-budget"><Wallet size={14} aria-hidden="true" />GHS {request.budget}</span>}
        </div>

        {exactLocation ? (
          <MapDisplay
            latitude={request.latitude}
            longitude={request.longitude}
            locationName="Exact location"
          />
        ) : isArtisan && (
          <p className="request-detail-privacy"><Lock size={13} aria-hidden="true" /> Exact location is revealed after the business approves your application.</p>
        )}

        {canApply && (
          <div className="apply-panel">
            <ToolsIllustration className="apply-panel-illus" />
            <div className="apply-panel-body">
              <h2>Interested in this job?</h2>
              <p>Send a short message with your application — your rates, timing, or a quick question. Only the general area is shown until you’re approved.</p>
              <textarea
                rows={2}
                placeholder="Optional message to the business…"
                className="admin-dispute-notes"
                value={appMessage}
                onChange={(e) => setAppMessage(e.target.value)}
              />
              <button
                type="button"
                onClick={handleApply}
                disabled={apply.isPending}
                className="btn btn-primary"
              >
                {apply.isPending ? 'Applying…' : 'Apply for this job'}
              </button>
            </div>
          </div>
        )}

        {isArtisan && request.has_applied && (
          <div className="apply-panel apply-panel--applied">
            <BadgeCheck size={20} aria-hidden="true" />
            <p>You’ve applied to this request. The business will review your application — the exact location unlocks if you’re approved.</p>
          </div>
        )}
      </article>

      {isBusinessOwner && (
        <section className="request-detail-card">
          <h2 className="request-detail-h2">Applicants</h2>

          {appsLoading ? (
            <LoadingSpinner />
          ) : appsError ? (
            <DataErrorState compact error={applicationsError} title="Applications couldn’t be loaded." onRetry={refetchApplications} />
          ) : applications.length === 0 ? (
            <EmptyState compact kind="applications" title="Your next collaborator hasn’t applied yet." description="Applications will appear here when artisans respond. You can also browse providers and book directly." action={{ label: 'Book an artisan', to: '/bookings/new' }} />
          ) : (
            <div className="applicant-list">
              {applications.map((app) => (
                <div key={app.id} className="applicant-card">
                  <div className="applicant-head">
                    <div>
                      <h3 className="applicant-name">
                        {app.artisan_public_id ? (
                          <Link to={`/artisans/${app.artisan_public_id}`} className="applicant-link">{app.full_name}<ArrowUpRight size={14} aria-hidden="true" /></Link>
                        ) : app.full_name}
                      </h3>
                      <p className="applicant-meta">
                        {app.years_of_experience} yrs experience · {app.artisan_location}
                        {app.review_count > 0 && <> · {app.review_count} {app.review_count === 1 ? 'review' : 'reviews'}</>}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <StarRating rating={parseFloat(app.average_rating) || 0} />
                  {app.message && <p className="applicant-message">“{app.message}”</p>}
                  {app.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(app.id)}
                      disabled={approve.isPending}
                      className="btn btn-primary applicant-approve"
                    >
                      <BadgeCheck size={15} /> Approve &amp; create booking
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
