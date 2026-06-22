# Question bank seed data

This folder contains deterministic fake data for the EDTECH Question Bank and Personalized Assessment schema.

The generator depends on existing general seed CSVs from:

```text
DB/SeedData/GeneralSchemas/csv
```

Those CSVs provide valid `students`, `topics`, `subjects`, and `recommendations` foreign keys.

## Files

- `generate_fake_question_bank_data.py` creates one CSV and one SQL insert file per question-bank table.
- `load_question_bank_data_to_supabase.py` loads generated CSV files into Supabase through the REST API.
- `csv/` contains generated table data.
- `sql/` contains generated per-table SQL upsert scripts.

## Generate data

```powershell
python DB\SeedData\QuestionsBankSchemas\generate_fake_question_bank_data.py
```

Optional sizing:

```powershell
python DB\SeedData\QuestionsBankSchemas\generate_fake_question_bank_data.py --questions-per-topic 3 --exam-count 12
```

## Load into Supabase

Load the general schema seed data first, then load this question-bank data.

Use a service role key for seed imports, because row-level security may block normal anon-key inserts.

```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
python DB\SeedData\QuestionsBankSchemas\load_question_bank_data_to_supabase.py
```

The loader uses upsert by primary key by default, so rerunning it updates deterministic fake rows instead of duplicating them.

To force plain inserts:

```powershell
python DB\SeedData\QuestionsBankSchemas\load_question_bank_data_to_supabase.py --mode insert
```

## Import order

Tables are generated and loaded in foreign-key order:

1. `question_difficulty_levels`
2. `question_types`
3. `questions`
4. `question_options`
5. `generated_exams`
6. `exam_questions`
7. `student_answers`
