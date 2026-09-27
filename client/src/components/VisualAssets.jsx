function Asset({ children, className = '', viewBox = '0 0 24 24', size = 24 }) {
  const [, , width, height] = viewBox.split(' ').map(Number);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={(size * height) / width}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`visual-asset ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function Pin({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M12 22S4 15 4 9a8 8 0 0 1 16 0c0 6-8 13-8 13Z" fill="var(--surface)" />
      <circle cx="12" cy="9" r="2.5" />
    </g>
  );
}

function Check({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="0" r="10" fill="var(--accent)" stroke="var(--accent)" />
      <path d="m-4 0 3 3 5-6" stroke="var(--surface)" />
    </g>
  );
}

function Profile({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="48" height="56" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="24" cy="18" r="6" />
      <path d="M14 35v-3a10 10 0 0 1 20 0v3M15 45h18" />
    </g>
  );
}

function Request({ x = 0, y = 0 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="48" height="56" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <path d="M10 14h16M10 22h28M10 30h20" />
      <rect x="10" y="40" width="16" height="6" rx="2" fill="var(--accent-soft)" stroke="none" />
    </g>
  );
}

function StarShape({ x = 0, y = 0 }) {
  return <path transform={`translate(${x} ${y})`} d="m0-7 2.2 4.5 5 .7-3.6 3.5.9 5L0 3.4l-4.5 2.3.9-5L-7.2-1.8l5-.7Z" />;
}

export function BrandMark({ className = '', size = 28 }) {
  return (
    <Asset className={className} size={size}>
      <path d="m6 7 6 11L21 5" strokeWidth="2" />
      <rect x="2" y="3" width="7" height="7" rx="2" fill="var(--bg)" strokeWidth="2" />
      <circle cx="12" cy="18" r="3" fill="currentColor" stroke="none" />
    </Asset>
  );
}

export function DiscoveryIcon(props) {
  return (
    <Asset {...props}>
      <path d="M10 18s-6-5.5-6-10a6 6 0 0 1 12 0" />
      <circle cx="10" cy="8" r="2" />
      <circle cx="16" cy="15" r="4" />
      <path d="m19 18 3 3" />
    </Asset>
  );
}

export function TrustIcon(props) {
  return (
    <Asset {...props}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20v-3a6 6 0 0 1 9-5M17 10l5 2v4c0 3-5 6-5 6s-5-3-5-6v-4Z" />
      <path d="m15 16 1.5 1.5L19 15" />
    </Asset>
  );
}

export function TrackingIcon(props) {
  return (
    <Asset {...props}>
      <path d="M5 6h12a4 4 0 0 1 0 8H7a4 4 0 0 0 0 8h12" />
      {[[4, 6], [12, 6], [20, 10], [8, 14], [16, 22]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="var(--surface)" />
      ))}
    </Asset>
  );
}

export function MatchingIcon(props) {
  return (
    <Asset {...props}>
      <path d="M6 15H3V3h12v3" />
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M6 7h5m0 8 2.5 2.5L18 13" />
    </Asset>
  );
}

export function PrivacyIcon(props) {
  return (
    <Asset {...props}>
      <path d="M10 22S3 16 3 9a7 7 0 0 1 14 0M7 9h6" strokeDasharray="2 3" />
      <rect x="12" y="13" width="10" height="8" rx="2" fill="var(--surface)" />
      <path d="M14 13v-2a3 3 0 0 1 6 0v2m-3 4v1" />
    </Asset>
  );
}

export function ReputationIcon(props) {
  return (
    <Asset {...props}>
      <g transform="translate(8 8) scale(.8)"><StarShape /></g>
      <path d="M3 21h19M12 17v4m4-8v8m4-13v13" />
    </Asset>
  );
}

export function FindProvidersIcon(props) {
  return (
    <Asset {...props}>
      <path d="M15 21c-1.2.6-2.6 1-4 1a10 10 0 0 1-8-16M18 3h4v4m-4-4-3 3" />
      <path d="M11 18S5 12.5 5 8a6 6 0 0 1 12 0c0 4.5-6 10-6 10Z" />
      <circle cx="11" cy="8" r="2" />
      <path d="M18 15h4v4h-4z" />
    </Asset>
  );
}

export function VerifiedProfileIcon(props) {
  return (
    <Asset {...props}>
      <path d="M12 21H3V3h17v7" />
      <circle cx="10" cy="9" r="2.5" />
      <path d="M6 17v-1a4 4 0 0 1 7-2" />
      <circle cx="18" cy="17" r="5" fill="var(--bg)" />
      <path d="m15.5 17 1.5 1.5 3-3" />
    </Asset>
  );
}

export function ReviewsIcon(props) {
  return (
    <Asset {...props}>
      <path d="M15 12v4H7l-4 3V4h15v4m0 0h4v13l-4-3h-7v-2" />
      <g transform="translate(10.5 9) scale(.5)"><StarShape /></g>
    </Asset>
  );
}

export function HeroConnectionIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 400 280" size={400} className={className}>
      <g stroke="var(--border)">
        <path d="M16 48h368M16 232h368M40 24v232M360 24v232" />
        <path d="M36 48h8m-4-4v8m316 180h8m-4-4v8" stroke="var(--muted)" />
        <path d="M68 196h256" strokeDasharray="3 6" />
      </g>
      <path d="M118 128h38a24 24 0 0 1 24 24v20a24 24 0 0 0 24 24h38a24 24 0 0 0 24-24v-54" stroke="var(--accent)" strokeWidth="2" />
      <rect x="44" y="70" width="100" height="112" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <path d="M66 132V94h56v38M62 132h64M76 132v-15h16v15M75 103h5m11 0h5m11 0h5m-5 14h5" stroke="var(--text)" />
      <text x="60" y="156" className="visual-label">BUSINESS</text>
      <path d="M60 166h38" stroke="var(--border)" />
      <rect x="234" y="50" width="122" height="120" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="266" cy="82" r="11" fill="var(--raised)" stroke="var(--text)" />
      <path d="M250 108a16 16 0 0 1 32 0M296 78h42m-42 9h28" stroke="var(--text)" />
      <path d="m316 104-8 8m8-8v-6l6-2-2 5 3 3 5-2-2 6h-6" stroke="var(--accent)" />
      <text x="250" y="137" className="visual-label">ARTISAN</text>
      <path d="M250 147h38" stroke="var(--border)" />
      <Check x={234} y={50} />
      <g transform="translate(152 174)">
        <rect width="56" height="44" rx="4" fill="var(--raised)" stroke="var(--border)" />
        <path d="M18 14h20M18 22h14m-14 8h9" stroke="var(--text)" />
      </g>
      <circle cx="266" cy="196" r="4" fill="var(--accent)" stroke="none" />
      <text x="58" y="253" className="visual-label">DISCOVER</text>
      <path d="M128 249h28m-4-3 4 3-4 3" stroke="var(--border)" />
      <text x="172" y="253" className="visual-label">BOOK</text>
      <path d="M216 249h28m-4-3 4 3-4 3" stroke="var(--border)" />
      <text x="260" y="253" className="visual-label">BUILD TRUST</text>
    </Asset>
  );
}

export function PostRequestIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 80" size={120} className={className}>
      <Request x={16} y={10} />
      <g stroke="var(--accent)"><Pin x={76} y={12} /></g>
      <rect x="64" y="42" width="36" height="28" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <path d="M64 51h36m-26-13v8m16-8v8" />
      <circle cx="83" cy="59" r="2" fill="var(--accent)" stroke="none" />
    </Asset>
  );
}

export function ApplyIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 80" size={120} className={className}>
      <Profile x={4} y={12} />
      <Request x={68} y={12} />
      <path d="M44 40h32m-5-5 5 5-5 5" stroke="var(--accent)" />
      <Check x={43} y={15} />
    </Asset>
  );
}

export function LocationRevealIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 80" size={120} className={className}>
      <ellipse cx="26" cy="43" rx="21" ry="26" fill="var(--raised)" stroke="var(--border)" strokeDasharray="3 4" />
      <g stroke="var(--muted)"><Pin x={14} y={30} /></g>
      <path d="M50 42h25m-4-4 4 4-4 4" stroke="var(--accent)" />
      <g stroke="var(--accent)"><Pin x={84} y={30} /></g>
      <rect x="20" y="37" width="12" height="9" rx="2" fill="var(--surface)" />
      <path d="M23 37v-2a3 3 0 0 1 6 0v2" />
      <Check x={99} y={63} />
    </Asset>
  );
}

export function RatingIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 80" size={120} className={className}>
      <Profile x={12} y={10} />
      <path d="M64 45h14V33h13V21h15" stroke="var(--border)" />
      <rect x="36" y="47" width="76" height="24" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <g stroke="var(--accent)" fill="var(--accent-soft)">
        <StarShape x={50} y={59} /><StarShape x={74} y={59} /><StarShape x={98} y={59} />
      </g>
    </Asset>
  );
}

export function PrivacyDiagram({ className = '' }) {
  return (
    <Asset viewBox="0 0 300 200" size={300} className={className}>
      <rect x="28" y="32" width="244" height="132" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <g stroke="var(--border)">
        <path d="M28 78h244M28 122h244M88 32v132M212 32v132m-94-132v46l64 44v42" />
      </g>
      <ellipse cx="150" cy="98" rx="55" ry="48" fill="var(--raised)" stroke="var(--muted)" strokeDasharray="3 5" />
      <path d="M38 98h62m100 0h62" stroke="var(--accent)" strokeDasharray="3 5" />
      <g stroke="var(--text)">
        <circle cx="38" cy="98" r="16" fill="var(--surface)" />
        <path d="M30 105V91h16v14m-10 0v-6h4v6" />
        <circle cx="262" cy="98" r="16" fill="var(--surface)" />
        <circle cx="262" cy="93" r="4" />
        <path d="M255 105a7 7 0 0 1 14 0" />
      </g>
      <rect x="136" y="92" width="28" height="23" rx="4" fill="var(--surface)" stroke="var(--accent)" />
      <path d="M142 92v-8a8 8 0 0 1 16 0v8m-8 10v5" stroke="var(--accent)" />
      <text x="150" y="137" textAnchor="middle" className="visual-label">AREA ONLY</text>
      <text x="150" y="187" textAnchor="middle" className="visual-label">EXACT LOCATION AFTER APPROVAL</text>
    </Asset>
  );
}

export function ProfileSetupIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 160 112" size={160} className={className}>
      <path d="M8 94h144M24 12v88" stroke="var(--border)" strokeDasharray="3 5" />
      <rect x="32" y="14" width="82" height="82" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="56" cy="38" r="8" fill="var(--raised)" stroke="var(--text)" />
      <path d="M43 60v-2a13 13 0 0 1 26 0v2m11-26h20M80 43h14" stroke="var(--text)" />
      <path d="M44 75h10m6 0h10m6 0h10M44 83h40" stroke="var(--border)" />
      <rect x="94" y="62" width="42" height="40" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <g stroke="var(--accent)"><Pin x={103} y={71} /></g>
      <circle cx="114" cy="24" r="13" fill="var(--accent)" stroke="none" />
      <path d="m108 28 1-5 8-8 4 4-8 8-5 1Zm7-11 4 4" stroke="var(--surface)" />
    </Asset>
  );
}

export function LoginIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 360 240" size={360} className={className}>
      <g stroke="var(--border)">
        <path d="M40 40h280M40 200h280M60 20v200M300 20v200" />
        <path d="M54 40h12m-6-6v12m244 164h12m-6-6v12" />
      </g>
      <rect x="80" y="60" width="200" height="120" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <path d="M100 90h160M100 110h120M100 130h80" stroke="var(--border)" />
      <circle cx="260" cy="100" r="14" fill="var(--raised)" stroke="var(--text)" />
      <path d="M252 100 258 106 270 94" stroke="var(--accent)" />
      <rect x="120" y="150" width="120" height="40" rx="4" fill="var(--bg)" stroke="var(--border)" />
      <rect x="135" y="166" width="90" height="8" rx="2" fill="var(--accent-soft)" stroke="none" />
      <g transform="translate(180 22)">
        <rect width="120" height="80" rx="4" fill="var(--raised)" stroke="var(--border)" />
        <circle cx="60" cy="28" r="10" fill="var(--bg)" stroke="var(--text)" />
        <path d="M40 52a20 20 0 0 1 40 0" stroke="var(--text)" />
        <path d="M95 18h15M95 28h10M95 38h12" stroke="var(--border)" />
      </g>
      <path d="M80 60v-12a8 8 0 0 1 8-8h184a8 8 0 0 1 8 8v12" stroke="var(--accent)" />
    </Asset>
  );
}

export function RegisterIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 360 240" size={360} className={className}>
      <g stroke="var(--border)">
        <path d="M40 40h280M40 200h280M60 20v200M300 20v200" />
        <path d="M54 40h12m-6-6v12m244 164h12m-6-6v12" />
      </g>
      <rect x="48" y="78" width="116" height="84" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="76" cy="108" r="12" fill="var(--raised)" stroke="var(--text)" />
      <path d="M56 138v-4a20 20 0 0 1 40 0v4" stroke="var(--text)" />
      <path d="M60 132h8M73 132h8M86 132h8" stroke="var(--border)" />
      <rect x="196" y="78" width="116" height="84" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="232" cy="108" r="12" fill="var(--raised)" stroke="var(--text)" />
      <path d="M62 58h30M230 58h20" stroke="var(--text)" />
      <path d="M212 138v-4a20 20 0 0 1 40 0v4" stroke="var(--text)" />
      <path d="M110 134h20M246 134h20" stroke="var(--accent)" />
      <path d="M164 120c0-18 14-32 32-32" stroke="var(--accent)" fill="none" strokeDasharray="4 4" />
      <circle cx="188" cy="124" r="10" fill="var(--accent)" stroke="none" />
      <path d="m183 124 3 3 7-7" stroke="var(--surface)" />
    </Asset>
  );
}

export function BusinessIcon(props) {
  return (
    <Asset {...props}>
      <path d="M4 20h16M6 20V10h5v10M13 20V6h5v14M4 10h7M13 6h7" />
    </Asset>
  );
}

export function ArtisanIcon(props) {
  return (
    <Asset {...props}>
      <path d="M14.7 6.3a2.5 2.5 0 1 1-3.5 3.5L4 17l-2 3 3-2 7.2-7.2a2.5 2.5 0 0 1 3.5-3.5Z" />
      <path d="M17 4h3v3" />
    </Asset>
  );
}

export function StateIllustration({ kind = 'requests', className = '' }) {
  const scenes = {
    search: <>
      <Profile x={48} y={38} /><Profile x={110} y={26} />
      <circle cx="149" cy="88" r="24" fill="var(--raised)" stroke="var(--accent)" />
      <path d="m166 105 22 22M139 88h20" stroke="var(--accent)" />
    </>,
    bookings: <>
      <rect x="52" y="30" width="112" height="94" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <path d="M52 55h112M78 22v17m60-17v17M73 74h12m17 0h12m17 0h12M73 92h12m17 0h12" />
      <circle cx="158" cy="113" r="21" fill="var(--raised)" stroke="var(--accent)" />
      <path d="M158 100v13h10" stroke="var(--accent)" />
    </>,
    requests: <>
      <Request x={66} y={25} /><Request x={112} y={43} />
      <path d="m46 99 11-15h24l10 14h38l10-14h24l11 15v26H46Z" fill="var(--raised)" stroke="var(--border)" />
      <path d="M93 113h34" stroke="var(--accent)" />
    </>,
    applications: <>
      <Request x={42} y={44} /><Profile x={134} y={44} />
      <path d="M95 72h33m-7-6 7 6-7 6" stroke="var(--accent)" strokeDasharray="3 4" />
      <circle cx="158" cy="118" r="3" fill="var(--accent)" stroke="none" />
    </>,
    reviews: <>
      <path d="M54 35h113v67h-46l-24 20v-20H54Z" fill="var(--surface)" stroke="var(--border)" />
      <g transform="translate(110 64) scale(2)" stroke="var(--accent)"><StarShape /></g>
      <path d="M76 88h68M153 117h24m-12-12v24" stroke="var(--border)" />
    </>,
    categories: <>
      <rect x="56" y="34" width="44" height="36" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <rect x="112" y="34" width="44" height="36" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <rect x="56" y="82" width="44" height="36" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <rect x="112" y="82" width="44" height="36" rx="4" stroke="var(--accent)" strokeDasharray="3 4" />
      <path d="M127 100h14m-7-7v14" stroke="var(--accent)" />
    </>,
    profile: <><Profile x={86} y={38} /><path d="M70 112h80M158 62v20m-10-10h20" stroke="var(--accent)" /></>,
    clear: <>
      <path d="m110 27 45 17v32c0 28-45 53-45 53S65 104 65 76V44Z" fill="var(--raised)" stroke="var(--border)" />
      <path d="m91 76 13 13 25-28" stroke="var(--accent)" strokeWidth="2" />
      <path d="M46 64h10m-5-5v10m113 38h10m-5-5v10" stroke="var(--border)" />
    </>,
    activity: <>
      <rect x="47" y="34" width="126" height="90" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <path d="M63 107h94M69 94h17m15-15h17m15-16h17" stroke="var(--border)" />
      <path d="M70 84V63h19m-5-5 5 5-5 5" stroke="var(--accent)" />
      <circle cx="150" cy="95" r="13" fill="var(--raised)" stroke="var(--accent)" />
    </>,
    error: <>
      <rect x="46" y="45" width="50" height="66" rx="4" fill="var(--surface)" stroke="var(--border)" />
      <rect x="132" y="45" width="42" height="66" rx="4" fill="var(--raised)" stroke="var(--border)" />
      <path d="M62 63h17m-17 12h17m20 4h9m12 0h9m-23-9 10 18m4-47 5-10m-19 8-3-12" stroke="var(--accent)" />
    </>,
    'not-found': <>
      <path d="M38 121h42a18 18 0 0 0 18-18V77a18 18 0 0 1 18-18h30" stroke="var(--accent)" strokeDasharray="4 5" />
      <path d="M146 28v100m0-94h33l16 15-16 15h-33" stroke="var(--text)" fill="var(--raised)" />
      <g stroke="var(--accent)"><Pin x={45} y={79} /></g>
      <circle cx="108" cy="35" r="8" stroke="var(--border)" />
      <path d="m104 31 8 8m0-8-8 8" stroke="var(--border)" />
    </>,
  };
  return (
    <Asset viewBox="0 0 220 152" size={220} className={className}>
      <path d="M28 130h164M34 20v116m152-108v108" stroke="var(--border)" strokeDasharray="2 6" />
      <g stroke="var(--muted)">{scenes[kind] || scenes.requests}</g>
    </Asset>
  );
}

export function PrivateAvatar({ className = '', size = 96 }) {
  return (
    <Asset viewBox="0 0 96 96" size={size} className={className}>
      <rect x="2" y="2" width="92" height="92" rx="8" fill="var(--faint)" stroke="var(--border)" />
      <circle cx="48" cy="38" r="15" fill="var(--border)" stroke="none" />
      <path d="M24 82v-6a24 24 0 0 1 48 0v6" fill="var(--border)" stroke="none" />
      <g transform="translate(72 20)">
        <rect x="-9" y="-2" width="18" height="14" rx="3" fill="var(--surface)" stroke="var(--accent)" />
        <path d="M-5-2v-4a5 5 0 0 1 10 0v4" stroke="var(--accent)" />
        <circle cx="0" cy="5" r="1.8" fill="var(--accent)" stroke="none" />
      </g>
    </Asset>
  );
}

export function NotFoundIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 320 200" size={320} className={className}>
      <path d="M24 176h272" stroke="var(--border)" />
      <g stroke="var(--muted)">
        <rect x="40" y="56" width="88" height="120" rx="6" fill="var(--surface)" stroke="var(--border)" />
        <path d="M56 84h56M56 102h40M56 120h48" stroke="var(--border)" />
        <g transform="translate(196 60)">
          <rect width="96" height="60" rx="6" fill="var(--raised)" stroke="var(--border)" />
          <path d="M14 20h44M14 34h28" stroke="var(--border)" />
          <circle cx="76" cy="38" r="9" stroke="var(--accent)" />
          <path d="m72.5 34.5 7 7m0-7-7 7" stroke="var(--accent)" />
        </g>
        <path d="M128 116h30a16 16 0 0 0 16-16v-8" stroke="var(--accent)" strokeDasharray="4 5" />
        <path d="M196 132v44m0-36h56l14 14-14 14h-56" stroke="var(--text)" fill="var(--surface)" />
      </g>
      <g stroke="var(--accent)"><Pin x={64} y={120} /></g>
    </Asset>
  );
}

export function LockedProfileIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 84" size={120} className={className}>
      <path d="M14 70h92M20 14v60" stroke="var(--border)" strokeDasharray="2 6" />
      <rect x="22" y="16" width="66" height="54" rx="5" fill="var(--surface)" stroke="var(--border)" />
      <circle cx="41" cy="34" r="9" fill="var(--raised)" stroke="var(--text)" />
      <path d="M29 54v-2a12 12 0 0 1 24 0v2" stroke="var(--text)" />
      <path d="M58 28h20M58 36h14M58 52h20" stroke="var(--border)" />
      <path d="M58 60h12" stroke="var(--border)" strokeDasharray="2 3" />
      <g transform="translate(92 44)">
        <rect x="-10" y="-4" width="20" height="16" rx="4" fill="var(--accent)" stroke="none" />
        <path d="M-5-4v-4a5 5 0 0 1 10 0v4" fill="none" stroke="var(--accent)" />
        <circle cx="0" cy="3" r="2" fill="var(--surface)" stroke="none" />
        <path d="M0 5v3" stroke="var(--surface)" />
      </g>
      <path d="M96 20h8m-4-4v8" stroke="var(--accent)" />
    </Asset>
  );
}

export function BookingsIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 160 100" size={160} className={className}>
      <path d="M16 84h128M24 18v70" stroke="var(--border)" strokeDasharray="2 6" />
      <g>
        <rect x="34" y="16" width="70" height="64" rx="6" fill="var(--surface)" stroke="var(--border)" />
        <path d="M34 30h70" stroke="var(--border)" />
        <rect x="52" y="11" width="34" height="10" rx="4" fill="var(--raised)" stroke="var(--border)" />
        <path d="M44 42h20M44 50h34M44 58h26" stroke="var(--border)" />
        <path d="M44 68c5-5 9 2 14-3 4-4 8 2 14-2" stroke="var(--muted)" fill="none" />
      </g>
      <g>
        <rect x="98" y="40" width="40" height="40" rx="6" fill="var(--raised)" stroke="var(--border)" />
        <circle cx="118" cy="56" r="10" fill="var(--accent)" stroke="none" />
        <path d="M113 56l3.5 3.5 6-7" stroke="var(--surface)" strokeWidth="2" fill="none" />
        <path d="M106 72h24" stroke="var(--border)" />
      </g>
      <path d="M28 32h6m-3-3v6" stroke="var(--accent)" />
    </Asset>
  );
}

export function DisputeIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 160 100" size={160} className={className}>
      <path d="M16 84h128M24 20v68" stroke="var(--border)" strokeDasharray="2 6" />
      <g>
        <rect x="26" y="22" width="52" height="34" rx="7" fill="var(--surface)" stroke="var(--border)" />
        <path d="M40 56l-3 10 12-10" fill="var(--surface)" stroke="var(--border)" />
        <path d="M36 34h30M36 42h20" stroke="var(--border)" />
      </g>
      <g>
        <rect x="80" y="42" width="54" height="36" rx="7" fill="var(--raised)" stroke="var(--border)" />
        <path d="M120 78l3 10-13-10" fill="var(--raised)" stroke="var(--border)" />
        <path d="M90 54h32M90 62h18" stroke="var(--border)" />
      </g>
      <g transform="translate(108 20)">
        <rect x="-9" y="-8" width="18" height="18" rx="4" fill="var(--surface)" stroke="var(--accent)" />
        <path d="M0-4v7" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="0" cy="6" r="1.4" fill="var(--accent)" stroke="none" />
      </g>
      <path d="M148 30h6m-3-3v6" stroke="var(--accent)" />
    </Asset>
  );
}

export function ToolsIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 120 84" size={120} className={className}>
      <path d="M14 70h92M20 16v58" stroke="var(--border)" strokeDasharray="2 6" />
      <rect x="24" y="22" width="72" height="46" rx="5" fill="var(--surface)" stroke="var(--border)" />
      <path d="M24 36h72" stroke="var(--border)" />
      <rect x="48" y="18" width="24" height="10" rx="3" fill="var(--raised)" stroke="var(--border)" />
      <path d="M52 18v-3a8 8 0 0 1 16 0v3" stroke="var(--text)" />
      <g stroke="var(--text)" fill="var(--raised)">
        <path d="M40 60 52 48m-4-4 4 4 2-2a4.5 4.5 0 0 1-2-6.5 5 5 0 0 1 6.5-.5L57 42l3.5 3.5-3 1.5a5 5 0 0 1 .5 6.5 4.5 4.5 0 0 1-6.5 2l-2-2-4 4-6.5 6.5a3 3 0 0 1-4.2-4.2Z" fill="none" />
      </g>
      <path d="M72 44l8 8-4 4-8-8Zm10 5 4 4a3 3 0 0 1-4.2 4.2l-3.8-4.2" fill="none" stroke="var(--text)" />
      <path d="M72 44l-3-3 4-4 3 3" fill="none" stroke="var(--text)" />
      <circle cx="88" cy="26" r="7" fill="var(--accent)" stroke="none" />
      <path d="M85.5 26h5M88 23.5v5" stroke="var(--surface)" strokeWidth="2" />
      <path d="M34 52h8m-4-4v8" stroke="var(--accent)" />
    </Asset>
  );
}

export function AdminConsoleIllustration({ className = '' }) {
  return (
    <Asset viewBox="0 0 280 180" size={280} className={className}>
      <g stroke="var(--border)">
        <path d="M28 158h224M36 24v140M244 24v140" strokeDasharray="2 6" />
      </g>
      <rect x="48" y="34" width="148" height="110" rx="5" fill="var(--surface)" stroke="var(--border)" />
      <rect x="48" y="34" width="148" height="22" rx="5" fill="var(--raised)" stroke="var(--border)" />
      <path d="M60 45h20m10 0h14" stroke="var(--muted)" />
      <g stroke="var(--text)">
        <circle cx="66" cy="72" r="6" fill="var(--raised)" />
        <path d="M80 69h52m-52 8h36" stroke="var(--border)" />
        <circle cx="66" cy="98" r="6" fill="var(--raised)" />
        <path d="M80 95h52m-52 8h36" stroke="var(--border)" />
        <circle cx="66" cy="124" r="6" fill="var(--raised)" />
        <path d="M80 121h52m-52 8h36" stroke="var(--border)" />
      </g>
      <circle cx="176" cy="72" r="8" stroke="var(--accent)" strokeDasharray="2 4" />
      <circle cx="176" cy="98" r="8" stroke="var(--accent)" strokeDasharray="2 4" />
      <path d="m172 98 3 3 5-6" stroke="var(--accent)" />
      <g transform="translate(212 118)">
        <path d="m0-30 26 9v16c0 18-26 32-26 32S-26 13-26-5v-16Z" fill="var(--accent)" stroke="none" />
        <path d="m-9-4 6 7 12-13" stroke="var(--surface)" strokeWidth="2.5" />
      </g>
      <circle cx="54" cy="158" r="3" fill="var(--accent)" stroke="none" />
    </Asset>
  );
}

export function CtaNetworkMotif({ className = '' }) {
  return (
    <Asset viewBox="0 0 1100 360" size={1100} className={className}>
      <path d="M-20 78H82a24 24 0 0 1 24 24v128a24 24 0 0 0 24 24h104M78 384v-48a24 24 0 0 1 24-24h66M1120 282h-102a24 24 0 0 1-24-24V126a24 24 0 0 0-24-24H866M1022-24v48a24 24 0 0 1-24 24h-66" />
      {[[34, 78], [106, 150], [168, 312], [234, 254], [1066, 282], [994, 210], [932, 48], [866, 102]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="var(--text)" />
      ))}
    </Asset>
  );
}
