# Insight Backend Requirements

## Endpoints

### POST `/auth/login`
- Request: `{ "identifier": "string" }`
- Response: parent ID, parent name, auth token, and the parent children list.
- The frontend expects the token to identify a 90-minute app session.

### GET `/students/:studentId/overview`
- Returns the Home overview for a student.
- Response includes student metadata, AI summary, and subject summaries sorted client-side by risk.
- Each subject summary must include subject ID, display name, risk level, short human-readable summary, and missing lesson/topic hints.

### GET `/students/:studentId/subjects/:subjectId`
- Returns the Subject Detail conversation data.
- Response includes subject metadata, AI summary, topic status rows, attendance correlation data, and recent grades.
- Grades must include score and class average so the client can color score pills by gap.

### POST `/students/:studentId/practice`
- Request: `{ "topicId": "string" }`
- Returns a generated 3-tab practice lesson:
  - `lessonExplanation`
  - `practiceQuestions`
  - `parentPedagogicalGuide`

## Data Integrity

Attendance records must be linked to `topic_id`, not only date or lesson text. Insight needs this relationship to explain whether missed lessons are correlated with weak topics. Without this link, the AI layer cannot safely say that absences may explain difficulty in a specific topic.

Required attendance fields:
- `student_id`
- `date`
- `topic_id`
- `subject_id`
- absence status or attendance status

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
