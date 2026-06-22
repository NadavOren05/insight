-- Generated fake data for generated_exams. Regenerate with generate_fake_question_bank_data.py.
INSERT INTO generated_exams (id, student_id, recommendation_id, target_topic_id, title, generation_reason, status, created_at, completed_at)
VALUES
    ('326c8992-7af5-5a51-b722-c2e7d471d89d', 'e69c95f0-1366-52c5-ba1d-87b0479b93d7', '023e8a80-851e-5c06-ad8b-921be9c220c9', 'b3f4ed34-8079-5086-994e-d97ecdb5c328', 'Fractions Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'in_progress', '2026-06-24T12:00:00+00:00', NULL),
    ('d50db501-566c-5a52-90f7-e61cb0fb8c84', '535eda10-6732-54c5-bd6d-740c8844e57f', '49a3aa5b-33ec-57d5-bb39-e50a04ede21d', 'c1bbf5dc-d811-509f-874f-e9e41a3f8962', 'Geometry Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('f1c2c7b0-b5d9-5679-8e9d-e8d6badb98c7', '1c08777d-ea13-55ff-b64e-2d2bb2ef4fda', '20b969da-8034-5fd9-8d17-74e6a43220fc', 'faca4653-ed63-552f-a9b2-20760cbf2d80', 'Word problems Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('9a1923df-ab9a-5720-8fc2-70fcbd3a6a8c', 'e3f080bc-9570-5682-8c99-ab238247b5fc', '5d676bd9-8a54-5b03-9397-2115b13bbbfe', 'dfb71247-0ffa-569c-965c-9ff56159c7d1', 'Reading comprehension Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'generated', '2026-06-24T12:00:00+00:00', NULL),
    ('f35a6f85-63cf-5c48-9b4f-cb5883f1f358', 'cc40401d-b8fe-5e22-bdf2-80fe040e480c', 'fc93e572-7a10-5879-aea5-aa112cd17bb0', 'f1c8133d-6edd-51bc-b8ff-160794a47735', 'Writing structure Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'in_progress', '2026-06-24T12:00:00+00:00', NULL),
    ('a3721c06-109f-52fc-b06d-4d9abf44948c', '70939d89-d902-513c-87d8-10540dadcf88', 'f03fdaf9-e957-5666-ab62-0defa8d446f0', '2e6b1c5b-ff6c-5ab7-9b6f-b371a6ad958a', 'Vocabulary Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('3aaec212-2b73-523f-add4-ae2b83096082', '2cc53407-b1da-5b5f-bb14-77fdc418cc59', '65556de5-cef9-54a3-a4ed-256630c02760', '762f6caf-f12c-56d0-b0d9-8318628a1e35', 'Vocabulary Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('002af13a-efea-50f6-9c93-e12bf20f5a12', 'c722e870-4f15-5916-8550-42954d04a349', '8b376883-8f9a-5e82-9639-6c50b5b9d903', '52f17841-e18a-538f-bfa9-b87a228c562c', 'Grammar Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'generated', '2026-06-24T12:00:00+00:00', NULL),
    ('49ce5ad8-12e1-5c5b-92fc-8ae8c2398dab', '16797408-f16f-5c38-8a42-16c5a222b739', '10d2ad0b-9592-5a31-956a-50d768065afd', '99f54ca6-10ff-5146-9702-cd0db1776845', 'Short reading Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'in_progress', '2026-06-24T12:00:00+00:00', NULL),
    ('cae1b9aa-9e95-54ff-8c19-c735eaf5b5bc', '7cdb9969-257d-5a8b-b334-9e6cd1df0a9b', '5e434d63-5044-5c30-ad22-45fe3ba84b23', 'eef7167c-f87a-59d0-bb1e-82dc5473bef3', 'Fractions Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('1417bfcb-f7ca-5810-ac5d-86462dd47275', '722adce2-2e9c-5d52-9824-a4ad994629a0', '0ddfd4c7-0ce0-57cb-b1a0-6c89cb7daf15', '1315c5fd-5d36-50df-b379-5584de015091', 'Geometry Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'completed', '2026-06-24T12:00:00+00:00', '2026-06-26T12:00:00+00:00'),
    ('156b6e7a-2ef8-522f-a31d-7cf9cd3b3a3b', 'b0ad67ec-028e-54c3-ad99-33f6c2e3950b', 'e7e51f42-d51a-5218-a227-68a49a9f3834', '57aced98-bcdc-5b38-9a40-531b8d76f6a1', 'Word problems Practice Assessment', 'Generated from recent learning data and parent-facing recommendations.', 'generated', '2026-06-24T12:00:00+00:00', NULL)
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    recommendation_id = EXCLUDED.recommendation_id,
    target_topic_id = EXCLUDED.target_topic_id,
    title = EXCLUDED.title,
    generation_reason = EXCLUDED.generation_reason,
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    completed_at = EXCLUDED.completed_at;
