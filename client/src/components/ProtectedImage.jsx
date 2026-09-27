import { useEffect, useState } from 'react';
import api from '../services/api';

export function ProtectedImage({ src, alt, className = '', fallback = null }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked = null;
    let cancelled = false;
    setFailed(false);
    setObjectUrl(null);

    api.get(src, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        revoked = URL.createObjectURL(res.data);
        setObjectUrl(revoked);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [src]);

  if (failed) return fallback;
  if (!objectUrl) return <div className={`protected-image-loading ${className}`} aria-hidden="true" />;
  return <img src={objectUrl} alt={alt} className={className} />;
}
