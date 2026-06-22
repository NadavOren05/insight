import type { ReactNode } from 'react'

interface AppBackgroundProps {
  children: ReactNode
  className?: string
}

export const AppBackground = ({ children, className = '' }: AppBackgroundProps) => (
  <main className={`mesh-background relative min-h-svh overflow-hidden text-slate-950 ${className}`}>
    <div className="pointer-events-none absolute inset-0 bg-white/35" aria-hidden="true" />
    <div className="relative z-10">{children}</div>
  </main>
)
