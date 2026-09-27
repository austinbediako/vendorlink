import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useServiceCategories, useCreateServiceRequestMutation } from '../hooks/useServiceRequests';
import { showToast } from '../lib/toast';
import { LocationPicker } from '../components/LocationPicker';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { PostRequestIllustration } from '../components/VisualAssets';
import { ArrowLeft, CalendarDays, Wallet } from 'lucide-react';

export function ServiceRequestForm() {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, isError, error, refetch } = useServiceCategories();
  const createRequest = useCreateServiceRequestMutation();
  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    preferred_timeframe: '',
    budget: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest.mutateAsync({
        ...formData,
        category_id: parseInt(formData.category_id, 10) || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      });
      showToast('Service request created', 'success');
      navigate('/service-requests');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create request', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load service categories." onRetry={refetch} />;
  if (!categories.length) return <EmptyState kind="categories" title="Requests need a service category." description="No categories are available yet. Please check again shortly before posting your request." action={{ label: 'Refresh categories', onClick: () => refetch() }} secondaryAction={{ label: 'Back to requests', to: '/service-requests' }} />;

  return (
    <div className="market-page request-form-page">
      <header className="artisan-directory-heading">
        <div>
          <Link to="/service-requests" className="admin-back"><ArrowLeft size={14} /> Service requests</Link>
          <p className="market-kicker">Post a request</p>
          <h1>Tell artisans what<br /><span>you need done.</span></h1>
          <p>Describe the work, where it is, and what you’re working with. Artisans will apply, and you pick who gets the job.</p>
        </div>
        <PostRequestIllustration className="artisan-directory-illustration request-form-illustration" />
      </header>

      <form onSubmit={handleSubmit} className="request-form">
        <section className="form-section">
          <h2 className="form-section-title">The work</h2>
          <div className="market-field">
            <label htmlFor="req-title">Request title</label>
            <input
              id="req-title"
              type="text"
              required
              placeholder="e.g. Rewire a two-bedroom apartment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="market-field">
            <label htmlFor="req-category">Service category</label>
            <select
              id="req-category"
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="market-field">
            <label htmlFor="req-description">Description</label>
            <textarea
              id="req-description"
              required
              rows={4}
              placeholder="What needs doing, the scope, materials on site, access notes…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <span className="field-hint">The more specific you are, the better the applications you’ll get.</span>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Where</h2>
          <div className="market-field location-field-wrap">
            <label htmlFor="req-location">Location</label>
            <input
              id="req-location"
              type="text"
              placeholder="e.g. Accra Central"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <span className="field-hint">Type an area or click the map below — artisans see the area, not your exact pin.</span>
          </div>
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={(lat, lng, locationName) =>
              setFormData({
                ...formData,
                latitude: lat,
                longitude: lng,
                ...(locationName ? { location: locationName } : {}),
              })
            }
          />
        </section>

        <section className="form-section">
          <h2 className="form-section-title">When &amp; budget</h2>
          <div className="request-form-row">
            <div className="market-field">
              <label htmlFor="req-date"><CalendarDays size={14} aria-hidden="true" /> Preferred date</label>
              <input
                id="req-date"
                type="date"
                required
                min={today}
                value={formData.preferred_timeframe}
                onChange={(e) => setFormData({ ...formData, preferred_timeframe: e.target.value })}
              />
            </div>
            <div className="market-field">
              <label htmlFor="req-budget"><Wallet size={14} aria-hidden="true" /> Budget</label>
              <div className="money-input">
                <span className="money-prefix">GHS</span>
                <input
                  id="req-budget"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 1,500 or negotiable"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="request-form-actions">
          <button type="submit" className="btn btn-primary" disabled={createRequest.isPending}>
            {createRequest.isPending ? 'Posting…' : 'Post request'}
          </button>
          <Link to="/service-requests" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
