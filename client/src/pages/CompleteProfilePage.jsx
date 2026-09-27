import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile, useUpdateProfileMutation, useUploadPhotoMutation } from '../hooks';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DataErrorState } from '../components/EmptyState';
import { ArtisanProfileForm } from '../components/ArtisanProfileForm';
import { ProfileSetupIllustration } from '../components/VisualAssets';

function safeNext(next) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const updateProfile = useUpdateProfileMutation();
  const uploadPhoto = useUploadPhotoMutation();

  const handleSubmit = async (payload, photoBlob) => {
    try {
      if (photoBlob) await uploadPhoto.mutateAsync(photoBlob);
      await updateProfile.mutateAsync(payload);
      showToast('Profile complete. Welcome!', 'success');
      navigate(safeNext(searchParams.get('next')));
    } catch (err) {
      const msg = err.response?.data?.message || err?.message || 'Failed to save profile';
      showToast(msg, 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load your profile setup." onRetry={refetch} />;

  const submitting = updateProfile.isPending || uploadPhoto.isPending;

  return (
    <div className="profile-setup">
      <header className="profile-setup-head">
        <div>
          <p className="market-kicker">Artisan onboarding</p>
          <h1>Set up your artisan profile</h1>
          <p className="profile-setup-lead">
            Add a photo, your services, and where you work. Your ID card on the right fills in
            as you type — that’s what businesses will see.
          </p>
        </div>
        <ProfileSetupIllustration className="profile-setup-illustration" />
      </header>

      <ArtisanProfileForm
        initial={profile || {}}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel="Finish setup"
      />
    </div>
  );
}
