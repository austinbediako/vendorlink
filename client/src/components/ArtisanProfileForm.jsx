import { useEffect, useRef, useState } from 'react';
import { Camera, Check, MapPin } from 'lucide-react';
import { useServiceCategories } from '../hooks';
import { prepareProfilePhoto } from '../lib/image';
import { CategoriesState } from './EmptyState';
import { LocationPicker } from './LocationPicker';
import { ProtectedImage } from './ProtectedImage';
import { PrivateAvatar } from './VisualAssets';
import { ArtisanIdCard } from './ArtisanIdCard';

const PHONE_PREFIX = '+233';

function toLocalDigits(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.replace(/^233/, '').replace(/^0+/, '').slice(0, 9);
}

const EMPTY_FORM = {
  full_name: '',
  bio: '',
  location: '',
  latitude: '',
  longitude: '',
  phone: '',
  categories: [],
  years_of_experience: 0,
};

export function ArtisanProfileForm({
  initial = {},
  onSubmit,
  submitting = false,
  serverError = '',
  submitLabel = 'Save profile',
}) {
  const categoriesQuery = useServiceCategories();
  const categories = categoriesQuery.data || [];

  const [formData, setFormData] = useState({ ...EMPTY_FORM, ...initial });
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [preparing, setPreparing] = useState(false);
  const fileRef = useRef(null);
  const lastAutoLocation = useRef(null);
  const [suggestions, setSuggestions] = useState(null);
  const [searchingArea, setSearchingArea] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [locationFocused, setLocationFocused] = useState(false);
  const searchTimer = useRef(null);
  const searchAbort = useRef(null);

  useEffect(() => {
    if (initial && Object.keys(initial).length) {
      setFormData((prev) => ({ ...prev, ...initial }));
    }
  }, [initial]);

  useEffect(() => () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
  }, [photoUrl]);

  const hasPhoto = !!(photoBlob || initial.has_photo);
  const selectedNames = categories.filter((c) => (formData.categories || []).includes(c.id)).map((c) => c.name);

  const checklist = [
    { label: 'Profile photo', done: hasPhoto },
    { label: 'Full name', done: !!formData.full_name?.trim() },
    { label: 'Service area', done: !!formData.location?.trim() },
    { label: 'Phone number', done: toLocalDigits(formData.phone).length === 9 },
    { label: 'At least one service', done: (formData.categories || []).length > 0 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (id) => {
    const current = formData.categories || [];
    setFormData((prev) => ({
      ...prev,
      categories: current.includes(id) ? current.filter((c) => c !== id) : [...current, id],
    }));
  };

  const searchGhana = async (term) => {
    searchAbort.current?.abort();
    const controller = new AbortController();
    searchAbort.current = controller;
    setSearchingArea(true);
    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=8&bbox=-3.26,4.74,1.27,11.17`,
        { signal: controller.signal }
      );
      const data = res.ok ? await res.json() : { features: [] };
      const seen = new Set();
      const places = (data.features || [])
        .filter((f) => f.properties.countrycode === 'GH')
        .map((f) => ({
          id: `${f.properties.osm_type}-${f.properties.osm_id}`,
          primary: f.properties.name || f.properties.city || f.properties.district || term,
          secondary: [f.properties.district, f.properties.city, f.properties.state, 'Ghana']
            .filter((v, i, arr) => v && arr.indexOf(v) === i)
            .join(', '),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }))
        .filter((p) => {
          const key = `${p.primary}|${p.secondary}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 5);
      if (!controller.signal.aborted) {
        setSuggestions(places);
        setActiveSuggestion(-1);
      }
    } catch {
      if (!controller.signal.aborted) setSuggestions([]);
    } finally {
      if (!controller.signal.aborted) setSearchingArea(false);
    }
  };

  const handleLocationInput = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, location: value }));
    clearTimeout(searchTimer.current);
    if (value.trim().length < 2) {
      setSuggestions(null);
      return;
    }
    searchTimer.current = setTimeout(() => searchGhana(value), 250);
  };

  const pickSuggestion = (place) => {
    const name = [place.primary, place.secondary].filter(Boolean).join(', ');
    lastAutoLocation.current = name;
    setSuggestions(null);
    setFormData((prev) => ({
      ...prev,
      location: name,
      latitude: place.lat,
      longitude: place.lng,
    }));
  };

  const handleLocationKey = (e) => {
    if (!suggestions?.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setActiveSuggestion((i) => (i + delta + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setSuggestions(null);
    }
  };

  const handleLocationChange = (lat, lng, locationName) => {
    setFormData((prev) => {
      const next = { ...prev, latitude: lat, longitude: lng };
      if (locationName && (!prev.location?.trim() || prev.location === lastAutoLocation.current)) {
        next.location = locationName;
        lastAutoLocation.current = locationName;
      }
      return next;
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setPreparing(true);
    try {
      const blob = await prepareProfilePhoto(file);
      setPhotoBlob(blob);
      setPhotoUrl(URL.createObjectURL(blob));
    } catch (err) {
      setPhotoError(err.message);
    } finally {
      setPreparing(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (checklist.some((item) => !item.done)) {
      setFormError('Please add a photo and complete all required fields before continuing.');
      return;
    }
    await onSubmit({
      ...formData,
      years_of_experience: Number(formData.years_of_experience) || 0,
      categories: formData.categories || [],
    }, photoBlob);
  };

  const busy = submitting || preparing;
  const error = formError || serverError;

  return (
    <div className="profile-setup-grid">
      <form onSubmit={handleSubmit} className="profile-form" noValidate={false}>
        {error && <div className="form-error" role="alert">{error}</div>}

        <section className="form-section">
          <h2 className="form-section-title">Photo</h2>
          <p className="form-section-hint">A clear photo of your face. Required — businesses only see it after signing in.</p>
          <button
            type="button"
            className="photo-drop"
            onClick={() => fileRef.current?.click()}
            disabled={preparing}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Selected profile photo preview" className="photo-drop-img" />
            ) : initial.has_photo ? (
              <ProtectedImage
                src="/profile/photo"
                alt="Current profile photo"
                className="photo-drop-img"
                fallback={<PrivateAvatar size={56} />}
              />
            ) : (
              <span className="photo-drop-placeholder">
                <Camera size={22} aria-hidden="true" />
                <span>{preparing ? 'Preparing photo…' : 'Upload a photo'}</span>
                <span className="photo-drop-sub">JPEG, PNG or WebP</span>
              </span>
            )}
            <span className="photo-drop-change">{hasPhoto ? 'Change photo' : ''}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Profile photo"
            onChange={handleFile}
          />
          {photoError && <p className="field-error" role="alert">{photoError}</p>}
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Basics</h2>
          <label className="field">
            <span className="field-label">Full name *</span>
            <input name="full_name" required maxLength={255} value={formData.full_name || ''} onChange={handleChange} placeholder="e.g. Ama Serwaa" />
          </label>
          <label className="field">
            <span className="field-label">Years of experience</span>
            <input name="years_of_experience" type="number" min="0" max="80" value={formData.years_of_experience || 0} onChange={handleChange} />
          </label>
          <label className="field">
            <span className="field-label">Bio</span>
            <textarea name="bio" rows={3} maxLength={1000} value={formData.bio || ''} onChange={handleChange} placeholder="Tell businesses what you make, fix, or build." />
          </label>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Services *</h2>
          <CategoriesState query={categoriesQuery} />
          <div className="chip-row" role="group" aria-label="Service categories">
            {categories.map((cat) => {
              const active = (formData.categories || []).includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`chip ${active ? 'chip-active' : ''}`}
                  aria-pressed={active}
                  onClick={() => toggleCategory(cat.id)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Location</h2>
          <div className="field">
            <span className="field-label">Service area *</span>
            <div className="location-field-wrap">
              <input
                name="location"
                required
                maxLength={255}
                autoComplete="off"
                value={formData.location || ''}
                onChange={handleLocationInput}
                onKeyDown={handleLocationKey}
                onFocus={() => setLocationFocused(true)}
                onBlur={() => setLocationFocused(false)}
                placeholder="e.g. Accra — Osu"
                role="combobox"
                aria-expanded={!!suggestions?.length}
                aria-controls="location-suggestions"
                aria-autocomplete="list"
                aria-activedescendant={activeSuggestion >= 0 ? `location-option-${activeSuggestion}` : undefined}
              />
              {(suggestions || searchingArea) && locationFocused && (
                <ul className="location-suggestions" id="location-suggestions" role="listbox" aria-label="Places in Ghana">
                  {searchingArea && <li className="location-suggestion-status">Searching Ghana…</li>}
                  {!searchingArea && suggestions?.length === 0 && (
                    <li className="location-suggestion-status">No places found — try a nearby town</li>
                  )}
                  {(suggestions || []).map((place, i) => (
                    <li key={place.id}>
                      <button
                        type="button"
                        role="option"
                        id={`location-option-${i}`}
                        aria-selected={i === activeSuggestion}
                        className={i === activeSuggestion ? 'is-active' : ''}
                        onMouseDown={(e) => { e.preventDefault(); pickSuggestion(place); }}
                        onMouseEnter={() => setActiveSuggestion(i)}
                      >
                        <MapPin size={13} aria-hidden="true" />
                        <span className="suggestion-text">
                          <strong>{place.primary}</strong>
                          {place.secondary && <small>{place.secondary}</small>}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <span className="field-hint">
              <MapPin size={12} aria-hidden="true" />
              Type to search places in Ghana, or click the map below. Keep it general — this is shown on your public card.
            </span>
          </div>
          <label className="field">
            <span className="field-label">Pin your workshop on the map (private)</span>
            <LocationPicker latitude={formData.latitude} longitude={formData.longitude} onChange={handleLocationChange} />
            <span className="field-hint">Only revealed to a business after an approved booking.</span>
          </label>
        </section>

        <section className="form-section">
          <h2 className="form-section-title">Contact</h2>
          <div className="field">
            <span className="field-label">Phone *</span>
            <div className="phone-input">
              <span className="phone-prefix" aria-hidden="true">+233</span>
              <input
                name="phone_local"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                required
                aria-label="Ghana phone number, nine digits"
                value={toLocalDigits(formData.phone)}
                onChange={(e) => {
                  const digits = toLocalDigits(e.target.value);
                  setFormData((prev) => ({ ...prev, phone: digits ? `${PHONE_PREFIX}${digits}` : '' }));
                }}
                placeholder="55 123 4567"
              />
            </div>
            <span className="field-hint">Ghana numbers only — enter the 9 digits without the leading 0. Only visible to signed-in members.</span>
          </div>
        </section>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy || categoriesQuery.isError}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </form>

      <aside className="id-preview" aria-label="Live profile preview">
        <ArtisanIdCard
          data={{ ...formData, verification_status: initial.verification_status }}
          photoUrl={photoUrl}
          categoryNames={selectedNames}
          publicId={initial.public_id}
        />

        <ul className="id-checklist" aria-label="Profile checklist">
          {checklist.map((item) => (
            <li key={item.label} className={item.done ? 'done' : ''}>
              <span className="id-check" aria-hidden="true">{item.done && <Check size={12} />}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
