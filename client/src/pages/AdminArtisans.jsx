import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAdminArtisans, useVerifyArtisanMutation } from '../hooks/useAdmin';
import { showToast } from '../lib/toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { ArtisanIdCard } from '../components/ArtisanIdCard';
import { ProtectedImage } from '../components/ProtectedImage';
import { AdminConsoleIllustration, PrivateAvatar } from '../components/VisualAssets';
import { ArrowLeft, BadgeCheck, FileText, Mail, MapPin, Phone, RotateCcw, X } from 'lucide-react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
];

function RosterPhoto({ artisan }) {
  if (!artisan.has_photo) return <PrivateAvatar size={40} />;
  return (
    <ProtectedImage
      src={`/artisans/${artisan.public_id}/photo`}
      alt=""
      className="admin-roster-avatar-img"
      fallback={<PrivateAvatar size={40} />}
    />
  );
}

export function AdminArtisans() {
  const { data: artisans = [], isLoading, isError, error, refetch } = useAdminArtisans();
  const verify = useVerifyArtisanMutation();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = searchParams.get('status') || 'all';
  const selectedId = Number(searchParams.get('id')) || null;

  const counts = useMemo(() => {
    const c = { all: artisans.length, pending: 0, verified: 0, rejected: 0 };
    artisans.forEach((a) => { c[a.verification_status] = (c[a.verification_status] || 0) + 1; });
    return c;
  }, [artisans]);

  const visible = useMemo(
    () => (filter === 'all' ? artisans : artisans.filter((a) => a.verification_status === filter)),
    [artisans, filter]
  );

  const selected = useMemo(() => {
    const byId = artisans.find((a) => a.id === selectedId);
    if (byId) return byId;
    return visible.find((a) => a.verification_status === 'pending') || visible[0] || null;
  }, [artisans, visible, selectedId]);

  const setFilter = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'all') next.delete('status'); else next.set('status', key);
    next.delete('id');
    setSearchParams(next, { replace: true });
  };

  const selectArtisan = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('id', String(id));
    setSearchParams(next, { replace: true });
  };

  const updateStatus = async (id, status) => {
    try {
      await verify.mutateAsync({ id, status });
      showToast(`Artisan ${status}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${status} artisan`, 'error');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load artisan registrations." onRetry={refetch} />;

  return (
    <div className="dash-page dash-page--wide">
      <Link to="/admin" className="admin-back">
        <ArrowLeft size={14} /> Admin console
      </Link>

      <header className="dash-head">
        <p className="market-kicker">Verification queue</p>
        <h1>Review artisans</h1>
        <p className="dash-head-sub">Select an artisan to inspect their profile before approving or rejecting.</p>
      </header>

      {artisans.length === 0 ? (
        <EmptyState kind="profile" title="No artisan registrations yet." description="New artisan profiles will appear here for you to review and verify." action={{ label: 'Refresh registrations', onClick: () => refetch() }} secondaryAction={{ label: 'Admin overview', to: '/admin' }} />
      ) : (
        <>
          <div className="chip-row admin-filter-row" role="group" aria-label="Filter by verification status">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`chip ${filter === key ? 'chip-active' : ''}`}
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
              >
                {label} · {counts[key] || 0}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <EmptyState compact kind="clear" title={`No ${filter} artisans.`} description="Nothing matches this filter right now." action={{ label: 'Show all artisans', onClick: () => setFilter('all') }} />
          ) : (
            <div className="admin-review">
              <div className="admin-roster" role="listbox" aria-label="Artisans" aria-orientation="vertical">
                {visible.map((artisan) => (
                  <button
                    key={artisan.id}
                    type="button"
                    role="option"
                    aria-selected={selected?.id === artisan.id}
                    className={`admin-roster-row ${selected?.id === artisan.id ? 'is-active' : ''}`}
                    onClick={() => selectArtisan(artisan.id)}
                  >
                    <span className="admin-roster-avatar"><RosterPhoto artisan={artisan} /></span>
                    <span className="admin-roster-info">
                      <span className="admin-roster-name">{artisan.full_name || 'Unnamed artisan'}</span>
                      <span className="admin-roster-meta">{artisan.public_id || `ID ${artisan.id}`}</span>
                    </span>
                    <StatusBadge status={artisan.verification_status} />
                  </button>
                ))}
              </div>

              <div className="admin-detail">
                {selected ? (
                  <>
                    <ArtisanIdCard
                      data={selected}
                      photoSrc={selected.has_photo ? `/artisans/${selected.public_id}/photo` : null}
                      categoryNames={selected.category_names || []}
                      publicId={selected.public_id}
                    />

                    <dl className="admin-detail-meta">
                      <div><dt><Mail size={13} /> Email</dt><dd>{selected.email}</dd></div>
                      <div><dt><Phone size={13} /> Phone</dt><dd>{selected.phone || 'Not provided'}</dd></div>
                      <div><dt><MapPin size={13} /> Service area</dt><dd>{selected.location || 'Not provided'}</dd></div>
                      <div><dt><FileText size={13} /> ID document</dt><dd>
                        {selected.id_document_url
                          ? <a href={selected.id_document_url} target="_blank" rel="noreferrer">View document</a>
                          : 'Not provided'}
                      </dd></div>
                    </dl>

                    {selected.bio && (
                      <div className="admin-detail-block">
                        <span className="dash-stat-label">Bio</span>
                        <p className="admin-detail-bio">{selected.bio}</p>
                      </div>
                    )}

                    <p className="admin-detail-joined">
                      Registered {new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {selected.public_id && (
                        <> · <Link to={`/artisans/${selected.public_id}`} target="_blank">View public profile</Link></>
                      )}
                    </p>

                    <div className="admin-detail-actions">
                      {selected.verification_status === 'pending' && (
                        <>
                          <button type="button" className="btn btn-primary" disabled={verify.isPending} onClick={() => updateStatus(selected.id, 'verified')}>
                            <BadgeCheck size={15} /> Approve artisan
                          </button>
                          <button type="button" className="btn btn-ghost btn-danger-ghost" disabled={verify.isPending} onClick={() => updateStatus(selected.id, 'rejected')}>
                            <X size={15} /> Reject
                          </button>
                        </>
                      )}
                      {selected.verification_status === 'verified' && (
                        <>
                          <button type="button" className="btn btn-ghost btn-danger-ghost" disabled={verify.isPending} onClick={() => updateStatus(selected.id, 'rejected')}>
                            <X size={15} /> Revoke verification
                          </button>
                          <button type="button" className="btn btn-ghost" disabled={verify.isPending} onClick={() => updateStatus(selected.id, 'pending')}>
                            <RotateCcw size={15} /> Move to pending
                          </button>
                        </>
                      )}
                      {selected.verification_status === 'rejected' && (
                        <button type="button" className="btn btn-primary" disabled={verify.isPending} onClick={() => updateStatus(selected.id, 'verified')}>
                          <BadgeCheck size={15} /> Approve artisan
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="admin-detail-empty">
                    <AdminConsoleIllustration />
                    <p>Select an artisan from the roster to review their profile.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
