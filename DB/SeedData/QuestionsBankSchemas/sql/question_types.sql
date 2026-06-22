-- Generated fake data for question_types. Regenerate with generate_fake_question_bank_data.py.
INSERT INTO question_types (id, code, name, description, created_at)
VALUES
    ('686f9664-3bff-5a10-af34-06391408d1da', 'mcq', 'רב ברירה', 'התלמיד/ה בוחר/ת תשובה אחת מתוך כמה אפשרויות.', '2026-06-22T12:00:00+00:00'),
    ('784e7999-826a-5bad-a92e-2963159fa1ab', 'open_answer', 'תשובה פתוחה', 'התלמיד/ה כותב/ת תשובה קצרה בטקסט חופשי.', '2026-06-22T12:00:00+00:00'),
    ('dc34faa7-ca45-535b-a53b-b71512a2cfc8', 'true_false', 'נכון או לא נכון', 'התלמיד/ה מחליט/ה אם הטענה נכונה או לא נכונה.', '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    created_at = EXCLUDED.created_at;
