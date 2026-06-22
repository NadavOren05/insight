# Exam Generation Flow

## Overview

The **Generate Practice** flow creates a short practice exam for a student based on their weakest topic within a selected subject.

---

## Trigger

The flow starts when the user clicks:

**"צור תרגול קצר"**

from the **Subject Detail** screen.

The frontend sends the following request:

```http
POST /api/students/:studentId/subject/:subjectId/generate-practice
```

---

## Topic Selection Logic

The backend determines which topic should be practiced using the following priority:

### 1. Recommendation-Based Topic

The system checks whether the student has any pending practice recommendations.

If a recommendation contains a weak topic that belongs to the selected subject, that topic is chosen.

### 2. Lowest Performance Topic

If no suitable recommendation exists:

1. The student's grades for the selected subject are loaded.
2. Average grades are calculated per topic.
3. The topic with the lowest average grade is selected.

---

## Question Retrieval

After selecting a topic, the backend loads all active questions for that topic from the `questions` table.

---

## No Questions Available

If no active questions are found:

* No exam is created.
* No rows are inserted into the database.
* The API returns an error response explaining that no questions are available for the selected topic.

---

## Exam Creation

If questions are available:

### Question Selection

The backend randomly selects up to **5 questions** from the available pool.

### Database Operations

The following records are created:

#### generated_exams

A new exam record is inserted into `generated_exams`.

#### exam_questions

For each selected question, a row is inserted into `exam_questions` linking:

* Generated Exam
* Question

### Recommendation Tracking

If the practice exam was generated from a recommendation:

* The related parent action status is updated to `in_progress`.

---

## Frontend Behavior

The user remains on the current screen.

### Success Case

If the exam and related records are created successfully:

* A success notification is displayed.

### Failure Case

If any step fails:

* A failure notification is displayed.

---

## Logging

The flow emits logs using the following prefix:

```text
[exam-generation]
```

These logs are used for debugging and monitoring the generation process.

---

## Flow Diagram

```text
User clicks "צור תרגול קצר"
            │
            ▼
POST /generate-practice
            │
            ▼
Check pending recommendations
            │
      Yes ──┴── No
       │         │
       ▼         ▼
Use recommended topic
           Select lowest-grade topic
                    │
                    ▼
            Load active questions
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    No Questions         Questions Found
         │                     │
         ▼                     ▼
    Return Error       Randomly select
                       up to 5 questions
                              │
                              ▼
                    Create generated_exam
                              │
                              ▼
                    Create exam_questions
                              │
                              ▼
                 Update parent action (optional)
                              │
                              ▼
                     Return Success
```
