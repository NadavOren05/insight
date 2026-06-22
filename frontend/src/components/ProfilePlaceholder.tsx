import { UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppBackground } from './AppBackground'
import { BottomNavigation } from './BottomNavigation'

export const ProfilePlaceholder = () => {
  const navigate = useNavigate()

  return (
    <AppBackground className="pb-28">
      <div className="mx-auto w-full max-w-[760px] px-5 pb-8 pt-10 sm:px-8">
        <section className="rounded-3xl border border-white/20 bg-white/70 p-6 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/70 text-[#1A6B5A]">
            <UserRound className="size-6" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-slate-950">פרופיל</h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            אזור הפרופיל יתווסף בשלב הבא. כרגע אפשר לחזור למסך הבית ולהמשיך לעקוב אחרי ההתקדמות.
          </p>
        </section>
      </div>

      <BottomNavigation currentPath="/profile" onNavigate={navigate} />
    </AppBackground>
  )
}
