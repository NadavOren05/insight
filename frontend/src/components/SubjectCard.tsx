import { ChevronLeft } from 'lucide-react'
import { SourceDot } from './SourceDot'
import { StatusBadge } from './StatusBadge'
import type { RiskMeta, SubjectProgress } from '../types/insight'

interface SubjectCardProps {
  subject: SubjectProgress
  riskMeta: RiskMeta
  onOpen: (subjectId: string) => void
}

export const SubjectCard = ({ subject, riskMeta, onOpen }: SubjectCardProps) => (
  <button
    type="button"
    onClick={() => onOpen(subject.id)}
    className="block w-full rounded-3xl border border-white/20 bg-white/70 p-5 text-start shadow-[0_14px_45px_rgba(15,23,42,0.08)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/80 focus:outline-none focus:ring-4 focus:ring-[#1A6B5A]/15"
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 text-start">
        <h3 className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-950">
          {subject.name}
          <SourceDot source={subject._source} />
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{subject.summary}</p>
      </div>
      <StatusBadge
        riskLevel={subject.riskLevel}
        label={riskMeta.label}
        className={riskMeta.className}
      />
    </div>

    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-[#1A6B5A]">
      <span>צפה בהמלצות</span>
      <ChevronLeft className="size-4" aria-hidden="true" />
    </div>
  </button>
)
