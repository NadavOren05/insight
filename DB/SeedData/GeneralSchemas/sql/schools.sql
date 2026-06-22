-- Generated fake data for schools. Regenerate with generate_fake_data.py.
INSERT INTO schools (id, name, city, district, peripheral_index, created_at)
VALUES
    ('15a481bc-f333-5ba1-9ddf-f5baf1957b7a', 'בית ספר הדגמה אינסייט 1', 'תל אביב', 'מרכז', 8, '2026-06-22T12:00:00+00:00'),
    ('23e1eb6e-ebb8-55fb-9d94-1ae601947003', 'בית ספר הדגמה אינסייט 2', 'חיפה', 'צפון', 3, '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    district = EXCLUDED.district,
    peripheral_index = EXCLUDED.peripheral_index,
    created_at = EXCLUDED.created_at;
