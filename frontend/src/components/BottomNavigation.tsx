import { Home, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Screen } from '../types/insight'

interface BottomNavigationProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

export const BottomNavigation = ({ currentScreen, onNavigate }: BottomNavigationProps) => {
  const navItems: { screen: Screen; label: string; Icon: LucideIcon }[] = [
    { screen: 'home', label: 'בית', Icon: Home },
    { screen: 'profile', label: 'פרופיל', Icon: UserRound },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/20 bg-white/70 px-5 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="mx-auto grid max-w-[520px] grid-cols-2 gap-3">
        {navItems.map(({ screen, label, Icon }) => {
          const isActive = currentScreen === screen

          return (
            <button
              key={screen}
              type="button"
              onClick={() => onNavigate(screen)}
              className={`flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition ${
                isActive
                  ? 'bg-[#1A6B5A] text-white shadow-lg shadow-[#1A6B5A]/20'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
