CREATE TYPE question_source AS ENUM (
  'human_created',
  'ai_generated',
  'imported'
);

CREATE TYPE exam_status AS ENUM (
  'generated',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TABLE question_difficulty_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE question_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  difficulty_level_id uuid NOT NULL REFERENCES question_difficulty_levels(id),
  question_type_id uuid NOT NULL REFERENCES question_types(id),
  question_text text NOT NULL,
  correct_answer text,
  metadata_json jsonb,
  source question_source NOT NULL DEFAULT 'human_created',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE generated_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES recommendations(id) ON DELETE SET NULL,
  target_topic_id uuid REFERENCES topics(id) ON DELETE SET NULL,
  title text NOT NULL,
  generation_reason text,
  status exam_status NOT NULL DEFAULT 'generated',
  created_at timestamp DEFAULT now(),
  completed_at timestamp
);

CREATE TABLE exam_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES generated_exams(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id),
  sort_order int NOT NULL,
  points int NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT now(),
  UNIQUE (exam_id, question_id)
);

CREATE TABLE student_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_question_id uuid NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  answer_text text,
  selected_option_id uuid REFERENCES question_options(id) ON DELETE SET NULL,
  is_correct boolean,
  score int,
  answered_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);