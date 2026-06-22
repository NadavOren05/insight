# Data Model

Core hierarchy:

School
└── Class
└── Student
├── Subjects
├── Assessments
├── Attendance
└── AI Analysis

Main entities:

## classes

Represents a classroom.

## students

Represents a student.

## subjects

Represents a subject taught to a class.

## assessments

Stores grades, exams and evaluations.

## attendance

Stores attendance information.

## ai_analysis

Stores AI-generated educational insights.

## ai_analysis_topics

Stores individual findings produced by the AI.

Examples:

* Reading comprehension gap
* Declining math performance
* Attendance concerns
* Strong academic improvement

All AI outputs should remain traceable to supporting data.
