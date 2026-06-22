import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { AppBackground } from './AppBackground'
import { BottomNavigation } from './BottomNavigation'
import { StatusBadge } from './StatusBadge'
import { useSubjectDetail } from '../hooks/useSubjectDetail'

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
    navigateToScreen,
    student,
  } = useSubjectDetail()
  const riskMeta = getRiskMeta(detail.riskLevel)

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
          <h1 className="truncate text-center text-lg font-black text-slate-950">{detail.name}</h1>
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
              <h2 className="text-xl font-black text-slate-950">מצב לפי נושא</h2>
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
                <h2 className="text-xl font-black text-slate-950">נוכחות</h2>
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
                <h2 className="text-xl font-black text-slate-950">הערכות אחרונות</h2>
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
                className="mt-5 h-12 rounded-2xl bg-[#1A6B5A] px-5 text-sm font-black text-white shadow-lg shadow-[#1A6B5A]/20 transition hover:bg-[#155647] focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/20"
              >
                {isExcellent ? '✦ צור אתגר העשרה' : `✦ צור תרגול קצר ל${student.name}`}
              </button>
            </section>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentScreen="subject-detail" onNavigate={navigateToScreen} />
    </AppBackground>
  )
}
