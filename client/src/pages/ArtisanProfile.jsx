import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useArtisan } from '../hooks/useArtisans';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { MapDisplay } from '../components/MapDisplay';
import { StarRating } from '../components/StarRating';
import { StatusBadge } from '../components/StatusBadge';
import { ProtectedImage } from '../components/ProtectedImage';
import { PrivateAvatar, LockedProfileIllustration } from '../components/VisualAssets';
import { MapPin, Phone, Briefcase, ArrowLeft, Star, Lock } from 'lucide-react';

export function ArtisanProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useArtisan(uid, user?.id);

  const artisan = data?.artisan;
  const reviews = data?.reviews || [];
  const canSeeExactLocation = data?.canSeeExactLocation || false;
  const locked = data?.locked ?? !user;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load this artisan." onRetry={refetch} backTo="/artisans" backLabel="Browse artisans" />;
  if (!artisan) return <EmptyState kind="not-found" title="This artisan profile isn’t available." description="The link may be out of date. Explore the directory to find another provider." action={{ label: 'Browse artisans', to: '/artisans' }} />;

  const categoryNames = artisan.category_names || [];
  const rating = parseFloat(artisan.average_rating) || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {locked ? (
        <div className="artisan-locked">
          <div className="artisan-locked-card">
            <div className="artisan-locked-photo">
              <PrivateAvatar size={140} />
              <span className="artisan-locked-badge">
                <Lock size={12} aria-hidden="true" /> Photo hidden
              </span>
            </div>
            <div className="artisan-locked-info">
              <div className="flex items-start justify-between gap-3">
                <h1 className="artisan-locked-name">{artisan.full_name}</h1>
                <StatusBadge status={artisan.verification_status} />
              </div>
              <p className="artisan-locked-id">{artisan.public_id}</p>
              <div className="flex items-center gap-4 my-3">
                <StarRating rating={rating} />
                <span className="text-sm text-gray-500">{artisan.review_count > 0 ? `${artisan.review_count} ${artisan.review_count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</span>
              </div>
              {categoryNames.length > 0 && (
                <div className="chip-row">
                  {categoryNames.map((name) => <span key={name} className="chip chip-static">{name}</span>)}
                </div>
              )}
              <p className="text-sm text-gray-600 mt-3 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {artisan.location || 'Service area shared after sign-in'}
              </p>
              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {artisan.years_of_experience} years experience
              </p>
            </div>
          </div>

          <div className="artisan-locked-cta">
            <LockedProfileIllustration className="artisan-locked-illus" />
            <h2>Sign in to see the full profile</h2>
            <p>
              Photos, bio, contact details, and reviews are only visible to VendorLink members.
              Signing in reveals them instantly.
            </p>
            <div className="artisan-locked-actions">
              <Link to={`/login?next=${encodeURIComponent(`/artisans/${uid}`)}`} className="btn btn-primary">
                Sign in to reveal
              </Link>
              <Link to={`/register?next=${encodeURIComponent(`/artisans/${uid}`)}`} className="btn btn-ghost">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="artisan-full-head">
              <div className="artisan-full-photo">
                {artisan.has_photo ? (
                  <ProtectedImage
                    src={`/artisans/${uid}/photo`}
                    alt={`${artisan.full_name} profile photo`}
                    fallback={<PrivateAvatar size={120} />}
                  />
                ) : (
                  <PrivateAvatar size={120} />
                )}
              </div>
              <div>
                <div className="flex justify-between items-start mb-1 gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">{artisan.full_name}</h1>
                  <StatusBadge status={artisan.verification_status} />
                </div>
                <p className="text-xs font-mono text-gray-400 mb-2">{artisan.public_id}</p>
                <p className="text-gray-600 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {artisan.location || 'No location'}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <StarRating rating={rating} />
                  <span className="text-sm text-gray-500">{artisan.review_count > 0 ? `${artisan.review_count} ${artisan.review_count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</span>
                </div>
                {categoryNames.length > 0 && (
                  <div className="chip-row mt-3">
                    {categoryNames.map((name) => <span key={name} className="chip chip-static">{name}</span>)}
                  </div>
                )}
              </div>
            </div>

            <p className="text-gray-700 my-6">{artisan.bio || 'No bio available.'}</p>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {artisan.phone || 'No phone'}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {artisan.years_of_experience} years experience
              </div>
            </div>

            {canSeeExactLocation ? (
              <MapDisplay
                latitude={artisan.latitude}
                longitude={artisan.longitude}
                locationName={artisan.location}
              />
            ) : (
              <p className="text-sm text-gray-500 mb-6">
                Exact location is hidden until a booking is accepted.
              </p>
            )}

            {user?.role === 'business' && (
              <div className="mt-6">
                <Link to={`/bookings/new?artisan=${uid}`} className="btn btn-primary">
                  Book {artisan.full_name?.split(' ')[0] || 'this artisan'}
                </Link>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" /> Reviews
            </h2>
            {reviews.length === 0 ? (
              <EmptyState compact kind="reviews" title="A reputation starts with the first review." description="Feedback from completed jobs will appear here. No reviews have been posted for this artisan yet." />
            ) : (
              <div className="space-y-4">
                {reviews.map((review, i) => (
                  <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{review.business_name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-gray-700 mt-2">{review.review}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
