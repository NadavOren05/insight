import { motion } from 'framer-motion'
import { GraduationCap, Loader2, LogOut, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppBackground } from './AppBackground'
import { BottomNavigation } from './BottomNavigation'
import { SourceDot } from './SourceDot'
import { useProfile } from '../hooks/useProfile'
import type { Student } from '../types/insight'

interface ChildCardProps {
  child: Student
  isActive: boolean
  isStatic?: boolean
  onSelect?: (studentId: string) => void
}

const childCardClassName = (isActive: boolean, isStatic: boolean): string =>
  [
    'w-full rounded-3xl border bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md transition',
    isActive ? 'border-[#1A6B5A]/45 ring-4 ring-[#1A6B5A]/10' : 'border-white/20',
    isStatic ? '' : 'hover:-translate-y-0.5 hover:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/15',
  ].join(' ')

const ChildCard = ({ child, isActive, isStatic = false, onSelect }: ChildCardProps) => {
  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A6B5A] text-xl font-black text-white shadow-lg shadow-[#1A6B5A]/20">
          {child.name.charAt(0)}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-lg font-black text-slate-950">
            {child.name} · {child.grade}
            <SourceDot source={child._source} />
          </span>
          <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <GraduationCap className="size-4" aria-hidden="true" />
            תלמיד במערכת Insight
          </span>
        </span>
      </div>

      {isActive ? (
        <span className="shrink-0 rounded-full bg-[#F0FAF7] px-3 py-1 text-xs font-black text-[#1A6B5A] ring-1 ring-[#1A6B5A]/15">
          ילד פעיל
        </span>
      ) : null}
    </div>
  )

  if (isStatic) {
    return <div className={childCardClassName(isActive, true)}>{content}</div>
  }

  return (
    <button
      type="button"
      onClick={() => onSelect?.(child.id)}
      className={childCardClassName(isActive, false)}
    >
      {content}
    </button>
  )
}

export const ProfilePlaceholder = () => {
  const navigate = useNavigate()
  const {
    activeChild,
    children,
    handleChildSelect,
    handleLogout,
    hasMultipleChildren,
    isSwitching,
    parentUser,
  } = useProfile()

  return (
    <AppBackground className="pb-28">
      <header className="sticky top-0 z-30 border-b border-white/20 bg-white/70 px-5 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto grid max-w-[760px] grid-cols-[1fr_auto_1fr] items-center">
          <span aria-hidden="true" />
          <h1 className="text-center text-lg font-black text-slate-950">פרופיל</h1>
          <span aria-hidden="true" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-5 sm:px-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-white/20 bg-white/70 p-6 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md"
        >
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/70 text-[#1A6B5A]">
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-slate-950">
            שלום, {parentUser.name}
            <SourceDot source={parentUser._source} />
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-500">
            הורה רשום במערכת Insight
          </p>
        </motion.section>

        <section className="mt-7 text-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-700">הילדים שלי</h2>
            {isSwitching ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-black text-[#1A6B5A] shadow-sm backdrop-blur-md">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                מחליף נתונים...
              </span>
            ) : null}
          </div>

          {hasMultipleChildren ? (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.08,
                  },
                },
              }}
              className="space-y-4"
            >
              {children.map((child) => (
                <motion.div
                  key={child.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <ChildCard
                    child={child}
                    isActive={child.id === activeChild.id}
                    onSelect={handleChildSelect}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <ChildCard child={activeChild} isActive isStatic />
          )}
        </section>

        <section className="mt-8">
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/85 px-5 text-base font-black text-red-700 shadow-[0_14px_45px_rgba(185,28,28,0.10)] backdrop-blur-md transition hover:bg-red-100/90 focus:outline-none focus:ring-4 focus:ring-red-200/70"
          >
            <LogOut className="size-5" aria-hidden="true" />
            התנתקות מהמערכת
          </button>

          <p className="mt-6 text-center text-xs font-bold text-slate-400">
            מערכת Insight · גרסת פיילוט 2025
          </p>
        </section>
      </main>

      <BottomNavigation currentPath="/profile" onNavigate={navigate} />
    </AppBackground>
  )
}
