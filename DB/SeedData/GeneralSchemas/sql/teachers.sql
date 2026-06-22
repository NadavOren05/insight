-- Generated fake data for teachers. Regenerate with generate_fake_data.py.
INSERT INTO teachers (id, full_name, email, phone, school_id, created_at)
VALUES
    ('1361c70b-f632-5c31-b999-99c44b56aefe', 'Daniel Mizrahi', 'daniel.mizrahi.1@demo-school.example', '+972-50-0100001', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('684db7b1-ec37-5543-82bd-9fd47a3b8b2f', 'Tamar Biton', 'tamar.biton.1@demo-school.example', '+972-50-0100002', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('595a9f52-b286-565c-901d-a9343ff62956', 'Eitan Friedman', 'eitan.friedman.1@demo-school.example', '+972-50-0100003', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('c28b0abb-1744-5fc4-b039-f11dfa5118de', 'Yael Cohen', 'yael.cohen.1@demo-school.example', '+972-50-0100004', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('b6308d88-296e-583e-9b47-3f78b6cc7297', 'Amit Mizrahi', 'amit.mizrahi.1@demo-school.example', '+972-50-0100005', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('994c58dd-7fcf-508e-96f4-463901d65458', 'Lior Biton', 'lior.biton.1@demo-school.example', '+972-50-0100006', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('70df6d28-8cfd-54ee-96e4-62f3f07d53f0', 'Roni Friedman', 'roni.friedman.1@demo-school.example', '+972-50-0100007', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', '2026-06-22T12:00:00+00:00'),
    ('77ff71f4-9d72-5f18-8b66-a796bb8fdc54', 'Tamar Mizrahi', 'tamar.mizrahi.2@demo-school.example', '+972-50-0200001', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('10d1c45a-7dbb-5e27-8c6f-ac711b1704a8', 'Eitan Biton', 'eitan.biton.2@demo-school.example', '+972-50-0200002', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('976d844d-483f-55df-8e0c-4bdb1e27f976', 'Yael Friedman', 'yael.friedman.2@demo-school.example', '+972-50-0200003', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('36e99ce6-ad0e-5f1a-a9cb-ff4906ccf246', 'Amit Cohen', 'amit.cohen.2@demo-school.example', '+972-50-0200004', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('75e76925-2f1d-5ea2-aa54-bb204377b720', 'Lior Mizrahi', 'lior.mizrahi.2@demo-school.example', '+972-50-0200005', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('8e9e7f2c-0b20-527d-8c1d-8823b0035229', 'Roni Biton', 'roni.biton.2@demo-school.example', '+972-50-0200006', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00'),
    ('3abddaea-fa8b-58b7-a4fe-8637a6bc31ca', 'Shira Friedman', 'shira.friedman.2@demo-school.example', '+972-50-0200007', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    school_id = EXCLUDED.school_id,
    created_at = EXCLUDED.created_at;
