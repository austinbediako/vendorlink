ALTER TABLE bookings ADD COLUMN IF NOT EXISTS public_id VARCHAR(20);
UPDATE bookings
SET public_id = 'BK-' || upper(substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 8))
WHERE public_id IS NULL;
ALTER TABLE bookings ALTER COLUMN public_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS bookings_public_id_key ON bookings (public_id);
