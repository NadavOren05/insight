import type {
  AIAnalysisTopic,
  Attendance,
  Class,
  ExamQuestion,
  GeneratedExam,
  Grade,
  Parent,
  ParentAction,
  Question,
  QuestionDifficultyLevel,
  QuestionOption,
  QuestionType,
  Recommendation,
  School,
  Student,
  StudentAIAnalysis,
  StudentAnswer,
  StudentParent,
  Subject,
  Teacher,
  Topic,
} from '../types/database.js'

export const now = '2026-06-22T00:00:00.000Z'

export const mockSchools: School[] = [
  {
    id: 'school-insight',
    name: 'Insight Demo School',
    city: 'תל אביב',
    district: 'מרכז',
    peripheralIndex: 5,
    createdAt: now,
  },
]

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    fullName: 'מיכל כהן',
    email: 'teacher@example.com',
    phone: '050-2222222',
    schoolId: 'school-insight',
    createdAt: now,
  },
]

export const mockClasses: Class[] = [
  {
    id: 'class-7',
    schoolId: 'school-insight',
    name: 'ז׳1',
    grade: 7,
    homeroomTeacherId: 'teacher-1',
    createdAt: now,
  },
  {
    id: 'class-5',
    schoolId: 'school-insight',
    name: 'ה׳1',
    grade: 5,
    homeroomTeacherId: 'teacher-1',
    createdAt: now,
  },
  {
    id: 'class-2',
    schoolId: 'school-insight',
    name: 'ב׳1',
    grade: 2,
    homeroomTeacherId: 'teacher-1',
    createdAt: now,
  },
]

export const mockParents: Parent[] = [
  {
    id: 'parent-nadav',
    fullName: 'נדב',
    phone: '050-1111111',
    email: null,
    preferredLanguage: 'he',
    createdAt: now,
  },
  {
    id: 'parent-single',
    fullName: 'דנה',
    phone: '050-0000000',
    email: null,
    preferredLanguage: 'he',
    createdAt: now,
  },
]

export const mockStudents: Student[] = [
  { id: 'student-yonatan', fullName: 'יונתן', classId: 'class-7', createdAt: now },
  { id: 'student-noa', fullName: 'נועה', classId: 'class-5', createdAt: now },
  { id: 'student-itay', fullName: 'איתי', classId: 'class-2', createdAt: now },
]

export const mockStudentParents: StudentParent[] = [
  {
    id: 'student-parent-1',
    studentId: 'student-yonatan',
    parentId: 'parent-nadav',
    relationType: 'father',
    isPrimaryContact: true,
    createdAt: now,
  },
  {
    id: 'student-parent-2',
    studentId: 'student-noa',
    parentId: 'parent-nadav',
    relationType: 'father',
    isPrimaryContact: true,
    createdAt: now,
  },
  {
    id: 'student-parent-3',
    studentId: 'student-itay',
    parentId: 'parent-nadav',
    relationType: 'father',
    isPrimaryContact: true,
    createdAt: now,
  },
  {
    id: 'student-parent-4',
    studentId: 'student-yonatan',
    parentId: 'parent-single',
    relationType: 'mother',
    isPrimaryContact: true,
    createdAt: now,
  },
]

export const mockSubjects: Subject[] = [
  { id: 'math', name: 'מתמטיקה', classId: 'class-7', teacherId: 'teacher-1', createdAt: now },
  { id: 'english', name: 'אנגלית', classId: 'class-7', teacherId: 'teacher-1', createdAt: now },
  { id: 'science', name: 'מדעים', classId: 'class-7', teacherId: 'teacher-1', createdAt: now },
  { id: 'history', name: 'היסטוריה', classId: 'class-7', teacherId: 'teacher-1', createdAt: now },
  { id: 'language', name: 'עברית', classId: 'class-5', teacherId: 'teacher-1', createdAt: now },
  { id: 'reading', name: 'קריאה', classId: 'class-2', teacherId: 'teacher-1', createdAt: now },
]

export const mockTopics: Topic[] = [
  { id: 'fractions', subjectId: 'math', name: 'Fractions', taughtDate: '2026-05-12', createdAt: now },
  { id: 'common-denominator', subjectId: 'math', name: 'מכנה משותף', taughtDate: '2026-05-19', createdAt: now },
  { id: 'decimals', subjectId: 'math', name: 'מספרים עשרוניים', taughtDate: '2026-06-09', createdAt: now },
  { id: 'equations', subjectId: 'math', name: 'משוואות בסיסיות', taughtDate: '2026-06-16', createdAt: now },
  { id: 'vocabulary', subjectId: 'english', name: 'Vocabulary practice', taughtDate: '2026-06-06', createdAt: now },
  { id: 'ecosystems', subjectId: 'science', name: 'מערכות אקולוגיות', taughtDate: '2026-06-13', createdAt: now },
  { id: 'timeline', subjectId: 'history', name: 'רצף אירועים', taughtDate: '2026-06-10', createdAt: now },
  { id: 'reasoning', subjectId: 'language', name: 'כתיבה מנומקת', taughtDate: '2026-06-10', createdAt: now },
  { id: 'sounds', subjectId: 'reading', name: 'רצף צלילים', taughtDate: '2026-06-05', createdAt: now },
  { id: 'fluency', subjectId: 'reading', name: 'שטף קריאה', taughtDate: '2026-06-12', createdAt: now },
]

export const mockGrades: Grade[] = [
  { id: 'grade-yonatan-math-1', studentId: 'student-yonatan', topicId: 'fractions', type: 'quiz', score: 62, maxScore: 100, date: '2026-06-02', notes: null, createdAt: now },
  { id: 'grade-yonatan-math-2', studentId: 'student-yonatan', topicId: 'decimals', type: 'assignment', score: 74, maxScore: 100, date: '2026-06-09', notes: null, createdAt: now },
  { id: 'grade-yonatan-math-3', studentId: 'student-yonatan', topicId: 'equations', type: 'practice', score: 86, maxScore: 100, date: '2026-06-16', notes: null, createdAt: now },
  { id: 'grade-yonatan-english-1', studentId: 'student-yonatan', topicId: 'vocabulary', type: 'quiz', score: 76, maxScore: 100, date: '2026-06-06', notes: null, createdAt: now },
  { id: 'grade-yonatan-science-1', studentId: 'student-yonatan', topicId: 'ecosystems', type: 'assignment', score: 94, maxScore: 100, date: '2026-06-13', notes: null, createdAt: now },
  { id: 'grade-noa-language-1', studentId: 'student-noa', topicId: 'reasoning', type: 'assignment', score: 82, maxScore: 100, date: '2026-06-10', notes: null, createdAt: now },
  { id: 'grade-itay-reading-1', studentId: 'student-itay', topicId: 'sounds', type: 'quiz', score: 68, maxScore: 100, date: '2026-06-17', notes: null, createdAt: now },
]

export const mockAttendance: Attendance[] = [
  { id: 'attendance-yonatan-math-1', studentId: 'student-yonatan', topicId: 'fractions', date: '2026-05-12', status: 'absent', createdAt: now },
  { id: 'attendance-yonatan-math-2', studentId: 'student-yonatan', topicId: 'common-denominator', date: '2026-05-19', status: 'absent', createdAt: now },
  { id: 'attendance-yonatan-math-3', studentId: 'student-yonatan', topicId: 'fractions', date: '2026-05-26', status: 'absent', createdAt: now },
  { id: 'attendance-yonatan-math-4', studentId: 'student-yonatan', topicId: 'equations', date: '2026-06-02', status: 'present', createdAt: now },
  { id: 'attendance-itay-reading-1', studentId: 'student-itay', topicId: 'sounds', date: '2026-06-05', status: 'absent', createdAt: now },
  { id: 'attendance-itay-reading-2', studentId: 'student-itay', topicId: 'fluency', date: '2026-06-12', status: 'absent', createdAt: now },
]

export const mockAnalyses: StudentAIAnalysis[] = [
  {
    id: 'analysis-yonatan',
    studentId: 'student-yonatan',
    generatedAt: now,
    riskLevel: 8,
    trend: 'declining',
    attendanceFlag: true,
    parentSummary: 'יונתן מתקשה בשברים, ויש קשר בין החמצות בנושא לבין ציונים נמוכים.',
    createdAt: now,
  },
  {
    id: 'analysis-noa',
    studentId: 'student-noa',
    generatedAt: now,
    riskLevel: 2,
    trend: 'improving',
    attendanceFlag: false,
    parentSummary: 'נועה במומנטום מצוין.',
    createdAt: now,
  },
]

export const mockAnalysisTopics: AIAnalysisTopic[] = [
  { id: 'analysis-topic-1', analysisId: 'analysis-yonatan', topicId: 'fractions', type: 'gap', confidenceScore: 0.92, createdAt: now },
  { id: 'analysis-topic-2', analysisId: 'analysis-yonatan', topicId: 'fractions', type: 'attendance_correlation', confidenceScore: 0.88, createdAt: now },
  { id: 'analysis-topic-3', analysisId: 'analysis-yonatan', topicId: 'equations', type: 'strength', confidenceScore: 0.82, createdAt: now },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: 'recommendation-fractions-practice',
    analysisId: 'analysis-yonatan',
    studentId: 'student-yonatan',
    title: 'תרגול קצר בשברים',
    description: 'לתרגל זיהוי מכנה משותף ושקילות שברים.',
    recommendationType: 'practice',
    priority: 1,
    status: 'pending',
    createdAt: now,
  },
]

export const mockParentActions: ParentAction[] = [
  {
    id: 'parent-action-fractions-practice',
    studentId: 'student-yonatan',
    parentId: 'parent-nadav',
    recommendationId: 'recommendation-fractions-practice',
    actionType: 'generate_exam',
    status: 'pending',
    completedAt: null,
    parentFeedback: null,
    createdAt: now,
  },
]

export const mockDifficultyLevels: QuestionDifficultyLevel[] = [
  { id: 'difficulty-easy', code: 'easy', name: 'קל', description: 'חימום קצר', sortOrder: 1, createdAt: now },
  { id: 'difficulty-medium', code: 'medium', name: 'בינוני', description: 'תרגול סטנדרטי', sortOrder: 2, createdAt: now },
  { id: 'difficulty-hard', code: 'hard', name: 'קשה', description: 'אתגר העשרה', sortOrder: 3, createdAt: now },
]

export const mockQuestionTypes: QuestionType[] = [
  { id: 'question-type-multiple-choice', code: 'mcq', name: 'אמריקאית', description: null, createdAt: now },
]

const fractionQuestionTexts = [
  ['question-fractions-1', 'איזה שבר שווה ל-1/2?', '2/4'],
  ['question-fractions-2', 'מה המכנה המשותף הקטן ביותר של 1/3 ו-1/6?', '6'],
  ['question-fractions-3', 'כמה זה 1/4 + 1/4?', '1/2'],
  ['question-fractions-4', 'איזה שבר גדול יותר: 2/3 או 1/3?', '2/3'],
  ['question-fractions-5', 'מה התוצאה של 3/4 - 1/4?', '1/2'],
  ['question-fractions-6', 'איזה שבר שווה ל-3/6?', '1/2'],
  ['question-fractions-7', 'כמה רבעים יש בשלם אחד?', '4'],
  ['question-fractions-8', 'מהו 1/2 מתוך 10?', '5'],
  ['question-fractions-9', 'איזה שבר קטן יותר: 1/5 או 1/2?', '1/5'],
  ['question-fractions-10', 'מה המכנה המשותף של 1/4 ו-1/8?', '8'],
] as const

export const mockQuestions: Question[] = fractionQuestionTexts.map(([id, text, answer], index) => ({
  id,
  topicId: 'fractions',
  difficultyLevelId:
    index < 3 ? 'difficulty-easy' : index < 8 ? 'difficulty-medium' : 'difficulty-hard',
  questionTypeId: 'question-type-multiple-choice',
  questionText: text,
  correctAnswer: answer,
  metadataJson: { skill: 'fractions' },
  source: 'human_created',
  isActive: true,
  createdAt: now,
}))

export const mockQuestionOptions: QuestionOption[] = mockQuestions.flatMap((question, index) => {
  const correct = question.correctAnswer ?? ''
  const distractors = ['1/3', '3/4', '2/5'].filter((value) => value !== correct).slice(0, 3)
  const options = [correct, ...distractors]

  return options.map((optionText, optionIndex) => ({
    id: `option-${index + 1}-${optionIndex + 1}`,
    questionId: question.id,
    optionText,
    isCorrect: optionText === correct,
    sortOrder: optionIndex + 1,
    createdAt: now,
  }))
})

export const mockGeneratedExams: GeneratedExam[] = []

export const mockExamQuestions: ExamQuestion[] = []

export const mockStudentAnswers: StudentAnswer[] = []
