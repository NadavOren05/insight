import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { AppBackground } from './AppBackground'
import { SourceDot } from './SourceDot'
import { api } from '../services/api'
import { activeStudentIdAtom } from '../state/atoms'
import type { GeneratedLessonResponse } from '../types/api'

export const PracticePlaceholder = () => {
  const { topicId } = useParams<{ topicId: string }>()
  const activeStudentId = useAtomValue(activeStudentIdAtom)
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<GeneratedLessonResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadLesson = async () => {
      setLesson(null)
      setErrorMessage(null)

      try {
        const generatedLesson = await api.practice.generateLesson(activeStudentId, topicId ?? 'topic')

        if (isMounted) {
          setLesson(generatedLesson)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('לא הצלחנו ליצור תרגול כרגע. נסו שוב מאוחר יותר.')
        }
      }
    }

    void loadLesson()

    return () => {
      isMounted = false
    }
  }, [activeStudentId, topicId])

  return (
    <AppBackground className="px-5 pb-28 pt-6">
      <div className="mx-auto w-full max-w-[760px]">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mb-5 flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-black text-[#1A6B5A] transition hover:bg-white/70"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
          חזרה
        </button>

        <section className="rounded-3xl border border-white/20 bg-white/70 p-6 text-start shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-md">
          <h1 className="text-2xl font-black text-slate-950">תרגול קצר</h1>
          {errorMessage ? (
            <div className="mt-8 rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700">
              {errorMessage}
            </div>
          ) : !lesson ? (
            <div className="mt-8 flex items-center gap-3 text-sm font-black text-[#1A6B5A]">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              יוצר תרגול מותאם...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-white/60 p-4">
                <h2 className="text-lg font-black text-slate-900">
                  {lesson.lessonExplanation.title}
                </h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                  {lesson.lessonExplanation.example}
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
                  שאלות תרגול
                  <SourceDot source={lesson.practiceQuestions[0]?._source} />
                </h2>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {lesson.practiceQuestions.length} שאלות מוכנות
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 p-4">
                <h2 className="text-lg font-black text-slate-900">מדריך להורה</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-600">
                  {lesson.parentPedagogicalGuide.goal}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppBackground>
  )
}
