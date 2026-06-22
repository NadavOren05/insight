-- Generated fake data for subjects. Regenerate with generate_fake_data.py.
INSERT INTO subjects (id, name, class_id, teacher_id, created_at)
VALUES
    ('c37f63b6-e0e0-56cf-9338-2369a2600b83', 'Math', 'd987dbcd-852e-543d-9286-60adce925c6a', '595a9f52-b286-565c-901d-a9343ff62956', '2026-06-22T12:00:00+00:00'),
    ('19f9382c-c3e6-5c61-8e0b-e42a53ba49ed', 'Hebrew', 'd987dbcd-852e-543d-9286-60adce925c6a', 'c28b0abb-1744-5fc4-b039-f11dfa5118de', '2026-06-22T12:00:00+00:00'),
    ('d8815ba0-649a-5bb6-9b62-3b7bd1d0e638', 'English', 'd987dbcd-852e-543d-9286-60adce925c6a', 'b6308d88-296e-583e-9b47-3f78b6cc7297', '2026-06-22T12:00:00+00:00'),
    ('d2b215ea-c319-5dbf-96d4-8b9754683c2a', 'Math', '9b303e82-2cab-5e9b-83cc-68aba452038f', 'c28b0abb-1744-5fc4-b039-f11dfa5118de', '2026-06-22T12:00:00+00:00'),
    ('85154353-28a2-55bc-a272-63eb4efbbd92', 'Hebrew', '9b303e82-2cab-5e9b-83cc-68aba452038f', 'b6308d88-296e-583e-9b47-3f78b6cc7297', '2026-06-22T12:00:00+00:00'),
    ('6abf1e4d-17c6-512d-8860-d42c1d28cf55', 'English', '9b303e82-2cab-5e9b-83cc-68aba452038f', '994c58dd-7fcf-508e-96f4-463901d65458', '2026-06-22T12:00:00+00:00'),
    ('06034aef-43a8-5f21-8e49-0a154a329960', 'Math', '9d0ff510-7585-517e-9b87-e96e20f16b22', '976d844d-483f-55df-8e0c-4bdb1e27f976', '2026-06-22T12:00:00+00:00'),
    ('54ee5495-062b-5ba2-9fb3-39d726b1c2e6', 'Hebrew', '9d0ff510-7585-517e-9b87-e96e20f16b22', '36e99ce6-ad0e-5f1a-a9cb-ff4906ccf246', '2026-06-22T12:00:00+00:00'),
    ('26e1e861-2a70-5a05-bf7d-7a5498c574e3', 'English', '9d0ff510-7585-517e-9b87-e96e20f16b22', '75e76925-2f1d-5ea2-aa54-bb204377b720', '2026-06-22T12:00:00+00:00'),
    ('f42095c7-7e99-5577-b1e8-859ff5696129', 'Math', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '36e99ce6-ad0e-5f1a-a9cb-ff4906ccf246', '2026-06-22T12:00:00+00:00'),
    ('37bd9b8d-bfd1-54d1-8066-09826199e78f', 'Hebrew', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '75e76925-2f1d-5ea2-aa54-bb204377b720', '2026-06-22T12:00:00+00:00'),
    ('b60174c4-e955-5532-9d98-85a34a90fa5f', 'English', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '8e9e7f2c-0b20-527d-8c1d-8823b0035229', '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    class_id = EXCLUDED.class_id,
    teacher_id = EXCLUDED.teacher_id,
    created_at = EXCLUDED.created_at;
