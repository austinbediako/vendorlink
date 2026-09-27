ALTER TABLE artisan_profiles ADD COLUMN IF NOT EXISTS public_id VARCHAR(20);

UPDATE artisan_profiles
SET public_id = 'VL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE public_id IS NULL;

ALTER TABLE artisan_profiles ALTER COLUMN public_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS artisan_profiles_public_id_key ON artisan_profiles (public_id);

CREATE TABLE IF NOT EXISTS artisan_photos (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  image BYTEA NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
