# Data Model

This document describes the updated EDTECH database model.

The goal of the data model is to store structured educational data that can later support AI-based insights, recommendations, and parent-facing explanations.

The model is designed around three layers:

1. **Data Layer** – schools, classes, students, parents, subjects, topics, grades and attendance.
2. **AI Analysis Layer** – AI-generated analysis per student.
3. **Impact Layer** – recommendations and parent actions used to measure whether the recommendations helped.

---

## Core Hierarchy

```text
School
├── Teachers
├── Classes
│   ├── Students
│   │   ├── Parents through student_parents
│   │   ├── Grades
│   │   ├── Attendance
│   │   ├── Student AI Analysis
│   │   │   ├── AI Analysis Topics
│   │   │   └── Recommendations
│   │   └── Parent Actions
│   └── Subjects
│       └── Topics
```

---

# Tables

## schools

Represents a school.

Attributes:

```text
id uuid PK
name text
city text
district text
peripheral_index int
created_at timestamp
```

---

## teachers

Represents a teacher in a school.

Attributes:

```text
id uuid PK
full_name text
email text
phone text
school_id uuid FK -> schools.id
created_at timestamp
```

---

## classes

Represents a classroom or homeroom class.

Attributes:

```text
id uuid PK
school_id uuid FK -> schools.id
name text
grade int
homeroom_teacher_id uuid FK -> teachers.id
created_at timestamp
```

---

## students

Represents a student.

Attributes:

```text
id uuid PK
full_name text
class_id uuid FK -> classes.id
created_at timestamp
```

---

## parents

Represents a parent or guardian.

Attributes:

```text
id uuid PK
full_name text
phone text
email text
preferred_language text
created_at timestamp
```

---

## student_parents

Join table between students and parents.

This supports:

* One parent with multiple children.
* One student with multiple parents.
* Marking the primary contact parent.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
parent_id uuid FK -> parents.id
relation_type text
is_primary_contact boolean
created_at timestamp
```

---

## subjects

Represents a subject taught to a specific class.

Examples:

* Math
* Hebrew
* English

Attributes:

```text
id uuid PK
name text
class_id uuid FK -> classes.id
teacher_id uuid FK -> teachers.id
created_at timestamp
```

---

## topics

Represents a specific learning topic inside a subject.

Examples:

* Fractions
* Reading comprehension
* Geometry
* Vocabulary

Attributes:

```text
id uuid PK
subject_id uuid FK -> subjects.id
name text
taught_date date
created_at timestamp
```

---

## grades

Stores grades, exams, quizzes and evaluations for a student in a specific topic.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
topic_id uuid FK -> topics.id
type enum grade_type
score int
max_score int
date date
notes text
created_at timestamp
```

Supported `grade_type` values:

```text
quiz
homework
exam
project
participation
```

---

## attendance

Stores attendance information for a student in a specific topic lesson/date.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
topic_id uuid FK -> topics.id
date date
status enum attendance_status
created_at timestamp
```

Supported `attendance_status` values:

```text
present
absent
late
excused
```

---

## student_ai_analysis

Stores AI-generated educational analysis for a student.

This table represents the general AI summary, risk level and learning trend.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
generated_at timestamp
risk_level int
trend text
attendance_flag boolean
parent_summary text
created_at timestamp
```

Examples of `trend`:

```text
improving
declining
stable
mixed
```

---

## ai_analysis_topics

Stores topic-level findings produced by the AI.

Instead of storing weak topics as plain text arrays, this table connects every AI analysis to real topics from the `topics` table.

Attributes:

```text
id uuid PK
analysis_id uuid FK -> student_ai_analysis.id
topic_id uuid FK -> topics.id
type enum topic_analysis_type
confidence_score numeric
created_at timestamp
```

Supported `topic_analysis_type` values:

```text
weak
strong
improving
missed
```

Examples:

```text
Fractions -> weak -> 0.92
Geometry -> strong -> 0.87
Reading comprehension -> improving -> 0.76
Vocabulary -> missed -> 0.81
```

---

## recommendations

Stores recommendations generated from an AI analysis.

This table answers the question: what should the parent or teacher do next?

Attributes:

```text
id uuid PK
analysis_id uuid FK -> student_ai_analysis.id
student_id uuid FK -> students.id
title text
description text
recommendation_type text
priority int
status enum recommendation_status
created_at timestamp
```

Supported `recommendation_status` values:

```text
pending
completed
dismissed
```

Examples of recommendations:

* Practice fractions for 10 minutes a day.
* Review missed reading comprehension lesson.
* Contact the teacher about repeated absences.
* Encourage the student due to strong improvement.

---

## parent_actions

Stores actions taken by parents after receiving recommendations.

This table helps measure whether recommendations were actually followed and whether they improved the student’s learning outcomes.

Attributes:

```text
id uuid PK
student_id uuid FK -> students.id
parent_id uuid FK -> parents.id
recommendation_id uuid FK -> recommendations.id
action_type text
status enum recommendation_status
completed_at timestamp
parent_feedback text
created_at timestamp
```

Examples of `action_type`:

```text
practiced_at_home
contacted_teacher
watched_video
completed_homework
dismissed
```

---

# AI Traceability Principle

All AI outputs should remain traceable to supporting data.

For example:

```text
student_ai_analysis
-> ai_analysis_topics
-> topics
-> grades / attendance
```

This allows the system to explain why a recommendation was generated.

Example:

```text
The AI identified "Fractions" as a weak topic because:
1. The student scored 55/100 in a fractions quiz.
2. The student was absent from two lessons related to fractions.
3. The recent trend in math grades is declining.
```

---

# Why This Model Supports AI

The model supports two types of AI:

## Classic AI

Useful for deterministic rules and decision trees.

Examples:

* Low score in a topic.
* Declining trend across recent grades.
* Multiple absences in the same topic.
* High risk level based on repeated weak performance.

## LLM-Based AI

Useful for turning structured data into clear explanations for parents.

Example output:

```text
Your child is currently struggling mainly with fractions.
This may be related to two missed lessons on the same topic.
We recommend practicing fractions for 10 minutes a day this week.
```

---

# Design Rationale

The database does not only store grades.

It stores:

* Which student learned what topic.
* How the student performed in that topic.
* Whether the student attended the lesson.
* What the AI concluded.
* What recommendation was generated.
* Whether the parent acted on the recommendation.

This creates a full loop:

```text
Learning Data
-> AI Insight
-> Recommendation
-> Parent Action
-> Measurable Impact
```
