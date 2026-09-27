ALTER TABLE artisan_photos ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE artisan_photos ADD COLUMN IF NOT EXISTS delete_url TEXT;

DELETE FROM artisan_photos WHERE image_url IS NULL;

ALTER TABLE artisan_photos ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE artisan_photos DROP COLUMN IF EXISTS image;
ALTER TABLE artisan_photos DROP COLUMN IF EXISTS mime_type;
