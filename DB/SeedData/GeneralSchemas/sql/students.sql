-- Generated fake data for students. Regenerate with generate_fake_data.py.
INSERT INTO students (id, full_name, class_id, created_at)
VALUES
    ('e69c95f0-1366-52c5-ba1d-87b0479b93d7', 'Daniel Mizrahi', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('535eda10-6732-54c5-bd6d-740c8844e57f', 'Tamar Peretz', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('1c08777d-ea13-55ff-b64e-2d2bb2ef4fda', 'Eitan Biton', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('e3f080bc-9570-5682-8c99-ab238247b5fc', 'Yael Avraham', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('cc40401d-b8fe-5e22-bdf2-80fe040e480c', 'Amit Friedman', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('70939d89-d902-513c-87d8-10540dadcf88', 'Lior Azoulay', 'd987dbcd-852e-543d-9286-60adce925c6a', '2026-06-22T12:00:00+00:00'),
    ('2cc53407-b1da-5b5f-bb14-77fdc418cc59', 'Tamar Mizrahi', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('c722e870-4f15-5916-8550-42954d04a349', 'Eitan Peretz', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('16797408-f16f-5c38-8a42-16c5a222b739', 'Yael Biton', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('7cdb9969-257d-5a8b-b334-9e6cd1df0a9b', 'Amit Avraham', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('722adce2-2e9c-5d52-9824-a4ad994629a0', 'Lior Friedman', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('b0ad67ec-028e-54c3-ad99-33f6c2e3950b', 'Roni Azoulay', '9b303e82-2cab-5e9b-83cc-68aba452038f', '2026-06-22T12:00:00+00:00'),
    ('19d3112c-1827-56db-878c-f2a5ab109fef', 'Daniel Peretz', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('e31ee047-9fcf-5191-85c8-a327759b9117', 'Tamar Biton', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('297ed6d5-1739-5b3f-865b-157e64c6aa72', 'Eitan Avraham', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('9742c1bd-f947-595c-8a76-6d2d6bb4f8ae', 'Yael Friedman', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('715acd9a-f33f-56bf-bb7f-e062a50e49c2', 'Amit Azoulay', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('93a5c18f-9a69-56ce-bdf0-11b05275cb5b', 'Lior Cohen', '9d0ff510-7585-517e-9b87-e96e20f16b22', '2026-06-22T12:00:00+00:00'),
    ('66b9fb96-5772-5b8f-8365-7854f1500c39', 'Tamar Peretz', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00'),
    ('e2e7b829-fe3b-5e74-ad87-ea812f8c5679', 'Eitan Biton', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00'),
    ('7c25047c-155f-540e-8994-b5e7827781a6', 'Yael Avraham', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00'),
    ('12be05b1-6fbc-51d8-8d10-5f0e3a3819b2', 'Amit Friedman', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00'),
    ('16205a9f-52f9-58c0-b223-913ad167914e', 'Lior Azoulay', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00'),
    ('a387b82e-831a-5dfb-b759-3aab1d31f5aa', 'Roni Cohen', '0385f72a-a7ae-5881-a3e4-34e5dea387a2', '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    class_id = EXCLUDED.class_id,
    created_at = EXCLUDED.created_at;
