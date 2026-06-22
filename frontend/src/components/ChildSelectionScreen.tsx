import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'
import { AppBackground } from './AppBackground'
import { useStudentSwitch } from '../hooks/useStudentSwitch'

const getInitial = (name: string) => name.charAt(0)

export const ChildSelectionScreen = () => {
  const { children, selectChild } = useStudentSwitch()

  return (
    <AppBackground className="px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[540px] flex-col justify-center">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 text-start"
        >
          <p className="text-sm font-black text-[#1A6B5A]">Insight</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950">
            במי מתמקדים עכשיו?
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            בחרו ילד כדי לראות תמונת מצב לימודית מותאמת.
          </p>
        </motion.header>

        <div className="space-y-4">
          {children.map((child, index) => (
            <motion.button
              key={child.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => selectChild(child.id)}
              className="flex w-full items-center gap-4 rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-md transition hover:bg-white/80"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#1A6B5A] text-2xl font-black text-white shadow-lg shadow-[#1A6B5A]/20">
                {getInitial(child.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-black text-slate-950">{child.name}</span>
                <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <GraduationCap className="size-4" aria-hidden="true" />
                  {child.grade}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </AppBackground>
  )
}
