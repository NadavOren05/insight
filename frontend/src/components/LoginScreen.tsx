import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { AppBackground } from './AppBackground'
import { useLoginScreen } from '../hooks/useLoginScreen'

export const LoginScreen = () => {
  const { fullName, phone, isLoading, handleFullNameChange, handlePhoneChange, handleSubmit } =
    useLoginScreen()

  return (
    <AppBackground className="px-5 py-8">
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center">
        <motion.section
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[430px] rounded-[2rem] border border-white/20 bg-white/70 px-7 py-8 shadow-[0_26px_80px_rgba(9,42,35,0.20)] backdrop-blur-md sm:px-9 sm:py-10"
        >
          <div className="mb-9 text-center">
            <p className="text-4xl font-black tracking-normal text-[#1A6B5A]">Insight</p>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950">
              מה המצב של הילד שלך?
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">
              נכנסים ומקבלים תמונת מצב לימודית ברורה.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block text-start">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                שם מלא של ההורה
              </span>
              <input
                type="text"
                value={fullName}
                onChange={handleFullNameChange}
                required
                placeholder="לדוגמה: נדב"
                className="h-14 w-full rounded-2xl border border-white/30 bg-white/65 px-4 text-base text-slate-950 outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-[#1A6B5A] focus:bg-white/85 focus:ring-4 focus:ring-[#1A6B5A]/15"
              />
            </label>

            <label className="block text-start">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                מספר טלפון
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                placeholder="050-1111111"
                className="h-14 w-full rounded-2xl border border-white/30 bg-white/65 px-4 text-base text-slate-950 outline-none backdrop-blur-md transition placeholder:text-slate-400 focus:border-[#1A6B5A] focus:bg-white/85 focus:ring-4 focus:ring-[#1A6B5A]/15"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#1A6B5A] px-5 text-base font-bold text-white shadow-lg shadow-[#1A6B5A]/25 transition hover:bg-[#155647] focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/25 disabled:cursor-wait disabled:opacity-85"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  בודק נתונים...
                </>
              ) : (
                'כניסה'
              )}
            </button>
          </form>
        </motion.section>
      </div>
    </AppBackground>
  )
}
