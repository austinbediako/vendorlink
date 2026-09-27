import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EvidenceFlip } from '../components/EvidenceFlip';
import { ArrowRight, Lock } from 'lucide-react';
import {
  HeroConnectionIllustration,
  DiscoveryIcon, TrustIcon, TrackingIcon, MatchingIcon, PrivacyIcon, ReputationIcon,
  PostRequestIllustration, ApplyIllustration, LocationRevealIllustration, RatingIllustration,
  FindProvidersIcon, VerifiedProfileIcon, ReviewsIcon, PrivacyDiagram, CtaNetworkMotif,
} from '../components/VisualAssets';

const features = [
  {
    icon: FindProvidersIcon,
    title: 'Find Providers',
    description:
      'Search artisans by category, location, and rating to find the right match for your business needs.',
  },
  {
    icon: VerifiedProfileIcon,
    title: 'Verified Profiles',
    description:
      'Every artisan profile is reviewed by platform administrators to build trust between businesses and providers.',
  },
  {
    icon: ReviewsIcon,
    title: 'Ratings & Reviews',
    description:
      'Leave feedback after every completed job and help other businesses make informed decisions.',
  },
];

const evidence = {
  frontView: {
    label: 'For Businesses',
    cards: [
      {
        category: 'Discovery',
        icon: DiscoveryIcon,
        stat: '8+',
        measure: 'service categories',
        label: 'Browse electricians, plumbers, carpenters, welders, and more by location and rating.',
      },
      {
        category: 'Trust',
        icon: TrustIcon,
        stat: 'Verified',
        measure: 'artisan profiles',
        label: 'Every artisan is reviewed by administrators before they appear in search results.',
      },
      {
        category: 'Tracking',
        icon: TrackingIcon,
        stat: '5',
        measure: 'booking statuses',
        label: 'Follow a request from creation through accepted, in-progress, completed, and rated.',
      },
    ],
  },
  backView: {
    label: 'For Artisans',
    cards: [
      {
        category: 'Matching',
        icon: MatchingIcon,
        stat: 'Targeted',
        measure: 'request feed',
        label: 'Only see service requests aligned with the categories in your completed profile.',
      },
      {
        category: 'Privacy',
        icon: PrivacyIcon,
        stat: 'Masked',
        measure: 'exact locations',
        label: 'Approximate area is shown until a business approves your application or books you.',
      },
      {
        category: 'Reputation',
        icon: ReputationIcon,
        stat: 'Ratings',
        measure: 'build credibility',
        label: 'Completed jobs earn reviews that help you win more business over time.',
      },
    ],
  },
};

const steps = [
  {
    number: '01',
    illustration: PostRequestIllustration,
    title: 'Businesses post service requests',
    description:
      'Describe the work, choose a category, pick the location on a map, and set a preferred date.',
  },
  {
    number: '02',
    illustration: ApplyIllustration,
    title: 'Artisans apply or get booked directly',
    description:
      'Verified artisans see requests that match their skills. Businesses can also book artisans outright.',
  },
  {
    number: '03',
    illustration: LocationRevealIllustration,
    title: 'Locations stay private until approved',
    description:
      'Exact coordinates are hidden from both sides until a booking is accepted or an application is approved.',
  },
  {
    number: '04',
    illustration: RatingIllustration,
    title: 'Ratings build long-term trust',
    description:
      'After a job is completed, businesses rate artisans so quality providers rise to the top.',
  },
];

export function Home() {
  const { user } = useAuth();

  return (
    <div className="flex-1 homepage">
      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28">
        <h1 className="text-[clamp(44px,7.5vw,84px)] font-extrabold leading-[1.05] tracking-tight text-text mb-8 max-w-4xl">
          Connect your business with <span className="text-accent">verified</span> artisans.
        </h1>
        <div className="home-hero-detail">
          <div className="min-w-0">
            <p className="text-[clamp(16px,2vw,18px)] leading-relaxed text-muted max-w-2xl mb-6">
              VendorLink helps Ghanaian businesses discover, book, and track reliable artisans and
              service providers — all in one place.
            </p>
            <p className="text-[clamp(16px,2vw,18px)] leading-relaxed text-muted max-w-2xl mb-10">
              <em>
                That's a marketplace where <strong className="text-text">trust</strong> is built into
                the workflow.
              </em>
            </p>
            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-accent text-white !text-white px-5 py-3 rounded-sm hover:bg-accent-deep transition-colors"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-accent text-white !text-white px-5 py-3 rounded-sm hover:bg-accent-deep transition-colors"
                  >
                    Get Started <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to="/artisans"
                    className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-text !text-text border border-border px-5 py-3 rounded-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    Browse Artisans
                  </Link>
                </>
              )}
            </div>
          </div>
          <HeroConnectionIllustration className="home-hero-visual" />
        </div>
      </section>

      {/* Evidence / Stats */}
      <section className="bg-raised border-y border-border">
        <EvidenceFlip
          kicker="The evidence"
          title="A system built for discovery, safety, and follow-through."
          frontView={evidence.frontView}
          backView={evidence.backView}
        />
      </section>

      {/* What we believe / How it works */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent mb-4">
          How it works
        </p>
        <h2 className="text-[clamp(28px,3.8vw,34px)] font-bold text-text mb-12">
          Your foundation determines what the marketplace multiplies.
        </h2>
        <div className="space-y-10 md:space-y-14">
          {steps.map((step) => (
            <div key={step.number} className="home-workflow-step">
              <span className="font-mono text-sm font-bold text-accent/60 pt-1">
                {step.number}
              </span>
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-bold text-text mb-2">{step.title}</h3>
                <p className="text-muted leading-relaxed max-w-2xl">{step.description}</p>
              </div>
              <step.illustration className="home-workflow-visual" />
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-accent mb-4">
            What you get
          </p>
          <h2 className="text-[clamp(28px,3.8vw,34px)] font-bold text-text mb-12">
            Everything needed to manage vendor relationships.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-bg border border-border p-6 md:p-8 rounded-md hover:shadow-card-hover transition-shadow"
              >
                <feature.icon size={32} className="w-8 h-8 text-accent mb-5" />
                <h3 className="text-lg font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy highlight */}
      <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="bg-raised border border-border rounded-md p-8 md:p-12 home-privacy">
          <div>
            <div className="p-3 bg-accent/10 rounded-full inline-flex mb-5">
              <Lock className="w-6 h-6 text-accent" aria-hidden="true" />
            </div>
            <h2 className="text-[clamp(24px,3vw,30px)] font-bold text-text mb-3">
              Location privacy by design.
            </h2>
            <p className="text-muted leading-relaxed max-w-3xl">
              Exact coordinates are hidden from both businesses and artisans until a booking is
              accepted or an application is approved. General area names are shown so users can
              decide whether to engage without exposing private addresses upfront.
            </p>
          </div>
          <PrivacyDiagram className="home-privacy-visual" />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-text text-bg py-16 md:py-24 relative isolate overflow-hidden">
        <CtaNetworkMotif className="home-cta-motif" />
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 text-center relative">
          <h2 className="text-[clamp(28px,3.8vw,34px)] font-bold mb-6">
            Ready to find your next service provider?
          </h2>
          <p className="text-bg/70 max-w-2xl mx-auto mb-10 text-[clamp(16px,2vw,18px)]">
            Join as a business looking for artisans, or as an artisan building your reputation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-accent text-white !text-white px-6 py-3 rounded-sm hover:bg-accent-deep transition-colors"
            >
              Create an account <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/artisans"
              className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-transparent text-bg !text-bg border border-bg/30 px-6 py-3 rounded-sm hover:border-bg hover:bg-bg hover:text-text transition-colors"
            >
              Browse Artisans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg border-t border-border py-10">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} VendorLink. Vendor Management System.
          </p>
          <div className="flex gap-6">
            <Link to="/login" className="text-sm text-muted hover:text-text transition-colors">
              Login
            </Link>
            <Link to="/register" className="text-sm text-muted hover:text-text transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
