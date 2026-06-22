import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBackground } from './AppBackground'
import { BottomNavigation } from './BottomNavigation'
import { SourceDot } from './SourceDot'
import { StatusBadge } from './StatusBadge'
import { api } from '../services/api'
import { useSubjectDetail } from '../hooks/useSubjectDetail'
import type { SubjectExamSummary } from '../types/api'

const examStatusLabel: Record<string, string> = {
  generated: 'פתוח',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  cancelled: 'בוטל',
}

const getExamStatusClassName = (status: string): string => {
  if (status === 'completed') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  }

  if (status === 'cancelled') {
    return 'bg-slate-100 text-slate-500 ring-slate-200'
  }

  return 'bg-amber-50 text-amber-700 ring-amber-100'
}

const formatExamDate = (value: string): string => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(date)
}

export const SubjectDetail = () => {
  const {
    attendanceDatesText,
    detail,
    getRiskMeta,
    getScoreMeta,
    getTopicMeta,
    handleBack,
    isExcellent,
    isLoading,
    student,
  } = useSubjectDetail()
  const navigate = useNavigate()
  const riskMeta = getRiskMeta(detail.riskLevel)
  const [isCreatingExam, setIsCreatingExam] = useState(false)
  const [examNotification, setExamNotification] = useState<{
    tone: 'success' | 'error'
    text: string
  } | null>(null)
  const [subjectExams, setSubjectExams] = useState<SubjectExamSummary[]>([])
  const [isLoadingSubjectExams, setIsLoadingSubjectExams] = useState(false)
  const [subjectExamsError, setSubjectExamsError] = useState<string | null>(null)

  const loadSubjectExams = useCallback(async () => {
    setIsLoadingSubjectExams(true)
    setSubjectExamsError(null)

    try {
      const exams = await api.students.listSubjectExams(student.id, detail.id)

      setSubjectExams(exams)
    } catch {
      setSubjectExamsError('לא הצלחנו לטעון את התרגולים הקיימים.')
    } finally {
      setIsLoadingSubjectExams(false)
    }
  }, [detail.id, student.id])

  useEffect(() => {
    void loadSubjectExams()
  }, [loadSubjectExams])

  const handleCreatePracticeExam = async () => {
    setIsCreatingExam(true)
    setExamNotification(null)

    try {
      const exam = await api.practice.generateSubjectPractice(student.id, detail.id)

      setExamNotification({
        tone: 'success',
        text: `התרגול נוצר בהצלחה: ${exam.questionCount} שאלות בנושא ${exam.topicName}.`,
      })
      void loadSubjectExams()
    } catch (error) {
      setExamNotification({
        tone: 'error',
        text: error instanceof Error ? error.message : 'לא הצלחנו ליצור תרגול כרגע.',
      })
    } finally {
      setIsCreatingExam(false)
    }
  }

  return (
    <AppBackground className="pb-28">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-white/70 px-5 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto grid max-w-[760px] grid-cols-[auto_1fr_auto] items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-black text-[#1A6B5A] transition hover:bg-white/70 focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/15"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
            חזרה
          </button>
          <h1 className="flex min-w-0 items-center justify-center gap-2 truncate text-center text-lg font-black text-slate-950">
            {detail.name}
            <SourceDot source={detail._source} />
          </h1>
          <StatusBadge
            riskLevel={detail.riskLevel}
            label={riskMeta.label}
            className={riskMeta.className}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-5 sm:px-8">
        {isLoading ? (
          <div className="flex min-h-[calc(100svh-12rem)] items-center justify-center">
            <div className="rounded-3xl border border-white/20 bg-white/70 px-7 py-8 text-center shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-md">
              <Loader2 className="mx-auto size-9 animate-spin text-[#1A6B5A]" aria-hidden="true" />
              <p className="mt-4 text-base font-black text-slate-800">
                מעבד נתונים ויוצר תובנות...
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            <section className="rounded-[1.75rem] border border-white/20 border-s-[3px] border-s-[#1A6B5A] bg-[#F0FAF7]/90 p-6 text-start shadow-[0_18px_55px_rgba(26,107,90,0.12)] backdrop-blur-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#1A6B5A] shadow-sm">
                <Sparkles className="size-4" aria-hidden="true" />
                ✦ ניתוח AI
                <SourceDot source={detail.aiSummarySource} />
              </div>
              <p className="text-lg font-bold leading-8 text-slate-900">{detail.aiSummary}</p>

              {detail.attendance.attendanceFlag ? (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/85 p-4 text-sm font-bold leading-6 text-orange-800">
                  💡 ייתכן שיש קשר בין ההחמצות לקושי בנושא
                  {attendanceDatesText.length > 0 ? `: ${attendanceDatesText}` : ''}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                מצב לפי נושא
                <SourceDot source={detail.topics[0]?._source} />
              </h2>
              {detail.topics.length > 0 ? (
                <div className="mt-4 divide-y divide-slate-100">
                  {detail.topics.map((topic) => {
                    const topicStatus = getTopicMeta(topic.status)

                    return (
                      <div key={topic.id} className="flex items-center justify-between gap-4 py-3">
                        <span className="text-base font-bold text-slate-800">{topic.name}</span>
                        <span
                          className={`inline-flex items-center gap-2 text-sm font-black ${topicStatus.textClassName}`}
                        >
                          <span
                            className={`size-2.5 rounded-full ${topicStatus.dotClassName}`}
                            aria-hidden="true"
                          />
                          {topicStatus.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-white/60 p-4 text-sm font-bold text-slate-500">
                  טרם נאספו מספיק נתונים על הנושאים
                </p>
              )}
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                  נוכחות
                  <SourceDot source={detail.attendance._source} />
                </h2>
                <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-black text-[#1A6B5A] shadow-sm">
                  {detail.attendance.percentage}%
                </span>
              </div>

              {detail.attendance.relevantAbsences.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {detail.attendance.relevantAbsences.slice(0, 4).map((absence) => (
                    <div
                      key={absence.id}
                      className="rounded-2xl bg-white/60 px-4 py-3 text-sm font-bold text-slate-600"
                    >
                      {absence.date} — {absence.topicName}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-emerald-50/90 p-4 text-sm font-black text-emerald-700">
                  אין החמצות רלוונטיות ✓
                </p>
              )}
            </section>

            {detail.grades.length > 0 ? (
              <section className="rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                  הערכות אחרונות
                  <SourceDot source={detail.grades[0]?._source} />
                </h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/30 bg-white/45">
                  <div className="grid grid-cols-[0.9fr_1.1fr_1fr_0.8fr] gap-2 bg-white/70 px-3 py-3 text-xs font-black text-slate-500">
                    <span>תאריך</span>
                    <span>נושא</span>
                    <span>סוג</span>
                    <span>ציון</span>
                  </div>
                  {detail.grades.map((grade) => {
                    const scoreMeta = getScoreMeta(grade)

                    return (
                      <div
                        key={grade.id}
                        className="grid grid-cols-[0.9fr_1.1fr_1fr_0.8fr] items-center gap-2 border-t border-white/50 px-3 py-3 text-sm font-bold text-slate-700"
                      >
                        <span>{grade.date}</span>
                        <span>{grade.topic}</span>
                        <span>{grade.type}</span>
                        <span
                          className={`inline-flex h-8 w-fit min-w-11 items-center justify-center rounded-full px-3 text-sm font-black ring-1 ${scoreMeta.className}`}
                        >
                          {grade.score}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl border border-[#1A6B5A]/25 bg-[#DDF5EC]/85 p-6 text-start shadow-[0_18px_55px_rgba(26,107,90,0.14)] backdrop-blur-md">
              <h2 className="text-2xl font-black text-slate-950">
                {isExcellent ? `🌟 ${student.name} במומנטום מצוין!` : 'מה לעשות הערב'}
              </h2>
              <p className="mt-3 text-base font-bold leading-7 text-slate-700">
                {isExcellent
                  ? `אפשר לתת ל${student.name} אתגר קצר שמרחיב את החשיבה וממשיך את תחושת ההצלחה.`
                  : `שאל את ${student.name} איפה בדיוק הוא נתקע, ואז בחרו יחד תרגול קצר אחד מתוך הנושא המרכזי.`}
              </p>
              <button
                type="button"
                onClick={handleCreatePracticeExam}
                disabled={isCreatingExam}
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1A6B5A] px-5 text-sm font-black text-white shadow-lg shadow-[#1A6B5A]/20 transition hover:bg-[#155647] focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingExam ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    יוצר תרגול...
                  </>
                ) : isExcellent ? (
                  '✦ צור אתגר העשרה'
                ) : (
                  `✦ צור תרגול קצר ל${student.name}`
                )}
              </button>

              {examNotification ? (
                <div
                  className={`mt-4 rounded-2xl p-4 text-sm font-black ${
                    examNotification.tone === 'success'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                      : 'bg-red-50 text-red-700 ring-1 ring-red-100'
                  }`}
                >
                  {examNotification.text}
                </div>
              ) : null}
            </section>

            <section className="rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black text-slate-950">תרגולים קיימים</h2>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-white/60">
                  {subjectExams.length}
                </span>
              </div>

              {isLoadingSubjectExams ? (
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/60 p-4 text-sm font-black text-[#1A6B5A]">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  טוען תרגולים...
                </div>
              ) : subjectExamsError ? (
                <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">
                  {subjectExamsError}
                </div>
              ) : subjectExams.length === 0 ? (
                <p className="mt-4 rounded-2xl bg-white/60 p-4 text-sm font-bold text-slate-500">
                  עדיין לא נוצרו תרגולים בנושא הזה.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {subjectExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="rounded-2xl border border-white/40 bg-white/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-900">
                            {exam.title}
                          </h3>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            {exam.topicName} · {exam.questionCount} שאלות · {formatExamDate(exam.createdAt)}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ring-1 ${getExamStatusClassName(exam.status)}`}
                        >
                          {examStatusLabel[exam.status] ?? exam.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentPath="/subject" onNavigate={navigate} />
    </AppBackground>
  )
}
