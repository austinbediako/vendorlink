import { ProtectedImage } from './ProtectedImage';
import { BrandMark, PrivateAvatar } from './VisualAssets';

export function ArtisanIdCard({ data = {}, photoUrl = null, photoSrc = '/profile/photo', categoryNames = [], publicId = null }) {
  const experience = Number(data.years_of_experience) || 0;

  return (
    <div className="id-card">
      <div className="id-card-clip" aria-hidden="true" />
      <div className="id-card-head">
        <BrandMark size={18} />
        <span className="id-card-brand">VendorLink</span>
        <span className="id-card-tag">Artisan ID</span>
      </div>
      <div className="id-card-body">
        <div className="id-card-photo">
          {photoUrl ? (
            <img src={photoUrl} alt="" />
          ) : data.has_photo && photoSrc ? (
            <ProtectedImage src={photoSrc} alt="" fallback={<PrivateAvatar size={72} />} />
          ) : (
            <PrivateAvatar size={72} />
          )}
        </div>
        <div className="id-card-info">
          <p className={`id-card-name ${data.full_name?.trim() ? '' : 'id-card-empty'}`}>
            {data.full_name?.trim() || 'Your name'}
          </p>
          <p className={`id-card-meta ${data.location?.trim() ? '' : 'id-card-empty'}`}>
            {data.location?.trim() || 'Service area'}
          </p>
          <p className="id-card-meta">
            {experience > 0 ? `${experience} yr${experience === 1 ? '' : 's'} experience` : 'Experience'}
          </p>
          {publicId && <p className="id-card-meta id-card-public-id">{publicId}</p>}
        </div>
      </div>
      <div className="id-card-chips">
        {categoryNames.length ? (
          categoryNames.slice(0, 4).map((name) => <span key={name} className="id-card-chip">{name}</span>)
        ) : (
          <span className="id-card-chip id-card-empty">Service categories</span>
        )}
      </div>
      <div className="id-card-foot">
        <span className="id-card-status">
          {data.verification_status === 'verified' ? 'Verified artisan' : 'Verification pending'}
        </span>
        <span className="id-card-bars" aria-hidden="true">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
      </div>
    </div>
  );
}
