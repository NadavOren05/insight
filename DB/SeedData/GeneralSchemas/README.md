# Fake seed data

This folder contains deterministic fake data for the EDTECH schema.

## Files

- `generate_fake_data.py` creates one CSV and one SQL insert file per table.
- `load_fake_data_to_supabase.py` loads the generated CSV files into Supabase through the REST API.
- `csv/` contains generated table data.
- `sql/` contains generated per-table SQL insert scripts.

## Generate data

```powershell
python DB\SeedData\generate_fake_data.py
```

Optional sizing:

```powershell
python DB\SeedData\generate_fake_data.py --schools 2 --classes-per-school 3 --students-per-class 8
```

## Load into Supabase

Use a service role key for seed imports, because row-level security may block normal anon-key inserts.

```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
python DB\SeedData\load_fake_data_to_supabase.py
```

The loader uses upsert by primary key by default, so rerunning it updates the deterministic fake rows instead of duplicating them.

To force plain inserts:

```powershell
python DB\SeedData\load_fake_data_to_supabase.py --mode insert
```

## Import order

Tables are generated and loaded in foreign-key order:

1. `schools`
2. `teachers`
3. `classes`
4. `students`
5. `parents`
6. `student_parents`
7. `subjects`
8. `topics`
9. `grades`
10. `attendance`
11. `student_ai_analysis`
12. `ai_analysis_topics`
13. `recommendations`
14. `parent_actions`
