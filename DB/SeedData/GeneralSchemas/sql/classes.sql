-- Generated fake data for classes. Regenerate with generate_fake_data.py.
INSERT INTO classes (id, school_id, name, grade, homeroom_teacher_id, created_at)
VALUES
    ('d987dbcd-852e-543d-9286-60adce925c6a', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', 'כיתה ד-11', 4, '1361c70b-f632-5c31-b999-99c44b56aefe', '2026-06-22T12:00:00+00:00'),
    ('9b303e82-2cab-5e9b-83cc-68aba452038f', '15a481bc-f333-5ba1-9ddf-f5baf1957b7a', 'כיתה ה-12', 5, '684db7b1-ec37-5543-82bd-9fd47a3b8b2f', '2026-06-22T12:00:00+00:00'),
    ('9d0ff510-7585-517e-9b87-e96e20f16b22', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', 'כיתה ד-21', 4, '77ff71f4-9d72-5f18-8b66-a796bb8fdc54', '2026-06-22T12:00:00+00:00'),
    ('0385f72a-a7ae-5881-a3e4-34e5dea387a2', '23e1eb6e-ebb8-55fb-9d94-1ae601947003', 'כיתה ה-22', 5, '10d1c45a-7dbb-5e27-8c6f-ac711b1704a8', '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    school_id = EXCLUDED.school_id,
    name = EXCLUDED.name,
    grade = EXCLUDED.grade,
    homeroom_teacher_id = EXCLUDED.homeroom_teacher_id,
    created_at = EXCLUDED.created_at;
