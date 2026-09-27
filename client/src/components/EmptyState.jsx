import { useId } from 'react';
import { Link } from 'react-router-dom';
import { StateIllustration } from './VisualAssets';
import { LoadingSpinner } from './LoadingSpinner';

export function EmptyState({ kind = 'requests', title, description, action, secondaryAction, compact = false }) {
  const titleId = useId();
  return (
    <section className={`data-state ${compact ? 'data-state--compact' : ''}`} aria-labelledby={titleId}>
      <StateIllustration kind={kind} className="data-state-illustration" />
      <div className="data-state-copy">
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
        {(action || secondaryAction) && (
          <div className="data-state-actions">
            {[action, secondaryAction].map((item, index) => item && (
              item.to ? (
                <Link key={index} to={item.to} className={`market-button ${index ? 'market-button--secondary' : ''}`}>
                  {item.label}
                </Link>
              ) : (
                <button key={index} type="button" onClick={item.onClick} disabled={item.disabled} className={`market-button ${index ? 'market-button--secondary' : ''}`}>
                  {item.label}
                </button>
              )
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function CategoriesState({ query }) {
  if (query.isLoading) return <LoadingSpinner />;
  if (query.isError) return <DataErrorState compact error={query.error} title="Service categories couldn’t be loaded." onRetry={query.refetch} />;
  if (!query.data?.length) return <EmptyState compact kind="categories" title="No service categories available yet." description="Categories need to be set up before you can choose your services. Check again shortly." action={{ label: 'Refresh categories', onClick: () => query.refetch() }} />;
  return null;
}

export function DataErrorState({ error, onRetry, title = 'We couldn’t load this page.', compact = false, backTo = '/', backLabel = 'Back to home' }) {
  const status = error?.response?.status;
  if (status === 404) {
    return <EmptyState kind="not-found" title="This item isn’t available." description="It may have been removed, or the link may be out of date." action={{ label: backLabel, to: backTo }} compact={compact} />;
  }
  if (status === 401 || status === 403) {
    return <EmptyState kind="profile" title={status === 401 ? 'Sign in to continue.' : 'This page isn’t available to your account.'} description="Use an account with access, or return to the homepage." action={{ label: status === 401 ? 'Sign in' : 'Back to home', to: status === 401 ? '/login' : '/' }} compact={compact} />;
  }
  return <EmptyState kind="error" title={title} description="Your data hasn’t disappeared. Check your connection and try again." action={onRetry && { label: 'Try again', onClick: () => onRetry() }} compact={compact} />;
}
