import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArtisanFilters } from './ArtisanSearch';
import { useArtisans, useArtisan } from '../hooks/useArtisans';
import { useServiceCategories, useServiceRequests } from '../hooks/useServiceRequests';
import { useCreateBookingMutation } from '../hooks/useBookings';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ProtectedImage } from '../components/ProtectedImage';
import { BrandMark } from '../components/VisualAssets';
import { ArrowLeft, ArrowUpRight, Check, MapPin, ShieldCheck, Star } from 'lucide-react';

function SelectableCard({ artisan, selected, onSelect }) {
  const name = artisan.full_name?.trim() || 'Artisan';
  const rating = Number(artisan.average_rating) || 0;
  const reviews = Number(artisan.review_count) || 0;
  const experience = Number(artisan.years_of_experience) || 0;
  const verified = artisan.verification_status === 'verified';
  return (
    <button
      type="button"
      className={`artisan-card booking-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(artisan)}
      aria-pressed={selected}
    >
      <div className="artisan-card-top">
        <span className="artisan-mark" aria-hidden="true">
          {artisan.has_photo ? (
            <ProtectedImage src={`/artisans/${artisan.public_id}/photo`} alt="" className="artisan-mark-img" fallback={<BrandMark size={24} />} />
          ) : (
            <BrandMark size={24} />
          )}
        </span>
        <span className={`artisan-verification ${verified ? 'is-verified' : ''}`}>
          {verified && <ShieldCheck size={14} aria-hidden="true" />}{verified ? 'Verified' : 'Not verified'}
        </span>
      </div>
      <p className="market-kicker">Service provider</p>
      <h3>{name}</h3>
      <p className="artisan-location"><MapPin size={15} aria-hidden="true" />{artisan.location || 'Location not provided'}</p>
      <p className="artisan-bio">{artisan.bio?.trim() || 'Visit this provider’s profile to learn more about their services.'}</p>
      <div className="artisan-card-facts">
        <span><Star size={15} aria-hidden="true" /><strong>{rating.toFixed(1)}</strong><span>{reviews ? `(${reviews} ${reviews === 1 ? 'review' : 'reviews'})` : 'New artisan'}</span></span>
        <span>{experience > 0 ? `${experience} ${experience === 1 ? 'year' : 'years'} experience` : 'Experience not listed'}</span>
      </div>
      <span className={`booking-card-cta ${selected ? 'is-selected' : ''}`} aria-hidden="true">
        {selected ? <><Check size={16} /> Selected</> : <>Select artisan<ArrowUpRight size={16} /></>}
      </span>
    </button>
  );
}

export function BookArtisan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const presetUid = searchParams.get('artisan') || '';

  const [selectedId, setSelectedId] = useState(null);
  const [bookingForm, setBookingForm] = useState({ agreed_price: '', scheduled_date: '', request_id: '' });
  const [sort, setSort] = useState('rating');

  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const rawRating = searchParams.get('minRating') || '';
  const filters = { category, location, minRating: ['1', '2', '3', '4', '5'].includes(rawRating) ? rawRating : '' };

  const { data: artisans = [], isLoading, isFetching, isError, error, refetch } = useArtisans(filters);
  const { data: presetData } = useArtisan(presetUid);
  const categoriesQuery = useServiceCategories();
  const { data: myRequests = [] } = useServiceRequests();
  const createBooking = useCreateBookingMutation();

  const openRequests = useMemo(
    () => myRequests.filter((r) => r.status === 'open'),
    [myRequests]
  );

  const sortedArtisans = [...artisans].sort((a, b) => sort === 'name'
    ? (a.full_name || '').localeCompare(b.full_name || '')
    : sort === 'experience'
      ? Number(b.years_of_experience || 0) - Number(a.years_of_experience || 0)
      : Number(b.average_rating || 0) - Number(a.average_rating || 0) || Number(b.review_count || 0) - Number(a.review_count || 0));

  const applyFilters = (next) => setSearchParams(
    Object.fromEntries(Object.entries({ ...next, artisan: presetUid }).filter(([, v]) => v)),
    { replace: true }
  );

  const presetArtisan = presetData?.artisan;
  const selected =
    artisans.find((a) => a.id === selectedId) ||
    (presetArtisan && !presetArtisan.locked ? presetArtisan : null) ||
    null;

  const selectArtisan = (artisan) => {
    setSelectedId(artisan.id);
    if (presetUid) {
      const next = new URLSearchParams(searchParams);
      next.delete('artisan');
      setSearchParams(next, { replace: true });
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const res = await createBooking.mutateAsync({
        artisan_id: selected.id,
        agreed_price: bookingForm.agreed_price,
        scheduled_date: bookingForm.scheduled_date,
        request_id: bookingForm.request_id ? Number(bookingForm.request_id) : undefined,
      });
      showToast('Booking request sent', 'success');
      navigate(`/bookings/${res.data.data.booking.public_id || res.data.data.booking.id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create booking', 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load the artisan directory." onRetry={refetch} />;

  return (
    <div className="market-page">
      <header className="artisan-directory-heading">
        <div>
          <Link to="/bookings" className="admin-back"><ArrowLeft size={14} /> My bookings</Link>
          <p className="market-kicker">New booking</p>
          <h1>Book an artisan</h1>
          <p>Pick someone from the directory, then set the price and schedule. They’ll confirm the booking from their side.</p>
        </div>
      </header>

      <div className="booking-flow">
        <div className="booking-pick">
          <p className="booking-step"><span className="booking-step-num">1</span> Choose an artisan</p>
          <ArtisanFilters
            key={JSON.stringify(filters)}
            filters={filters}
            categories={categoriesQuery.data || []}
            categoriesLoading={categoriesQuery.isLoading}
            onApply={applyFilters}
            buttonLabel="Filter directory"
          />
          <div className="artisan-results-toolbar">
            <p role="status"><strong>{artisans.length}</strong> {artisans.length === 1 ? 'artisan' : 'artisans'} available{isFetching ? ' · Updating…' : ''}</p>
            <div className="artisan-sort">
              <label htmlFor="booking-sort">Sort by</label>
              <select id="booking-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="rating">Highest rated</option>
                <option value="experience">Most experienced</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>
          <div aria-busy={isFetching}>
            {!artisans.length ? (
              <EmptyState kind="search" title="No artisans match." description="Try another area or a broader service category." action={{ label: 'Clear filters', onClick: () => applyFilters({}) }} />
            ) : (
              <div className="artisan-grid artisan-grid--booking">
                {sortedArtisans.map((artisan) => (
                  <SelectableCard
                    key={artisan.id}
                    artisan={artisan}
                    selected={selected?.id === artisan.id}
                    onSelect={selectArtisan}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="booking-panel-wrap">
          <p className="booking-step"><span className="booking-step-num">2</span> Booking details</p>
          {selected ? (
            <form className="booking-panel" onSubmit={handleBook}>
              <div className="booking-panel-head">
                <span className="artisan-mark" aria-hidden="true">
                  {selected.has_photo ? (
                    <ProtectedImage src={`/artisans/${selected.public_id}/photo`} alt="" className="artisan-mark-img" fallback={<BrandMark size={24} />} />
                  ) : (
                    <BrandMark size={24} />
                  )}
                </span>
                <div>
                  <p className="booking-panel-name">{selected.full_name}</p>
                  <p className="admin-roster-meta">{selected.public_id}</p>
                </div>
                <StatusBadge status={selected.verification_status} />
              </div>

              <div className="market-field">
                <label htmlFor="booking-price">Agreed price (GHS)</label>
                <input
                  id="booking-price"
                  type="text"
                  required
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  value={bookingForm.agreed_price}
                  onChange={(e) => setBookingForm({ ...bookingForm, agreed_price: e.target.value })}
                />
              </div>
              <div className="market-field">
                <label htmlFor="booking-date">Scheduled date &amp; time</label>
                <input
                  id="booking-date"
                  type="datetime-local"
                  required
                  value={bookingForm.scheduled_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, scheduled_date: e.target.value })}
                />
              </div>
              {openRequests.length > 0 && (
                <div className="market-field">
                  <label htmlFor="booking-request">Attach to an open request (optional)</label>
                  <select
                    id="booking-request"
                    value={bookingForm.request_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, request_id: e.target.value })}
                  >
                    <option value="">Direct booking — no request</option>
                    {openRequests.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                  <span className="field-hint">Linking a request marks it closed once booked.</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-block" disabled={createBooking.isPending}>
                {createBooking.isPending ? 'Sending…' : `Send booking request to ${selected.full_name?.split(' ')[0] || 'artisan'}`}
              </button>
              <Link to={`/artisans/${selected.public_id}`} className="booking-panel-view">View full profile first</Link>
            </form>
          ) : (
            <div className="booking-panel booking-panel--empty">
              <BrandMark size={32} />
              <p>Select an artisan from the directory to set a price and schedule.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
