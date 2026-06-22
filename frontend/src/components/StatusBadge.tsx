import type { RiskLevel } from '../types/insight'

interface StatusBadgeProps {
  riskLevel: RiskLevel
  label: string
  className: string
}

const dotClassName: Record<RiskLevel, string> = {
  red: 'bg-red-500',
  yellow: 'bg-amber-500',
  green: 'bg-emerald-500',
}

export const StatusBadge = ({ riskLevel, label, className }: StatusBadgeProps) => (
  <span
    className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-bold ring-1 ${className}`}
  >
    <span className={`size-2 rounded-full ${dotClassName[riskLevel]}`} aria-hidden="true" />
    {label}
  </span>
)
