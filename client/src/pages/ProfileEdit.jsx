import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile, useServiceCategories, useUpdateProfileMutation, useUploadPhotoMutation } from '../hooks';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { LocationPicker } from '../components/LocationPicker';
import { ArtisanProfileForm } from '../components/ArtisanProfileForm';
import { ArtisanIdCard } from '../components/ArtisanIdCard';
import { ProfileSetupIllustration } from '../components/VisualAssets';
import { Pencil, Phone, Mail, ExternalLink } from 'lucide-react';

export function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading, isError, error, refetch } = useProfile();
  const { data: categories = [] } = useServiceCategories();
  const updateProfile = useUpdateProfileMutation();
  const uploadPhoto = useUploadPhotoMutation();
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    phone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({ ...prev, ...profile }));
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (lat, lng, locationName) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      ...(locationName ? { location: locationName } : {}),
    }));
  };

  const handleArtisanSubmit = async (payload, photoBlob) => {
    try {
      if (photoBlob) await uploadPhoto.mutateAsync(photoBlob);
      await updateProfile.mutateAsync(payload);
      showToast('Profile saved successfully', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      showToast('Profile saved successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save profile', 'error');
    }
  };

  if (profileLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load your profile." onRetry={refetch} />;

  const isBusiness = user.role === 'business';

  if (!isBusiness) {
    const categoryNames = categories
      .filter((c) => (profile?.categories || []).includes(c.id))
      .map((c) => c.name);

    if (!editing) {
      return (
        <div className="profile-setup">
          <header className="profile-setup-head">
            <div>
              <p className="market-kicker">Your profile</p>
              <h1>Your artisan card</h1>
              <p className="profile-setup-lead">
                This is your VendorLink identity. Businesses see this card when they open your profile.
              </p>
            </div>
            <ProfileSetupIllustration className="profile-setup-illustration" />
          </header>

          <div className="profile-card-view">
            <ArtisanIdCard
              data={profile || {}}
              categoryNames={categoryNames}
              publicId={profile?.public_id}
            />
            <div className="profile-card-meta">
              {profile?.phone && (
                <p className="profile-card-row"><Phone size={14} aria-hidden="true" /> {profile.phone}</p>
              )}
              {user?.email && (
                <p className="profile-card-row"><Mail size={14} aria-hidden="true" /> {user.email}</p>
              )}
              <p className="profile-card-note">Phone is only visible to signed-in members.</p>
            </div>
            <div className="profile-card-actions">
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                <Pencil size={15} aria-hidden="true" /> Edit profile
              </button>
              {profile?.public_id && (
                <Link to={`/artisans/${profile.public_id}`} className="btn btn-ghost">
                  <ExternalLink size={15} aria-hidden="true" /> View public page
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-setup">
        <header className="profile-setup-head">
          <div>
            <p className="market-kicker">Your profile</p>
            <h1>Edit your artisan profile</h1>
            <p className="profile-setup-lead">
              Keep your photo, services, and service area up to date. The ID card previews
              exactly what businesses see.
            </p>
          </div>
          <ProfileSetupIllustration className="profile-setup-illustration" />
        </header>

        <ArtisanProfileForm
          initial={profile || {}}
          onSubmit={handleArtisanSubmit}
          submitting={updateProfile.isPending || uploadPhoto.isPending}
          submitLabel="Save changes"
        />
        <button type="button" className="btn btn-ghost profile-edit-cancel" onClick={() => setEditing(false)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
        {!profile && <EmptyState compact kind="profile" title="Let’s put a name to your work." description="Your profile is a blank slate. Add your details using the form below to get started." />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Location on Map</label>
            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={handleLocationChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
