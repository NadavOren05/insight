# Insight Backend Requirements

## Endpoints

### POST `/api/auth/login`
- Request: `{ "identifier": "string" }`
- Response: parent ID, parent name, auth token, and the parent children list.
- The frontend expects the token to identify a 90-minute app session.
- Lookup must check both `parents.full_name` and `parents.phone`, then return children through `student_parents`.

### GET `/api/students/:studentId/overview`
- Returns the Home overview for a student.
- Response includes student metadata, AI summary, and subject summaries sorted client-side by risk.
- Each subject summary must include subject ID, display name, risk level, short human-readable summary, and missing lesson/topic hints.
- Subjects are reached through the student's `class_id` and topic-linked grades/attendance.

### GET `/api/students/:studentId/subject/:subjectId`
- Returns the Subject Detail conversation data.
- Response includes subject metadata, AI summary, topic status rows, attendance correlation data, and recent grades.
- Grades and attendance must be joined through `topic_id`; topics connect to subjects through `topics.subject_id`.

### POST `/api/generate-lesson`
- Request: `{ "studentId": "string", "topicId": "string", "difficultyLevelId"?: "string", "recommendationId"?: "string" }`
- Creates a generated exam and returns the current frontend-compatible 3-tab practice lesson:
  - `lessonExplanation`
  - `practiceQuestions`
  - `parentPedagogicalGuide`

## Data Integrity

Attendance records must be linked to `topic_id`, not only date or lesson text. Insight needs this relationship to explain whether missed lessons are correlated with weak topics. Without this link, the AI layer cannot safely say that absences may explain difficulty in a specific topic.

Required attendance fields:
- `student_id`
- `date`
- `topic_id`
- absence status or attendance status

Do not duplicate `subject_id` on `attendance` or `grades`; the subject is derived from `attendance.topic_id -> topics.subject_id` and `grades.topic_id -> topics.subject_id`.

## AI Recommendation Caching

AI recommendations should be cached for 24 hours using `generated_at`.

Use an existing `ai_recommendations` row when:
- it matches the same student, subject/topic scope, and recommendation type;
- `generated_at` is less than 24 hours old;
- source academic, grade, attendance, or topic-status data has not changed since generation.

Regenerate when:
- no recommendation exists;
- `generated_at` is older than 24 hours;
- relevant source data changed;
- the requested recommendation type or scope changed.

## Hybrid Question Generation

Practice starts as a generated exam, not a free-form lesson.

Flow:
1. Resolve the target `topic_id` and requested `difficulty_level_id` (`medium` is the default).
2. Query active rows in `questions` for the topic and difficulty.
3. Load options from `question_options`.
4. If enough questions exist, select from the DB and skip AI.
5. If inventory is insufficient, call Claude only for the missing count and require strict JSON matching the `questions` and `question_options` fields.
6. Persist generated questions with `source = 'ai_generated'` and save their options for reuse.
7. Insert `generated_exams` with `student_id`, optional `recommendation_id`, `target_topic_id`, title, and generation reason.
8. Insert selected question links into `exam_questions`.
9. If practice was launched from a recommendation, update the matching `parent_actions.status` to `in_progress`.

This keeps generated practice auditable and reusable. Claude is a fallback for inventory gaps, not the primary source every time a parent opens practice.
