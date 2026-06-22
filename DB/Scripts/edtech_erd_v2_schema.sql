CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ENUMS

CREATE TYPE grade_type AS ENUM (
    'quiz',
    'homework',
    'exam',
    'project',
    'participation'
);

CREATE TYPE attendance_status AS ENUM (
    'present',
    'absent',
    'late',
    'excused'
);

CREATE TYPE topic_analysis_type AS ENUM (
    'weak',
    'strong',
    'improving',
    'missed'
);

CREATE TYPE recommendation_status AS ENUM (
    'pending',
    'completed',
    'dismissed'
);

-- SCHOOLS

CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT,
    district TEXT,
    peripheral_index INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TEACHERS

CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CLASSES

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL,
    homeroom_teacher_id UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- STUDENTS

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PARENTS

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    preferred_language TEXT DEFAULT 'he',
    created_at TIMESTAMP DEFAULT NOW()
);

-- STUDENT_PARENTS

CREATE TABLE student_parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    relation_type TEXT,
    is_primary_contact BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(student_id, parent_id)
);

-- SUBJECTS

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- TOPICS

CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    taught_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- GRADES

CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

    type grade_type NOT NULL,

    score INTEGER NOT NULL CHECK (score >= 0),
    max_score INTEGER NOT NULL CHECK (max_score > 0),
    date DATE NOT NULL,
    notes TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    CHECK (score <= max_score)
);

-- ATTENDANCE

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

    date DATE NOT NULL,
    status attendance_status NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(student_id, topic_id, date)
);

-- STUDENT AI ANALYSIS

CREATE TABLE student_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

    generated_at TIMESTAMP DEFAULT NOW(),

    risk_level INTEGER CHECK (risk_level BETWEEN 1 AND 10),

    trend TEXT,

    attendance_flag BOOLEAN DEFAULT FALSE,

    parent_summary TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- AI ANALYSIS TOPICS

CREATE TABLE ai_analysis_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES student_ai_analysis(id)
        ON DELETE CASCADE,

    topic_id UUID NOT NULL
        REFERENCES topics(id)
        ON DELETE CASCADE,

    type topic_analysis_type NOT NULL,

    confidence_score NUMERIC(4,3)
        CHECK (
            confidence_score >= 0
            AND confidence_score <= 1
        ),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(analysis_id, topic_id, type)
);

-- RECOMMENDATIONS

CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL
        REFERENCES student_ai_analysis(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL
        REFERENCES students(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT NOT NULL,

    recommendation_type TEXT,

    priority INTEGER DEFAULT 3
        CHECK (priority BETWEEN 1 AND 5),

    status recommendation_status DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW()
);

-- PARENT ACTIONS

CREATE TABLE parent_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL
        REFERENCES students(id)
        ON DELETE CASCADE,

    parent_id UUID
        REFERENCES parents(id)
        ON DELETE SET NULL,

    recommendation_id UUID NOT NULL
        REFERENCES recommendations(id)
        ON DELETE CASCADE,

    action_type TEXT,

    status recommendation_status DEFAULT 'pending',

    completed_at TIMESTAMP,

    parent_feedback TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES

CREATE INDEX idx_students_class
ON students(class_id);

CREATE INDEX idx_student_parents_student
ON student_parents(student_id);

CREATE INDEX idx_student_parents_parent
ON student_parents(parent_id);

CREATE INDEX idx_topics_subject
ON topics(subject_id);

CREATE INDEX idx_grades_student
ON grades(student_id);

CREATE INDEX idx_grades_topic
ON grades(topic_id);

CREATE INDEX idx_attendance_student
ON attendance(student_id);

CREATE INDEX idx_attendance_topic
ON attendance(topic_id);

CREATE INDEX idx_ai_student
ON student_ai_analysis(student_id);

CREATE INDEX idx_ai_analysis_topics_analysis
ON ai_analysis_topics(analysis_id);

CREATE INDEX idx_ai_analysis_topics_topic
ON ai_analysis_topics(topic_id);

CREATE INDEX idx_recommendation_student
ON recommendations(student_id);

CREATE INDEX idx_parent_actions_student
ON parent_actions(student_id);

CREATE INDEX idx_parent_actions_parent
ON parent_actions(parent_id);