import { useEffect, useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { AppBackground } from './AppBackground'
import { api } from '../services/api'
import { activeStudentIdAtom } from '../state/atoms'
import type { ExamPracticeResponse, ExamSubmissionResult } from '../types/api'

const UNSUPPORTED_EXAM_MESSAGE =
  'המבחן מכיל שאלות שאינם מסוג רב בחירתי אשר לא נתמכות בגרסה זו של המערכת'

type SelectedAnswers = Record<string, string>

export const ExamPractice = () => {
  const { examId } = useParams<{ examId: string }>()
  const activeStudentId = useAtomValue(activeStudentIdAtom)
  const navigate = useNavigate()
  const [exam, setExam] = useState<ExamPracticeResponse | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [result, setResult] = useState<ExamSubmissionResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadExam = async () => {
      if (!examId) {
        setErrorMessage('המבחן לא נמצא.')
        setIsLoading(false)
        return
      }

      try {
        const response = await api.practice.getExamPractice(examId)

        if (isMounted) {
          setExam(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'לא הצלחנו לטעון את המבחן.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadExam()

    return () => {
      isMounted = false
    }
  }, [examId])

  const hasUnsupportedQuestions = useMemo(
    () => Boolean(exam?.questions.some((question) => question.questionTypeCode !== 'mcq')),
    [exam],
  )
  const currentQuestion = exam?.questions[currentQuestionIndex] ?? null
  const answeredCount = exam
    ? exam.questions.filter((question) => selectedAnswers[question.examQuestionId]).length
    : 0
  const allQuestionsAnswered = exam !== null && answeredCount === exam.questions.length

  const handleSelectAnswer = (examQuestionId: string, selectedOptionId: string) => {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [examQuestionId]: selectedOptionId,
    }))
  }

  const handleSubmit = async () => {
    if (!exam || !examId || !allQuestionsAnswered) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const submission = await api.practice.submitExam(
        examId,
        activeStudentId,
        exam.questions.map((question) => ({
          examQuestionId: question.examQuestionId,
          selectedOptionId: selectedAnswers[question.examQuestionId] ?? '',
        })),
      )

      setResult(submission)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'לא הצלחנו לשמור את התשובות.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = async () => {
    if (!examId) {
      return
    }

    setIsRetrying(true)
    setErrorMessage(null)

    try {
      await api.practice.retryExam(examId)
      setSelectedAnswers({})
      setCurrentQuestionIndex(0)
      setResult(null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'לא הצלחנו להתחיל פתירה מחדש.')
    } finally {
      setIsRetrying(false)
    }
  }

  const handleFinish = async () => {
    if (!examId) {
      return
    }

    setIsFinishing(true)
    setErrorMessage(null)

    try {
      await api.practice.finishExam(examId)
      navigate(-1)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'לא הצלחנו לסיים את המבחן.')
    } finally {
      setIsFinishing(false)
    }
  }

  return (
    <AppBackground className="px-5 pb-28 pt-6">
      <div className="mx-auto w-full max-w-[760px]" dir="rtl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 flex h-11 items-center gap-2 rounded-2xl px-3 text-sm font-black text-[#1A6B5A] transition hover:bg-white/70"
        >
          <ArrowRight className="size-5" aria-hidden="true" />
          חזרה
        </button>

        <section className="rounded-3xl border border-white/20 bg-white/70 p-6 text-start shadow-[0_18px_55px_rgba(15,23,42,0.10)] backdrop-blur-md">
          {isLoading ? (
            <div className="flex items-center gap-3 text-sm font-black text-[#1A6B5A]">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              טוען מבחן...
            </div>
          ) : errorMessage && !exam ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">
              {errorMessage}
            </div>
          ) : hasUnsupportedQuestions ? (
            <div className="space-y-5">
              <h1 className="text-2xl font-black text-slate-950">{exam?.title ?? 'מבחן'}</h1>
              <div className="rounded-2xl bg-red-50 p-4 text-sm font-black leading-6 text-red-700 ring-1 ring-red-100">
                {UNSUPPORTED_EXAM_MESSAGE}
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-11 rounded-2xl bg-[#1A6B5A] px-5 text-sm font-black text-white"
              >
                חזרה
              </button>
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-8 text-emerald-600" aria-hidden="true" />
                <h1 className="text-2xl font-black text-slate-950">סיימת את המבחן!</h1>
              </div>
              <div className="rounded-2xl bg-white/60 p-4 text-base font-black leading-8 text-slate-800">
                <p>
                  ענית נכון על {result.correctCount} מתוך {result.totalQuestions} שאלות
                </p>
                <p>הציון שלך: {result.percentageScore}%</p>
              </div>
              {errorMessage ? (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">
                  {errorMessage}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isFinishing || isRetrying}
                  className="h-12 rounded-2xl bg-[#1A6B5A] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isFinishing ? 'מסיים מבחן...' : 'סיים מבחן'}
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isFinishing || isRetrying}
                  className="h-12 rounded-2xl bg-white/80 px-5 text-sm font-black text-[#1A6B5A] ring-1 ring-[#1A6B5A]/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRetrying ? 'מאתחל...' : 'פתירה מחדש'}
                </button>
              </div>
            </div>
          ) : exam && currentQuestion ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-950">{exam.title}</h1>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    שאלה {currentQuestionIndex + 1} מתוך {exam.questions.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="h-10 shrink-0 rounded-2xl bg-white/80 px-4 text-xs font-black text-slate-600 ring-1 ring-white/70"
                >
                  יציאה מהמבחן
                </button>
              </div>

              <div className="rounded-2xl bg-white/60 p-5">
                <h2 className="text-lg font-black leading-8 text-slate-900">
                  {currentQuestion.questionText}
                </h2>
                <div className="mt-5 space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      selectedAnswers[currentQuestion.examQuestionId] === option.id

                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => handleSelectAnswer(currentQuestion.examQuestionId, option.id)}
                        className={`w-full rounded-2xl border p-4 text-start text-sm font-black transition ${
                          isSelected
                            ? 'border-[#1A6B5A] bg-[#DDF5EC] text-[#155647]'
                            : 'border-white/50 bg-white/70 text-slate-700 hover:bg-white'
                        }`}
                      >
                        {option.optionText}
                      </button>
                    )
                  })}
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((index) => Math.max(index - 1, 0))}
                    disabled={currentQuestionIndex === 0}
                    className="h-11 rounded-2xl bg-white/80 px-4 text-sm font-black text-slate-600 ring-1 ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    הקודם
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((index) =>
                        Math.min(index + 1, (exam.questions.length || 1) - 1),
                      )
                    }
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                    className="h-11 rounded-2xl bg-white/80 px-4 text-sm font-black text-slate-600 ring-1 ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    הבא
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!allQuestionsAnswered || isSubmitting}
                  className="h-12 rounded-2xl bg-[#1A6B5A] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'שומר תשובות...' : `הגש מבחן (${answeredCount}/${exam.questions.length})`}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700 ring-1 ring-red-100">
              המבחן לא מכיל שאלות.
            </div>
          )}
        </section>
      </div>
    </AppBackground>
  )
}
