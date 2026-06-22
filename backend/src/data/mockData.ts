import type {
  AIAnalysisTopic,
  Attendance,
  Grade,
  Parent,
  School,
  Student,
  StudentAIAnalysis,
  StudentParent,
  Subject,
  Teacher,
  Topic,
} from '../types/database.js'

const now = '2026-06-22T00:00:00.000Z'

export const mockSchools: School[] = [
  {
    id: 'school-insight',
    name: 'Insight Demo School',
    city: 'תל אביב',
    createdAt: now,
  },
]

export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    schoolId: 'school-insight',
    fullName: 'מיכל כהן',
    email: 'teacher@example.com',
    createdAt: now,
  },
]

export const mockClasses = [
  {
    id: 'class-7',
    schoolId: 'school-insight',
    teacherId: 'teacher-1',
    name: 'ז׳1',
    gradeLevel: 'כיתה ז׳',
    createdAt: now,
  },
  {
    id: 'class-5',
    schoolId: 'school-insight',
    teacherId: 'teacher-1',
    name: 'ה׳1',
    gradeLevel: 'כיתה ה׳',
    createdAt: now,
  },
  {
    id: 'class-2',
    schoolId: 'school-insight',
    teacherId: 'teacher-1',
    name: 'ב׳1',
    gradeLevel: 'כיתה ב׳',
    createdAt: now,
  },
]

export const mockParents: Parent[] = [
  {
    id: 'parent-nadav',
    fullName: 'נדב',
    phone: '050-1111111',
    email: null,
    createdAt: now,
  },
  {
    id: 'parent-single',
    fullName: 'דנה',
    phone: '050-0000000',
    email: null,
    createdAt: now,
  },
]

export const mockStudents: Student[] = [
  {
    id: 'student-yonatan',
    schoolId: 'school-insight',
    classId: 'class-7',
    fullName: 'יונתן',
    gradeLevel: 'כיתה ז׳',
    createdAt: now,
  },
  {
    id: 'student-noa',
    schoolId: 'school-insight',
    classId: 'class-5',
    fullName: 'נועה',
    gradeLevel: 'כיתה ה׳',
    createdAt: now,
  },
  {
    id: 'student-itay',
    schoolId: 'school-insight',
    classId: 'class-2',
    fullName: 'איתי',
    gradeLevel: 'כיתה ב׳',
    createdAt: now,
  },
]

export const mockStudentParents: StudentParent[] = [
  {
    id: 'student-parent-1',
    studentId: 'student-yonatan',
    parentId: 'parent-nadav',
    relationship: 'father',
  },
  {
    id: 'student-parent-2',
    studentId: 'student-noa',
    parentId: 'parent-nadav',
    relationship: 'father',
  },
  {
    id: 'student-parent-3',
    studentId: 'student-itay',
    parentId: 'parent-nadav',
    relationship: 'father',
  },
  {
    id: 'student-parent-4',
    studentId: 'student-yonatan',
    parentId: 'parent-single',
    relationship: 'mother',
  },
]

export const mockSubjects: Subject[] = [
  { id: 'math', schoolId: 'school-insight', name: 'מתמטיקה', createdAt: now },
  { id: 'english', schoolId: 'school-insight', name: 'אנגלית', createdAt: now },
  { id: 'science', schoolId: 'school-insight', name: 'מדעים', createdAt: now },
  { id: 'history', schoolId: 'school-insight', name: 'היסטוריה', createdAt: now },
  { id: 'language', schoolId: 'school-insight', name: 'עברית', createdAt: now },
  { id: 'reading', schoolId: 'school-insight', name: 'קריאה', createdAt: now },
]

export const mockTopics: Topic[] = [
  { id: 'fractions', subjectId: 'math', name: 'Fractions', createdAt: now },
  { id: 'common-denominator', subjectId: 'math', name: 'מכנה משותף', createdAt: now },
  { id: 'decimals', subjectId: 'math', name: 'מספרים עשרוניים', createdAt: now },
  { id: 'equations', subjectId: 'math', name: 'משוואות בסיסיות', createdAt: now },
  { id: 'vocabulary', subjectId: 'english', name: 'Vocabulary practice', createdAt: now },
  { id: 'reading-comprehension', subjectId: 'english', name: 'הבנת הנקרא', createdAt: now },
  { id: 'ecosystems', subjectId: 'science', name: 'מערכות אקולוגיות', createdAt: now },
  { id: 'timeline', subjectId: 'history', name: 'רצף אירועים', createdAt: now },
  { id: 'reasoning', subjectId: 'language', name: 'כתיבה מנומקת', createdAt: now },
  { id: 'sounds', subjectId: 'reading', name: 'רצף צלילים', createdAt: now },
  { id: 'fluency', subjectId: 'reading', name: 'שטף קריאה', createdAt: now },
  { id: 'addition', subjectId: 'math', name: 'חיבור עד 20', createdAt: now },
  { id: 'word-problems', subjectId: 'math', name: 'בעיות מילוליות', createdAt: now },
]

export const mockGrades: Grade[] = [
  {
    id: 'grade-yonatan-math-1',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'fractions',
    score: 62,
    classAverage: 78,
    assessmentType: 'בוחן',
    assessedAt: '2026-06-02',
  },
  {
    id: 'grade-yonatan-math-2',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'decimals',
    score: 74,
    classAverage: 80,
    assessmentType: 'עבודה',
    assessedAt: '2026-06-09',
  },
  {
    id: 'grade-yonatan-math-3',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'equations',
    score: 86,
    classAverage: 82,
    assessmentType: 'תרגול',
    assessedAt: '2026-06-16',
  },
  {
    id: 'grade-yonatan-english-1',
    studentId: 'student-yonatan',
    subjectId: 'english',
    topicId: 'vocabulary',
    score: 76,
    classAverage: 80,
    assessmentType: 'בוחן מילים',
    assessedAt: '2026-06-06',
  },
  {
    id: 'grade-yonatan-science-1',
    studentId: 'student-yonatan',
    subjectId: 'science',
    topicId: 'ecosystems',
    score: 94,
    classAverage: 86,
    assessmentType: 'עבודה',
    assessedAt: '2026-06-13',
  },
  {
    id: 'grade-noa-language-1',
    studentId: 'student-noa',
    subjectId: 'language',
    topicId: 'reasoning',
    score: 82,
    classAverage: 84,
    assessmentType: 'משימת כתיבה',
    assessedAt: '2026-06-10',
  },
  {
    id: 'grade-noa-math-1',
    studentId: 'student-noa',
    subjectId: 'math',
    topicId: 'word-problems',
    score: 96,
    classAverage: 88,
    assessmentType: 'בוחן',
    assessedAt: '2026-06-11',
  },
  {
    id: 'grade-itay-reading-1',
    studentId: 'student-itay',
    subjectId: 'reading',
    topicId: 'sounds',
    score: 68,
    classAverage: 79,
    assessmentType: 'בדיקת קריאה',
    assessedAt: '2026-06-17',
  },
  {
    id: 'grade-itay-math-1',
    studentId: 'student-itay',
    subjectId: 'math',
    topicId: 'word-problems',
    score: 78,
    classAverage: 82,
    assessmentType: 'תרגול כיתה',
    assessedAt: '2026-06-14',
  },
]

export const mockAttendance: Attendance[] = [
  {
    id: 'attendance-yonatan-math-1',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'fractions',
    lessonDate: '2026-05-12',
    isPresent: false,
    createdAt: now,
  },
  {
    id: 'attendance-yonatan-math-2',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'common-denominator',
    lessonDate: '2026-05-19',
    isPresent: false,
    createdAt: now,
  },
  {
    id: 'attendance-yonatan-math-3',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'fractions',
    lessonDate: '2026-05-26',
    isPresent: false,
    createdAt: now,
  },
  {
    id: 'attendance-yonatan-math-4',
    studentId: 'student-yonatan',
    subjectId: 'math',
    topicId: 'equations',
    lessonDate: '2026-06-02',
    isPresent: true,
    createdAt: now,
  },
  {
    id: 'attendance-itay-reading-1',
    studentId: 'student-itay',
    subjectId: 'reading',
    topicId: 'sounds',
    lessonDate: '2026-06-05',
    isPresent: false,
    createdAt: now,
  },
  {
    id: 'attendance-itay-reading-2',
    studentId: 'student-itay',
    subjectId: 'reading',
    topicId: 'fluency',
    lessonDate: '2026-06-12',
    isPresent: false,
    createdAt: now,
  },
]

export const mockAnalyses: StudentAIAnalysis[] = [
  {
    id: 'analysis-yonatan-math',
    studentId: 'student-yonatan',
    subjectId: 'math',
    summary:
      'יונתן לא חלש במתמטיקה באופן כללי. הקושי מתרכז בשברים, ובמיוחד בשלב שבו צריך לזהות מכנה משותף.',
    riskLevel: 'red',
    rawResponse: {},
    generatedAt: now,
    createdAt: now,
  },
  {
    id: 'analysis-yonatan-english',
    studentId: 'student-yonatan',
    subjectId: 'english',
    summary: 'באנגלית רואים פער קטן אבל עקבי באוצר מילים.',
    riskLevel: 'yellow',
    rawResponse: {},
    generatedAt: now,
    createdAt: now,
  },
  {
    id: 'analysis-yonatan-science',
    studentId: 'student-yonatan',
    subjectId: 'science',
    summary: 'יונתן במצב טוב במדעים. כדאי לשמר קצב עם אתגר קצר.',
    riskLevel: 'green',
    rawResponse: {},
    generatedAt: now,
    createdAt: now,
  },
  {
    id: 'analysis-noa-math',
    studentId: 'student-noa',
    subjectId: 'math',
    summary: 'נועה במומנטום מצוין במתמטיקה.',
    riskLevel: 'green',
    rawResponse: {},
    generatedAt: now,
    createdAt: now,
  },
  {
    id: 'analysis-itay-reading',
    studentId: 'student-itay',
    subjectId: 'reading',
    summary: 'איתי מתאמץ בקריאה כי רצף הצלילים עדיין לא אוטומטי.',
    riskLevel: 'red',
    rawResponse: {},
    generatedAt: now,
    createdAt: now,
  },
]

export const mockAnalysisTopics: AIAnalysisTopic[] = [
  {
    id: 'analysis-topic-1',
    analysisId: 'analysis-yonatan-math',
    topicId: 'fractions',
    status: 'needs-support',
    explanation: 'ציון נמוך והחמצות חוזרות באותו נושא.',
  },
  {
    id: 'analysis-topic-2',
    analysisId: 'analysis-yonatan-math',
    topicId: 'decimals',
    status: 'medium',
    explanation: 'פער קטן מהממוצע.',
  },
  {
    id: 'analysis-topic-3',
    analysisId: 'analysis-yonatan-math',
    topicId: 'equations',
    status: 'strong',
    explanation: 'מעל ממוצע כיתתי.',
  },
]
