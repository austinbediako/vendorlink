import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArtisans } from '../hooks/useArtisans';
import { useServiceCategories } from '../hooks/useServiceRequests';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StateIllustration, BrandMark } from '../components/VisualAssets';
import { ProtectedImage } from '../components/ProtectedImage';
import { Search, MapPin, Star, ShieldCheck, ArrowUpRight, SlidersHorizontal, X } from 'lucide-react';

export function ArtisanFilters({ filters, categories, categoriesLoading, onApply, buttonLabel = 'Search artisans' }) {
  const [draft, setDraft] = useState(filters);
  const handleFilter = (e) => {
    e.preventDefault();
    // Filters are already reactive through TanStack Query, but we can trigger a refetch explicitly if needed.
    onApply({ ...draft, location: draft.location.trim() });
  };
  return (
    <form onSubmit={handleFilter} className="artisan-filters" aria-label="Filter artisans">
      <div className="artisan-filter-heading"><SlidersHorizontal size={18} aria-hidden="true" /><h2>Find the right fit</h2><span>Choose what matters to your project.</span></div>
      <div className="artisan-filter-fields">
        <div className="market-field">
          <label htmlFor="artisan-category">Service category</label>
          <select id="artisan-category" value={draft.category} disabled={categoriesLoading} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
            <option value="">{categoriesLoading ? 'Loading categories…' : 'All services'}</option>
            {draft.category && !categories.some((cat) => String(cat.id) === draft.category) && <option value={draft.category}>Selected category</option>}
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="market-field">
          <label htmlFor="artisan-location">Location</label>
          <input id="artisan-location" type="search" placeholder="City or area, e.g. Accra" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} />
        </div>
        <div className="market-field">
          <label htmlFor="artisan-rating">Minimum rating</label>
          <select id="artisan-rating" value={draft.minRating} onChange={(e) => setDraft({ ...draft, minRating: e.target.value })}>
            <option value="">Any rating</option>
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating === 5 ? '5 stars' : `${rating}+ stars`}</option>)}
          </select>
        </div>
        <button type="submit" className="market-button"><Search size={17} aria-hidden="true" />{buttonLabel}</button>
      </div>
    </form>
  );
}

function ArtisanCard({ artisan, signedIn }) {
  const name = artisan.full_name?.trim() || 'Artisan';
  const rating = Number(artisan.average_rating) || 0;
  const reviews = Number(artisan.review_count) || 0;
  const experience = Number(artisan.years_of_experience) || 0;
  const verified = artisan.verification_status === 'verified';
  const profileUrl = `/artisans/${artisan.public_id}`;
  const showPhoto = signedIn && artisan.has_photo;
  return (
    <Link to={profileUrl} className="artisan-card" aria-label={`View ${name}’s profile`}>
      <div className="artisan-card-top">
        <span className="artisan-mark" aria-hidden="true">
          {showPhoto ? (
            <ProtectedImage
              src={`/artisans/${artisan.public_id}/photo`}
              alt=""
              className="artisan-mark-img"
              fallback={<BrandMark size={24} />}
            />
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
      <span className="artisan-profile-link" aria-hidden="true">View profile<ArrowUpRight size={18} /></span>
    </Link>
  );
}

export function ArtisanSearch() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('rating');
  const category = searchParams.get('category') || '';
  const location = searchParams.get('location') || '';
  const rawRating = searchParams.get('minRating') || '';
  const filters = { category, location, minRating: ['1', '2', '3', '4', '5'].includes(rawRating) ? rawRating : '' };
  const { data: artisans = [], isLoading, isFetching, isError, error, refetch } = useArtisans(filters);
  const categoriesQuery = useServiceCategories();
  const categories = categoriesQuery.data || [];
  const applyFilters = (next) => setSearchParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)));
  const activeFilters = Object.entries(filters).filter(([, value]) => value);
  const sortedArtisans = [...artisans].sort((a, b) => sort === 'name'
    ? (a.full_name || '').localeCompare(b.full_name || '')
    : sort === 'experience'
      ? Number(b.years_of_experience || 0) - Number(a.years_of_experience || 0)
      : Number(b.average_rating || 0) - Number(a.average_rating || 0) || Number(b.review_count || 0) - Number(a.review_count || 0));

  return (
    <div className="market-page">
      <header className="artisan-directory-heading">
        <div>
          <p className="market-kicker">The artisan directory</p>
          <h1>Good work starts with<br /><span>the right person.</span></h1>
          <p>Discover artisans across Ghana. Compare experience, read reviews, and find the right skills for your next project.</p>
        </div>
        <StateIllustration kind="applications" className="artisan-directory-illustration" />
      </header>

      <ArtisanFilters key={JSON.stringify(filters)} filters={filters} categories={categories} categoriesLoading={categoriesQuery.isLoading} onApply={applyFilters} />
      {categoriesQuery.isError ? <DataErrorState compact error={categoriesQuery.error} title="Service categories couldn’t be loaded." onRetry={categoriesQuery.refetch} /> : !categoriesQuery.isLoading && !categories.length && (
        <EmptyState compact kind="categories" title="Service categories are being set up." description="You can still search by location or rating. Check back for category filters." />
      )}
      {activeFilters.length > 0 && (
        <div className="artisan-filter-chips" aria-label="Applied filters">
          {activeFilters.map(([key, value]) => {
            const label = key === 'category' ? categories.find((cat) => String(cat.id) === value)?.name || 'Selected category' : key === 'minRating' ? `${value}+ stars` : value;
            return <button key={key} type="button" onClick={() => applyFilters({ ...filters, [key]: '' })} aria-label={`Remove ${label} filter`}>{label}<X size={14} aria-hidden="true" /></button>;
          })}
          <button type="button" className="artisan-clear-filters" onClick={() => applyFilters({})}>Clear all</button>
        </div>
      )}

      <div className="artisan-results-toolbar">
        <p role="status">{isLoading ? 'Finding artisans…' : isError ? 'Results unavailable' : <><strong>{artisans.length}</strong> {artisans.length === 1 ? 'artisan' : 'artisans'}{activeFilters.length ? ' matching your search' : ' to explore'}{isFetching ? ' · Updating…' : ''}</>}</p>
        <div className="artisan-sort"><label htmlFor="artisan-sort">Sort by</label><select id="artisan-sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="rating">Highest rated</option><option value="experience">Most experienced</option><option value="name">Name A–Z</option></select></div>
      </div>
      <div aria-busy={isFetching}>
        {isLoading ? (
          <div className="artisan-grid" aria-hidden="true">{[0, 1, 2].map((i) => <div className="artisan-card artisan-skeleton" key={i}><span /><span /><span /><span /></div>)}</div>
        ) : isError ? (
          <DataErrorState error={error} title="We couldn’t load the artisan directory." onRetry={refetch} />
        ) : !artisans.length ? (
          <EmptyState kind="search" title={activeFilters.length ? 'No matches just yet.' : 'The directory is getting started.'} description={activeFilters.length ? 'Try another area, a broader service category, or a lower minimum rating.' : 'Artisan profiles will appear here as providers join. Come back soon to find your next collaborator.'} action={activeFilters.length ? { label: 'Clear filters', onClick: () => applyFilters({}) } : { label: 'Refresh directory', onClick: () => refetch() }} />
        ) : <div className="artisan-grid">{sortedArtisans.map((artisan) => <ArtisanCard key={artisan.id} artisan={artisan} signedIn={!!user} />)}</div>}
      </div>
    </div>
  );
}
