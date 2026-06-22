# Question Bank Model

This document describes the EDTECH Question Bank and Personalized Assessment module.

The purpose of this module is to provide the data foundation for storing educational questions, generating personalized assessments, tracking student answers, and supporting future recommendation and AI-driven learning workflows.

This module extends the core educational data model and integrates with existing entities such as students, topics and recommendations.

---

# Module Goals

The module is designed to support:

* Centralized question management.
* Reusable question banks.
* Personalized exam generation.
* Student answer tracking.
* Learning outcome measurement.
* Future AI-driven question selection and generation.

The module itself does not perform AI analysis.

Instead, it provides the structured data required for future recommendation engines and adaptive learning capabilities.

---

# Integration with Existing Model

The module connects to the following existing entities:

```text
students
topics
recommendations
```

Relationship overview:

```text
Topic
    ↓
Questions
    ↓
Generated Exams
    ↓
Student Answers
```

Future workflow:

```text
Learning Data
→ Recommendation
→ Generated Exam
→ Student Answers
→ Learning Outcome
```

---

# Core Hierarchy

```text
Topic
├── Questions
│   ├── Difficulty Level
│   └── Question Type
│
└── Generated Exams
    ├── Exam Questions
    └── Student Answers
```

---

# Tables

## question_difficulty_levels

Stores standardized difficulty levels.

Examples:

* Easy
* Medium
* Hard

Attributes:

```text
id uuid PK
code text
name text
description text
sort_order int
created_at timestamp
```

Purpose:

Provides consistent difficulty classification across all questions.

---

## question_types

Defines how a question should be presented.

Examples:

* open_answer
* mcq
* true_false

Attributes:

```text
id uuid PK
code text
name text
description text
created_at timestamp
```

Purpose:

Allows different question formats while keeping a consistent question structure.

---

## questions

Central repository of educational questions.

Every question belongs to a specific topic and is associated with a difficulty level and question type.

Attributes:

```text
id uuid PK
topic_id uuid FK -> topics.id
difficulty_level_id uuid FK -> question_difficulty_levels.id
question_type_id uuid FK -> question_types.id
question_text text
correct_answer text
metadata_json jsonb
source enum question_source
is_active boolean
created_at timestamp
```

Supported question_source values:

```text
human_created
ai_generated
imported
```

Examples:

```text
7 × 8 = ?
```

```text
What is the next number in the sequence:
2, 4, 6, 8, ?
```

Purpose:

Acts as the primary educational content repository.

---

## question_options

Stores answer options for multiple-choice questions.

Attributes:

```text
id uuid PK
question_id uuid FK -> questions.id
option_text text
is_correct boolean
sort_order int
created_at timestamp
```

Purpose:

Supports MCQ questions without affecting open-answer questions.

Example:

```text
Question:
7 × 8 = ?

Options:
48
54
56
63
```

---

## generated_exams

Represents a personalized assessment generated for a student.

An exam may optionally be linked to a recommendation.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
recommendation_id uuid FK -> recommendations.id
target_topic_id uuid FK -> topics.id
title text
generation_reason text
status enum exam_status
created_at timestamp
completed_at timestamp
```

Supported exam_status values:

```text
generated
in_progress
completed
cancelled
```

Examples:

```text
Multiplication Practice Assessment
Fractions Reinforcement Quiz
Sequences Diagnostic Test
```

Purpose:

Stores generated learning interventions assigned to students.

---

## exam_questions

Join table connecting exams and questions.

Attributes:

```text
id uuid PK
exam_id uuid FK -> generated_exams.id
question_id uuid FK -> questions.id
sort_order int
points int
created_at timestamp
```

Purpose:

Allows questions to be reused across multiple exams.

---

## student_answers

Stores student responses for exam questions.

Attributes:

```text
id uuid PK
exam_question_id uuid FK -> exam_questions.id
student_id uuid FK -> students.id
answer_text text
selected_option_id uuid FK -> question_options.id
is_correct boolean
score int
answered_at timestamp
created_at timestamp
```

Purpose:

Tracks assessment results and learning outcomes.

Examples:

```text
Question:
7 × 8

Answer:
56

Correct:
true
```

---

# Design Rationale

The question module was designed around content reuse and future scalability.

Instead of creating dedicated questions for every exam, questions are stored once and reused across multiple assessments.

The model separates:

* Educational content (questions)
* Assessment instances (generated exams)
* Student responses (student answers)

This separation provides flexibility for future personalization and analytics.

---

# Future AI Readiness

The model was intentionally designed to support future AI capabilities.

Possible future use cases include:

* Personalized question selection.
* Adaptive difficulty adjustment.
* Automatic assessment generation.
* AI-generated questions.
* Recommendation-driven learning paths.

The database schema does not implement these capabilities directly.

Instead, it provides the structured foundation required to build them in future iterations.
