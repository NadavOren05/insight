-- Generated fake data for question_difficulty_levels. Regenerate with generate_fake_question_bank_data.py.
INSERT INTO question_difficulty_levels (id, code, name, description, sort_order, created_at)
VALUES
    ('2a2480b8-9781-5acf-b722-7d10d43e8700', 'easy', 'קל', 'בודק זיכרון בסיסי או מיומנות ישירה מהכיתה.', 1, '2026-06-22T12:00:00+00:00'),
    ('3328ed40-62bf-5fb9-a82f-50c64bf13ee7', 'medium', 'בינוני', 'דורש יישום של המיומנות במצב מוכר.', 2, '2026-06-22T12:00:00+00:00'),
    ('e4583409-abaf-5cb7-9aef-ad43098d82a6', 'hard', 'קשה', 'דורש הסבר, העברה או חשיבה בכמה שלבים.', 3, '2026-06-22T12:00:00+00:00')
ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    sort_order = EXCLUDED.sort_order,
    created_at = EXCLUDED.created_at;
