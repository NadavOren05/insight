import type { DataSource } from '../types/insight'

interface SourceDotProps {
  source?: DataSource
}

export const SourceDot = ({ source }: SourceDotProps) => {
  if (!import.meta.env.DEV || source === undefined) {
    return null
  }

  const className = source === 'database' ? 'bg-emerald-500' : 'bg-orange-400'
  const label = source === 'database' ? 'מקור נתונים: Supabase' : 'מקור נתונים: Mock'

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-block size-2 shrink-0 rounded-full ${className}`}
    />
  )
}
