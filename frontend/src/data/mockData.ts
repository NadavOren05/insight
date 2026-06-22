import type {
  ParentUser,
  Student,
  SubjectDataByStudentId,
  SubjectProgress,
  SubjectProgressByStudentId,
} from '../types/insight'

export const defaultParentUser: ParentUser = {
  id: 'parent-1',
  name: 'דנה',
  phone: '050-0000000',
}

export const nadavParentUser: ParentUser = {
  id: 'parent-nadav',
  name: 'נדב',
  phone: '050-1111111',
}

export const yonatanStudent: Student = {
  id: 'student-yonatan',
  name: 'יונתן',
  grade: 'כיתה ז׳',
}

export const noaStudent: Student = {
  id: 'student-noa',
  name: 'נועה',
  grade: 'כיתה ה׳',
}

export const itayStudent: Student = {
  id: 'student-itay',
  name: 'איתי',
  grade: 'כיתה ב׳',
}

export const singleChildStudents: Student[] = [yonatanStudent]

export const multiChildStudents: Student[] = [yonatanStudent, noaStudent, itayStudent]

export const yonatanSubjects: SubjectProgress[] = [
  {
    id: 'math',
    name: 'מתמטיקה',
    riskLevel: 'red',
    summary: 'יונתן מתקשה בשברים בגלל שיעורים חסרים בנושא Fractions.',
    missingLessons: ['Fractions'],
  },
  {
    id: 'english',
    name: 'אנגלית',
    riskLevel: 'yellow',
    summary: 'הבנת הנקרא יציבה, אך אוצר המילים דורש חיזוק השבוע.',
    missingLessons: ['Vocabulary practice'],
  },
  {
    id: 'science',
    name: 'מדעים',
    riskLevel: 'green',
    summary: 'הביצועים טובים וההשתתפות בשיעורים עקבית.',
    missingLessons: [],
  },
  {
    id: 'history',
    name: 'היסטוריה',
    riskLevel: 'green',
    summary: 'התקדמות טובה במטלות והבנה ברורה של החומר האחרון.',
    missingLessons: [],
  },
]

export const subjectProgressByStudentId: SubjectProgressByStudentId = {
  [yonatanStudent.id]: yonatanSubjects,
  [noaStudent.id]: [
    {
      id: 'language',
      name: 'עברית',
      riskLevel: 'yellow',
      summary: 'נועה מתקדמת יפה בקריאה, אך כדאי לחזק כתיבת תשובות מלאות.',
      missingLessons: ['כתיבה מנומקת'],
    },
    {
      id: 'math',
      name: 'מתמטיקה',
      riskLevel: 'green',
      summary: 'הבנת הכפל והחילוק טובה והתרגול השבועי בוצע בזמן.',
      missingLessons: [],
    },
    {
      id: 'english',
      name: 'אנגלית',
      riskLevel: 'green',
      summary: 'זיהוי מילים בסיסיות והגייה נמצאים במגמת שיפור יציבה.',
      missingLessons: [],
    },
  ],
  [itayStudent.id]: [
    {
      id: 'reading',
      name: 'קריאה',
      riskLevel: 'red',
      summary: 'איתי מפספס תרגול רצף צלילים, ולכן הקריאה עדיין איטית מהמצופה.',
      missingLessons: ['רצף צלילים'],
    },
    {
      id: 'math',
      name: 'חשבון',
      riskLevel: 'yellow',
      summary: 'חיבור עד 20 משתפר, אך יש צורך בתרגול נוסף של בעיות מילוליות.',
      missingLessons: ['בעיות מילוליות'],
    },
    {
      id: 'science',
      name: 'מדעים',
      riskLevel: 'green',
      summary: 'סקרנות גבוהה והשתתפות פעילה בנושאי בעלי חיים וסביבה.',
      missingLessons: [],
    },
  ],
}

export const subjectDataByStudentId: SubjectDataByStudentId = {
  [yonatanStudent.id]: {
    math: {
      id: 'math',
      name: 'מתמטיקה',
      riskLevel: 'red',
      aiSummary:
        'יונתן לא “חלש במתמטיקה” באופן כללי. הקושי מתרכז בשברים: הוא מפספס את המעבר בין מכנה משותף, הרחבה וצמצום, ולכן גם שאלות פשוטות נראות לו ארוכות מדי. אם הערב מתמקדים רק בזיהוי השלב הבא בתרגיל, אפשר להוריד עומס ולהחזיר תחושת שליטה.',
      topics: [
        { id: 'fractions', name: 'Fractions', status: 'needs-support' },
        { id: 'common-denominator', name: 'מכנה משותף', status: 'needs-support' },
        { id: 'decimals', name: 'מספרים עשרוניים', status: 'medium' },
        { id: 'equations', name: 'משוואות בסיסיות', status: 'strong' },
      ],
      attendance: {
        percentage: 88,
        attendanceFlag: true,
        relevantAbsences: [
          { id: 'absence-1', date: '12.05', topicName: 'Fractions' },
          { id: 'absence-2', date: '19.05', topicName: 'מכנה משותף' },
          { id: 'absence-3', date: '26.05', topicName: 'תרגול שברים' },
        ],
      },
      grades: [
        {
          id: 'grade-1',
          date: '02.06',
          topic: 'Fractions',
          type: 'בוחן',
          score: 62,
          classAvg: 78,
        },
        {
          id: 'grade-2',
          date: '09.06',
          topic: 'מספרים עשרוניים',
          type: 'עבודה',
          score: 74,
          classAvg: 80,
        },
        {
          id: 'grade-3',
          date: '16.06',
          topic: 'משוואות בסיסיות',
          type: 'תרגול',
          score: 86,
          classAvg: 82,
        },
      ],
    },
    english: {
      id: 'english',
      name: 'אנגלית',
      riskLevel: 'yellow',
      aiSummary:
        'באנגלית רואים פער קטן אבל עקבי באוצר מילים. יונתן מבין את הרעיון הכללי של טקסט, אבל נעצר כשהמילים החדשות מופיעות בתוך משפט. תרגול קצר עם חמש מילים מתוך הטקסט האחרון יהיה יעיל יותר מדף עבודה ארוך.',
      topics: [
        { id: 'vocabulary', name: 'Vocabulary practice', status: 'medium' },
        { id: 'reading', name: 'הבנת הנקרא', status: 'strong' },
        { id: 'grammar', name: 'דקדוק בסיסי', status: 'medium' },
      ],
      attendance: {
        percentage: 94,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [
        {
          id: 'grade-english-1',
          date: '06.06',
          topic: 'Vocabulary practice',
          type: 'בוחן מילים',
          score: 76,
          classAvg: 80,
        },
      ],
    },
    science: {
      id: 'science',
      name: 'מדעים',
      riskLevel: 'green',
      aiSummary:
        'יונתן במצב טוב במדעים. הוא משתתף, שואל שאלות ומצליח לקשר בין דוגמאות מהשיעור לבין ההסברים במחברת. כרגע כדאי לשמר את הקצב עם אתגר קצר, לא להעמיס תרגול בסיסי.',
      topics: [
        { id: 'ecosystems', name: 'מערכות אקולוגיות', status: 'strong' },
        { id: 'energy', name: 'אנרגיה', status: 'strong' },
        { id: 'lab', name: 'עבודת מעבדה', status: 'strong' },
      ],
      attendance: {
        percentage: 100,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [
        {
          id: 'grade-science-1',
          date: '13.06',
          topic: 'מערכות אקולוגיות',
          type: 'עבודה',
          score: 94,
          classAvg: 86,
        },
      ],
    },
    history: {
      id: 'history',
      name: 'היסטוריה',
      riskLevel: 'green',
      aiSummary:
        'בהיסטוריה יש הבנה טובה של רצף האירועים, אבל עדיין לא נאספו מספיק הערכות מספריות. הדרך הנכונה הערב היא שיחה קצרה: לבקש מיונתן להסביר בקול את הסיבה והתוצאה של האירוע האחרון שנלמד.',
      topics: [
        { id: 'timeline', name: 'רצף אירועים', status: 'strong' },
        { id: 'cause-effect', name: 'סיבה ותוצאה', status: 'medium' },
      ],
      attendance: {
        percentage: 97,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [],
    },
  },
  [noaStudent.id]: {
    language: {
      id: 'language',
      name: 'עברית',
      riskLevel: 'yellow',
      aiSummary:
        'נועה מבינה את הסיפור, אבל בתשובות כתובות היא מדלגת על הנימוק. כדאי לשאול אותה הערב “איך את יודעת?” אחרי כל תשובה, כדי לבנות הרגל של הוכחה מתוך הטקסט.',
      topics: [
        { id: 'reasoning', name: 'כתיבה מנומקת', status: 'medium' },
        { id: 'reading', name: 'קריאה מדויקת', status: 'strong' },
        { id: 'main-idea', name: 'רעיון מרכזי', status: 'strong' },
      ],
      attendance: {
        percentage: 96,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [
        {
          id: 'grade-language-1',
          date: '10.06',
          topic: 'כתיבה מנומקת',
          type: 'משימת כתיבה',
          score: 82,
          classAvg: 84,
        },
      ],
    },
    math: {
      id: 'math',
      name: 'מתמטיקה',
      riskLevel: 'green',
      aiSummary:
        'נועה במומנטום מצוין במתמטיקה. היא פותרת תרגילים בצורה מסודרת ומסבירה את הדרך, ולכן הערב כדאי לתת לה אתגר חשיבה קצר במקום חזרה רגילה.',
      topics: [
        { id: 'multiplication', name: 'כפל', status: 'strong' },
        { id: 'division', name: 'חילוק', status: 'strong' },
        { id: 'word-problems', name: 'בעיות מילוליות', status: 'strong' },
      ],
      attendance: {
        percentage: 100,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [
        {
          id: 'grade-noa-math-1',
          date: '11.06',
          topic: 'כפל וחילוק',
          type: 'בוחן',
          score: 96,
          classAvg: 88,
        },
      ],
    },
    english: {
      id: 'english',
      name: 'אנגלית',
      riskLevel: 'green',
      aiSummary:
        'נועה מתקדמת יפה באנגלית. היא מזהה מילים חדשות מהר יותר ומשתמשת בהן במשפטים קצרים. מספיק תרגול קל לשימור הביטחון.',
      topics: [
        { id: 'phonics', name: 'צלילים', status: 'strong' },
        { id: 'words', name: 'מילים בסיסיות', status: 'strong' },
      ],
      attendance: {
        percentage: 98,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [],
    },
  },
  [itayStudent.id]: {
    reading: {
      id: 'reading',
      name: 'קריאה',
      riskLevel: 'red',
      aiSummary:
        'איתי מתאמץ בקריאה כי רצף הצלילים עדיין לא אוטומטי. הערב עדיף תרגול קצר וקולי של שלוש מילים בכל פעם, עם הצלחה מהירה, במקום קריאה ארוכה שמתישה אותו.',
      topics: [
        { id: 'sounds', name: 'רצף צלילים', status: 'needs-support' },
        { id: 'fluency', name: 'שטף קריאה', status: 'medium' },
        { id: 'letters', name: 'זיהוי אותיות', status: 'strong' },
      ],
      attendance: {
        percentage: 90,
        attendanceFlag: true,
        relevantAbsences: [
          { id: 'itay-absence-1', date: '05.06', topicName: 'רצף צלילים' },
          { id: 'itay-absence-2', date: '12.06', topicName: 'שטף קריאה' },
        ],
      },
      grades: [
        {
          id: 'grade-reading-1',
          date: '17.06',
          topic: 'רצף צלילים',
          type: 'בדיקת קריאה',
          score: 68,
          classAvg: 79,
        },
      ],
    },
    math: {
      id: 'math',
      name: 'חשבון',
      riskLevel: 'yellow',
      aiSummary:
        'איתי מבין חיבור עד 20, אבל כשהשאלה מילולית הוא לא תמיד מזהה איזו פעולה צריך לעשות. כדאי לשאול קודם “מה מבקשים למצוא?” ורק אז לפתור.',
      topics: [
        { id: 'addition', name: 'חיבור עד 20', status: 'strong' },
        { id: 'word-problems', name: 'בעיות מילוליות', status: 'medium' },
      ],
      attendance: {
        percentage: 95,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [
        {
          id: 'grade-itay-math-1',
          date: '14.06',
          topic: 'בעיות מילוליות',
          type: 'תרגול כיתה',
          score: 78,
          classAvg: 82,
        },
      ],
    },
    science: {
      id: 'science',
      name: 'מדעים',
      riskLevel: 'green',
      aiSummary:
        'איתי סקרן מאוד במדעים וזוכר פרטים משיעורים קודמים. אפשר לנצל את זה לשיחת העשרה קצרה על הסביבה הקרובה.',
      topics: [
        { id: 'animals', name: 'בעלי חיים', status: 'strong' },
        { id: 'environment', name: 'סביבה', status: 'strong' },
      ],
      attendance: {
        percentage: 100,
        attendanceFlag: false,
        relevantAbsences: [],
      },
      grades: [],
    },
  },
}
