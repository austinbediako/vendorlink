import { useAuth } from '../context/AuthContext';
import { useProfileCompleteness } from '../hooks/useProfile';
import { LoadingSpinner } from './LoadingSpinner';
import { ProfileRequiredPrompt } from './ProfileRequiredPrompt';
import { DataErrorState } from './EmptyState';

export function CompleteProfileGuard({ children }) {
  const { user } = useAuth();
  const { data: isComplete, isLoading, isError, error, refetch } = useProfileCompleteness(user?.role === 'artisan');

  if (user?.role !== 'artisan') return children;
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t check your profile." onRetry={refetch} />;
  if (!isComplete) return <ProfileRequiredPrompt />;
  return children;
}
