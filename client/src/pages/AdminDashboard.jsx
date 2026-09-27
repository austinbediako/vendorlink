import { Link } from 'react-router-dom';
import { useAdminDashboard } from '../hooks/useAdmin';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState, DataErrorState } from '../components/EmptyState';
import { AdminConsoleIllustration, PostRequestIllustration, ApplyIllustration } from '../components/VisualAssets';
import { Briefcase, CheckCircle2, ShieldCheck, ShieldAlert, Users, Wrench } from 'lucide-react';

function StatCard({ icon: Icon, label, children }) {
  return (
    <div className="dash-stat">
      <span className="dash-stat-icon" aria-hidden="true"><Icon size={18} /></span>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{label}</span>
        <div className="dash-stat-value">{children}</div>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useAdminDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <DataErrorState error={error} title="We couldn’t load platform activity." onRetry={refetch} />;
  if (!stats) return <EmptyState kind="activity" title="No platform activity to display." description="An overview will appear as accounts and bookings are created." action={{ label: 'Refresh overview', onClick: () => refetch() }} />;

  const pending = Number(stats.pendingVerifications || 0);
  const disputes = Number(stats.openDisputes || 0);

  return (
    <div className="dash-page">
      <header className="dash-head admin-head">
        <div>
          <p className="market-kicker">Admin console</p>
          <h1>Platform overview</h1>
          <p className="dash-head-sub">Verifications, disputes and marketplace activity in one place.</p>
        </div>
        <AdminConsoleIllustration className="admin-head-illustration" />
      </header>

      <div className="dash-grid">
        <StatCard icon={Users} label="Total users">
          <span className="dash-stat-number">{stats.totalUsers || 0}</span>
        </StatCard>
        <StatCard icon={Wrench} label="Artisans">
          <span className="dash-stat-number">{stats.totalArtisans || 0}</span>
        </StatCard>
        <StatCard icon={Briefcase} label="Total bookings">
          <span className="dash-stat-number">{stats.totalBookings || 0}</span>
        </StatCard>
        <StatCard icon={CheckCircle2} label="Completed jobs">
          <span className="dash-stat-number">{stats.completedBookings || 0}</span>
        </StatCard>
      </div>

      {Number(stats.totalBookings || 0) === 0 && (
        <EmptyState compact kind="activity" title="The first booking is still ahead." description="Platform statistics will grow as businesses and artisans begin working together." action={{ label: 'Review artisans', to: '/admin/artisans' }} />
      )}

      <div className="admin-queue-grid">
        <Link to="/admin/artisans" className="admin-queue-card">
          <ApplyIllustration className="admin-queue-illustration" />
          <div className="admin-queue-body">
            <span className="dash-stat-label">Verification queue</span>
            <span className={`admin-queue-count ${pending > 0 ? 'is-attention' : ''}`}>{pending}</span>
            <span className="dash-stat-desc">
              {pending > 0 ? 'Artisans waiting for review — open the roster to approve or reject.' : 'No artisan registrations waiting for review.'}
            </span>
            <span className="admin-queue-cta">Review artisans<ShieldCheck size={14} /></span>
          </div>
        </Link>
        <Link to="/admin/disputes" className="admin-queue-card">
          <PostRequestIllustration className="admin-queue-illustration" />
          <div className="admin-queue-body">
            <span className="dash-stat-label">Open disputes</span>
            <span className={`admin-queue-count ${disputes > 0 ? 'is-attention' : ''}`}>{disputes}</span>
            <span className="dash-stat-desc">
              {disputes > 0 ? 'Disputes between businesses and artisans need your decision.' : 'No disputes between users right now.'}
            </span>
            <span className="admin-queue-cta">Resolve disputes<ShieldAlert size={14} /></span>
          </div>
        </Link>
      </div>
    </div>
  );
}
