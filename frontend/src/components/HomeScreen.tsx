import { motion } from 'framer-motion'
import { Menu, Sparkles, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppBackground } from './AppBackground'
import { BottomNavigation } from './BottomNavigation'
import { SourceDot } from './SourceDot'
import { SubjectCard } from './SubjectCard'
import { useHomeScreen } from '../hooks/useHomeScreen'

export const HomeScreen = () => {
  const {
    greeting,
    student,
    aiSummary,
    aiSummarySource,
    closeSwitcher,
    hasMultipleChildren,
    isSwitcherOpen,
    otherChildren,
    sortedSubjects,
    currentScreen,
    openSubjectDetail,
    getRiskMeta,
    switchChild,
    toggleSwitcher,
  } = useHomeScreen()
  const navigate = useNavigate()

  return (
    <AppBackground className="pb-28">
      <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-6 sm:px-8">
        {currentScreen === 'profile' ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-3xl border border-white/20 bg-white/70 p-6 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/70 text-[#1A6B5A]">
              <UserRound className="size-6" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-black text-slate-950">פרופיל</h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              אזור הפרופיל יתווסף בשלב הבא. כרגע אפשר לחזור למסך הבית ולהמשיך לעקוב אחרי ההתקדמות.
            </p>
          </motion.section>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <header className="relative flex items-start justify-between gap-4 pt-2 text-start">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1A6B5A]">Insight</p>
                <h1 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                  {greeting}
                </h1>
                <p className="mt-2 flex items-center gap-2 text-base font-medium text-slate-600">
                  {student.name} · {student.grade}
                  <SourceDot source={student._source} />
                </p>
              </div>

              {hasMultipleChildren ? (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={toggleSwitcher}
                    className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/70 text-[#1A6B5A] shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:bg-white/85 focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/15"
                    aria-label="החלפת ילד"
                    aria-expanded={isSwitcherOpen}
                  >
                    <Menu className="size-6" aria-hidden="true" />
                  </button>

                  {isSwitcherOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      className="absolute start-0 top-14 z-30 w-56 rounded-3xl border border-white/20 bg-white/80 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.16)] backdrop-blur-md"
                    >
                      <p className="px-3 py-2 text-xs font-black text-slate-400">החלפת ילד</p>
                      {otherChildren.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => switchChild(child.id)}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition hover:bg-[#F0FAF7]"
                        >
                          <span className="flex size-9 items-center justify-center rounded-xl bg-[#1A6B5A] text-sm font-black text-white">
                            {child.name.charAt(0)}
                          </span>
                          <span>
                            <span className="block text-sm font-black text-slate-950">{child.name}</span>
                            <span className="text-xs font-semibold text-slate-500">{child.grade}</span>
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={closeSwitcher}
                        className="mt-1 w-full rounded-2xl px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100/80"
                      >
                        סגור
                      </button>
                    </motion.div>
                  ) : null}
                </div>
              ) : null}
            </header>

            <section className="mt-7 rounded-[1.75rem] border border-white/20 border-s-[7px] border-s-[#1A6B5A] bg-white/70 p-6 text-start shadow-[0_18px_55px_rgba(26,107,90,0.12)] backdrop-blur-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-black text-[#1A6B5A] shadow-sm">
                <Sparkles className="size-4" aria-hidden="true" />
                ✦ AI Insight
                <SourceDot source={aiSummarySource} />
              </div>
              <p className="text-lg font-bold leading-8 text-slate-900">{aiSummary}</p>
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-end justify-between gap-4 text-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">מקצועות</h2>
                  <p className="mt-1 text-sm text-slate-500">מסודר לפי רמת דחיפות</p>
                </div>
                <span className="rounded-full border border-white/20 bg-white/70 px-3 py-1 text-xs font-bold text-slate-500 shadow-sm backdrop-blur-md">
                  {sortedSubjects.length} מקצועות
                </span>
              </div>

              <div className="space-y-4">
                {sortedSubjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    riskMeta={getRiskMeta(subject.riskLevel)}
                    onOpen={openSubjectDetail}
                  />
                ))}
              </div>
            </section>
          </motion.div>
        )}
      </div>

      <BottomNavigation currentPath="/home" onNavigate={navigate} />
    </AppBackground>
  )
}
