import { Home, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface BottomNavigationProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export const BottomNavigation = ({ currentPath, onNavigate }: BottomNavigationProps) => {
  const navItems: { path: string; label: string; Icon: LucideIcon }[] = [
    { path: '/home', label: 'בית', Icon: Home },
    { path: '/profile', label: 'פרופיל', Icon: UserRound },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/20 bg-white/70 px-5 py-3 shadow-[0_-12px_35px_rgba(15,23,42,0.08)] backdrop-blur-md">
      <div className="mx-auto grid max-w-[520px] grid-cols-2 gap-3">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = currentPath === path

          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
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
