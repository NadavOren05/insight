import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { env } from '../lib/env.js'
import { AppError } from '../middleware/appError.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type {
  CreatedPracticeExamResponse,
  GeneratedLessonResponse,
  PracticeQuestion,
  SubjectExamSummary,
} from '../types/api.js'
import type { QuestionWithOptions } from '../types/database.js'

interface GenerateExamInput {
  studentId: string
  topicId: string
  difficultyLevelId?: string | undefined
  recommendationId?: string | undefined
}

interface GenerateSubjectExamInput {
  studentId: string
  subjectId: string
  difficultyLevelId?: string | undefined
}

interface PracticeTopicSelection {
  topicId: string
  selectionSource: 'recommendation' | 'lowest_grade'
  recommendationId?: string | undefined
  averageScore?: number | undefined
  latestGradeDate?: string | undefined
}

const MIN_QUESTION_COUNT = 5
const WEAK_ANALYSIS_TYPES = new Set(['weak', 'gap', 'missed', 'attendance_correlation'])

const generatedQuestionSchema = z.object({
  questions: z.array(
    z.object({
      questionText: z.string().min(1),
      correctAnswer: z.string().nullable(),
      options: z.array(
        z.object({
          optionText: z.string().min(1),
          isCorrect: z.boolean(),
          sortOrder: z.number().int().positive(),
        }),
      ).min(2),
    }),
  ),
})

type GeneratedQuestionPayload = z.infer<typeof generatedQuestionSchema>

const getAnthropic = (): Anthropic =>
  new Anthropic({
    apiKey: env.CLAUDE_API_KEY ?? '',
  })

const buildQuestionPrompt = (topicName: string, missingCount: number): string =>
  [
    'Create Hebrew multiple-choice practice questions for a school parent app.',
    'Return only valid JSON matching: { "questions": [{ "questionText": string, "correctAnswer": string | null, "options": [{ "optionText": string, "isCorrect": boolean, "sortOrder": number }] }] }.',
    `Topic: ${topicName}. Create ${missingCount} questions. Each question must have exactly 4 options and exactly one correct option.`,
  ].join('\n')

const deterministicFallbackQuestions = (
  topicId: string,
  missingCount: number,
): GeneratedQuestionPayload['questions'] =>
  Array.from({ length: missingCount }, (_item, index) => {
    const number = index + 1
    return {
      questionText: `שאלת תרגול ${number} בנושא ${topicId}`,
      correctAnswer: 'תשובה נכונה',
      options: [
        { optionText: 'תשובה נכונה', isCorrect: true, sortOrder: 1 },
        { optionText: 'מסיח א', isCorrect: false, sortOrder: 2 },
        { optionText: 'מסיח ב', isCorrect: false, sortOrder: 3 },
        { optionText: 'מסיח ג', isCorrect: false, sortOrder: 4 },
      ],
    }
  })

const parseClaudeText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value)
}

const questionToPracticeQuestion = (question: QuestionWithOptions): PracticeQuestion => {
  const answer =
    question.correctAnswer ??
    question.options.find((option) => option.isCorrect)?.optionText ??
    'בדיקה מול המורה'

  return {
    _source: question._source ?? 'mock',
    id: question.id,
    prompt: question.questionText,
    answer,
    hint: 'בחר תשובה ואז בקש מהילד להסביר את דרך החשיבה.',
  }
}

const logExamGeneration = (event: string, details: Record<string, unknown>): void => {
  console.info(`[exam-generation] ${event}`, JSON.stringify(details))
}

const logExamList = (event: string, details: Record<string, unknown>): void => {
  console.info(`[exam-list] ${event}`, JSON.stringify(details))
}

const shuffleQuestions = (questions: QuestionWithOptions[]): QuestionWithOptions[] =>
  [...questions].sort(() => Math.random() - 0.5)

export class QuestionService {
  private readonly repository: StudentRepository

  public constructor(repository: StudentRepository = studentRepository) {
    this.repository = repository
  }

  public async generateExamBackedLesson(input: GenerateExamInput): Promise<GeneratedLessonResponse> {
    logExamGeneration('start-topic-exam', {
      studentId: input.studentId,
      topicId: input.topicId,
      recommendationId: input.recommendationId ?? null,
      difficultyLevelId: input.difficultyLevelId ?? null,
      usingRealDb: this.repository.isUsingRealDb(),
    })

    const difficulty =
      input.difficultyLevelId !== undefined
        ? { id: input.difficultyLevelId }
        : await this.repository.findDifficultyByCode('medium')
    const difficultyLevelId = difficulty?.id

    if (!difficultyLevelId) {
      throw new AppError('Difficulty level was not found', 404)
    }

    const topic = await this.repository.findTopicById(input.topicId)

    if (!topic) {
      throw new AppError('Topic was not found', 404)
    }

    const questionType = await this.repository.findQuestionTypeByCode('multiple_choice')

    if (!questionType) {
      throw new AppError('Question type was not found', 404)
    }

    const dbQuestions = await this.repository.listQuestionsByTopicAndDifficulty(
      input.topicId,
      difficultyLevelId,
    )
    const missingCount = Math.max(MIN_QUESTION_COUNT - dbQuestions.length, 0)

    logExamGeneration('question-inventory', {
      studentId: input.studentId,
      topicId: input.topicId,
      topicName: topic.name,
      difficultyLevelId,
      dbQuestionCount: dbQuestions.length,
      minimumQuestionCount: MIN_QUESTION_COUNT,
      missingQuestionCount: missingCount,
    })

    const generatedQuestions =
      missingCount > 0
        ? await this.createFallbackQuestions(topic.name, input.topicId, difficultyLevelId, questionType.id, missingCount)
        : []
    const selectedQuestions = [...dbQuestions, ...generatedQuestions].slice(0, MIN_QUESTION_COUNT)

    logExamGeneration('questions-selected', {
      studentId: input.studentId,
      topicId: input.topicId,
      selectedQuestionCount: selectedQuestions.length,
      dbQuestionCount: dbQuestions.length,
      generatedQuestionCount: generatedQuestions.length,
      selectedQuestionIds: selectedQuestions.map((question) => question.id),
    })

    const exam = await this.repository.createGeneratedExam({
      studentId: input.studentId,
      topicId: input.topicId,
      recommendationId: input.recommendationId ?? null,
      title: `תרגול קצר: ${topic.name}`,
      generationReason: missingCount > 0 ? 'DB inventory was insufficient; AI fallback filled gaps.' : 'DB inventory',
    })

    logExamGeneration('exam-created', {
      studentId: input.studentId,
      topicId: input.topicId,
      examId: exam.id,
      recommendationId: exam.recommendationId,
      targetTopicId: exam.targetTopicId,
      status: exam.status,
    })

    const examQuestions = await this.repository.addQuestionsToExam(
      exam.id,
      selectedQuestions.map((question) => question.id),
    )

    logExamGeneration('exam-questions-attached', {
      studentId: input.studentId,
      topicId: input.topicId,
      examId: exam.id,
      attachedQuestionCount: examQuestions.length,
      examQuestionIds: examQuestions.map((examQuestion) => examQuestion.id),
    })

    await this.repository.updateParentActionStatus({
      studentId: input.studentId,
      recommendationId: input.recommendationId ?? null,
      status: 'in_progress',
    })

    logExamGeneration('parent-action-updated', {
      studentId: input.studentId,
      recommendationId: input.recommendationId ?? null,
      status: input.recommendationId ? 'in_progress' : 'skipped-no-recommendation',
    })

    logExamGeneration('complete', {
      studentId: input.studentId,
      topicId: input.topicId,
      examId: exam.id,
      practiceQuestionCount: selectedQuestions.length,
    })

    return {
      studentId: input.studentId,
      topicId: input.topicId,
      lessonExplanation: {
        title: `לפני התרגול: ${topic.name}`,
        steps: [
          'התחילו בדוגמה אחת בקול רם.',
          'בקשו מהילד להסביר למה בחר תשובה מסוימת.',
          'עברו לשאלה הבאה רק אחרי שהדרך ברורה.',
        ],
        example: `בחרו שאלה אחת בנושא ${topic.name} ופרקו אותה לשני צעדים קצרים.`,
      },
      practiceQuestions: selectedQuestions.map(questionToPracticeQuestion),
      parentPedagogicalGuide: {
        goal: 'לייצר תרגול קצר שמחזק הבנה ולא רק תשובה נכונה.',
        coachingTips: ['שאלו "איך ידעת?" לפני תיקון', 'חזקו הסבר חלקי טוב', 'סיימו אחרי רצף קצר של הצלחות'],
        stopWhen: 'עוצרים אחרי 10 דקות או אם מופיע תסכול ברור.',
      },
    }
  }

  public async createExamForSubject(input: GenerateSubjectExamInput): Promise<CreatedPracticeExamResponse> {
    logExamGeneration('start-subject-exam-create-only', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      usingRealDb: this.repository.isUsingRealDb(),
    })

    const [student, subject] = await Promise.all([
      this.repository.findStudentById(input.studentId),
      this.repository.findSubjectById(input.subjectId),
    ])

    if (!student) {
      throw new AppError('Student was not found', 404)
    }

    if (!subject) {
      throw new AppError('Subject was not found', 404)
    }

    const selection = await this.selectPracticeTopic(input.studentId, input.subjectId)

    if (!selection) {
      throw new AppError('No topic with enough learning data was found for this subject', 404)
    }

    logExamGeneration('subject-topic-selected', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: selection.topicId,
      selectionSource: selection.selectionSource,
      recommendationId: selection.recommendationId ?? null,
      averageScore: selection.averageScore ?? null,
      latestGradeDate: selection.latestGradeDate ?? null,
    })

    const topic = await this.repository.findTopicById(selection.topicId)

    if (!topic) {
      throw new AppError('Topic was not found', 404)
    }

    if (this.repository.isUsingRealDb() && topic._source !== 'database') {
      logExamGeneration('topic-source-mismatch', {
        studentId: input.studentId,
        subjectId: input.subjectId,
        topicId: selection.topicId,
        topicSource: topic._source ?? null,
        message: 'Real DB exam creation cannot use a mock topic.',
      })

      throw new AppError('Cannot create a real exam from mock topic data', 409)
    }

    const questionBank = await this.repository.listQuestionsByTopic(selection.topicId)

    logExamGeneration('question-bank-loaded', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      topicName: topic.name,
      availableQuestionCount: questionBank.length,
      availableQuestionIds: questionBank.map((question) => question.id),
    })

    if (questionBank.length === 0) {
      logExamGeneration('question-bank-empty', {
        studentId: input.studentId,
        subjectId: input.subjectId,
        topicId: topic.id,
        topicName: topic.name,
        message: 'No active questions were found for selected topic. Exam was not created.',
      })

      throw new AppError('לא נמצאו שאלות פעילות במאגר עבור הנושא שנבחר.', 404)
    }

    const selectedQuestions = shuffleQuestions(questionBank).slice(0, MIN_QUESTION_COUNT)
    const mismatchedQuestions = selectedQuestions.filter((question) => question.topicId !== topic.id)

    logExamGeneration('random-questions-selected', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      requestedQuestionCount: MIN_QUESTION_COUNT,
      selectedQuestionCount: selectedQuestions.length,
      selectedQuestions: selectedQuestions.map((question) => ({
        id: question.id,
        topicId: question.topicId,
      })),
    })

    if (mismatchedQuestions.length > 0) {
      logExamGeneration('question-topic-mismatch-blocked', {
        studentId: input.studentId,
        subjectId: input.subjectId,
        targetTopicId: topic.id,
        mismatchedQuestions: mismatchedQuestions.map((question) => ({
          id: question.id,
          questionTopicId: question.topicId,
        })),
        message: 'Exam was not created because selected questions did not match target topic.',
      })

      throw new AppError('Selected questions do not match the exam target topic', 409)
    }

    const exam = await this.repository.createGeneratedExam({
      studentId: input.studentId,
      topicId: topic.id,
      recommendationId: selection.recommendationId ?? null,
      title: `תרגול קצר: ${topic.name}`,
      generationReason:
        selection.selectionSource === 'recommendation'
          ? 'Selected from latest practice recommendation'
          : 'Selected from lowest average grade',
    })

    logExamGeneration('generated-exam-row-created', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      examId: exam.id,
      recommendationId: exam.recommendationId,
      targetTopicId: exam.targetTopicId,
      status: exam.status,
      table: 'generated_exams',
    })

    if (exam.targetTopicId !== topic.id) {
      logExamGeneration('exam-target-topic-mismatch-blocked', {
        studentId: input.studentId,
        subjectId: input.subjectId,
        examId: exam.id,
        expectedTargetTopicId: topic.id,
        actualTargetTopicId: exam.targetTopicId,
        message: 'Exam questions were not attached because generated exam target topic mismatched selected topic.',
      })

      throw new AppError('Generated exam target topic does not match selected topic', 409)
    }

    const examQuestions = await this.repository.addQuestionsToExam(
      exam.id,
      selectedQuestions.map((question) => question.id),
    )

    logExamGeneration('exam-question-rows-created', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      examId: exam.id,
      attachedQuestionCount: examQuestions.length,
      examQuestionIds: examQuestions.map((examQuestion) => examQuestion.id),
      questionIds: selectedQuestions.map((question) => question.id),
      table: 'exam_questions',
    })

    await this.repository.updateParentActionStatus({
      studentId: input.studentId,
      recommendationId: selection.recommendationId ?? null,
      status: 'in_progress',
    })

    logExamGeneration('subject-exam-create-complete', {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      examId: exam.id,
      questionCount: selectedQuestions.length,
      message: 'Exam creation DB flow completed successfully.',
    })

    return {
      studentId: input.studentId,
      subjectId: input.subjectId,
      topicId: topic.id,
      topicName: topic.name,
      examId: exam.id,
      status: exam.status,
      questionCount: selectedQuestions.length,
      questionIds: selectedQuestions.map((question) => question.id),
      selectionSource: selection.selectionSource,
      recommendationId: selection.recommendationId ?? null,
      message: `נוצר תרגול חדש בנושא ${topic.name} עם ${selectedQuestions.length} שאלות.`,
    }
  }

  public async listExamsForSubject(studentId: string, subjectId: string): Promise<SubjectExamSummary[]> {
    logExamList('start', {
      studentId,
      subjectId,
      usingRealDb: this.repository.isUsingRealDb(),
    })

    const [student, subject] = await Promise.all([
      this.repository.findStudentById(studentId),
      this.repository.findSubjectById(subjectId),
    ])

    if (!student) {
      throw new AppError('Student was not found', 404)
    }

    if (!subject) {
      throw new AppError('Subject was not found', 404)
    }

    const exams = await this.repository.listGeneratedExamsForSubject(studentId, subjectId)

    logExamList('complete', {
      studentId,
      subjectId,
      examCount: exams.length,
      examIds: exams.map((exam) => exam.id),
    })

    return exams.map((exam) => ({
      _source: exam._source ?? 'mock',
      id: exam.id,
      studentId: exam.studentId,
      subjectId,
      topicId: exam.targetTopicId,
      topicName: exam.topicName ?? 'נושא לא ידוע',
      title: exam.title,
      status: exam.status,
      questionCount: exam.questionCount,
      createdAt: exam.createdAt,
      completedAt: exam.completedAt,
    }))
  }

  private async selectPracticeTopic(
    studentId: string,
    subjectId: string,
  ): Promise<PracticeTopicSelection | null> {
    const topics = await this.repository.listTopicsForSubject(subjectId)
    const subjectTopicIds = new Set(topics.map((topic) => topic.id))
    const recommendations = await this.repository.listPendingPracticeRecommendations(studentId)

    logExamGeneration('topic-selection-inputs', {
      studentId,
      subjectId,
      subjectTopicCount: topics.length,
      subjectTopicIds: Array.from(subjectTopicIds),
      pendingPracticeRecommendationCount: recommendations.length,
      pendingPracticeRecommendationIds: recommendations.map((recommendation) => recommendation.id),
    })

    for (const recommendation of recommendations) {
      const analysisTopics = await this.repository.listAnalysisTopics(recommendation.analysisId)
      const recommendedTopic = analysisTopics
        .filter((analysisTopic) => subjectTopicIds.has(analysisTopic.topicId))
        .filter((analysisTopic) => WEAK_ANALYSIS_TYPES.has(analysisTopic.type))
        .sort(
          (first, second) =>
            (second.confidenceScore ?? 0) - (first.confidenceScore ?? 0) ||
            second.createdAt.localeCompare(first.createdAt),
        )[0]

      if (recommendedTopic) {
        logExamGeneration('topic-selected-from-recommendation', {
          studentId,
          subjectId,
          recommendationId: recommendation.id,
          analysisId: recommendation.analysisId,
          topicId: recommendedTopic.topicId,
          analysisTopicType: recommendedTopic.type,
          confidenceScore: recommendedTopic.confidenceScore,
        })

        return {
          topicId: recommendedTopic.topicId,
          selectionSource: 'recommendation',
          recommendationId: recommendation.id,
        }
      }
    }

    const grades = await this.repository.listGradesForSubject(studentId, subjectId)
    const topicScores = new Map<string, { total: number; count: number; latestDate: string }>()

    for (const grade of grades) {
      const percentage = grade.maxScore === 0 ? 0 : Math.round((grade.score / grade.maxScore) * 100)
      const current = topicScores.get(grade.topicId)

      topicScores.set(grade.topicId, {
        total: (current?.total ?? 0) + percentage,
        count: (current?.count ?? 0) + 1,
        latestDate:
          current && current.latestDate.localeCompare(grade.date) > 0
            ? current.latestDate
            : grade.date,
      })
    }

    const lowestGradeTopic = Array.from(topicScores.entries())
      .map(([topicId, score]) => ({
        topicId,
        averageScore: score.count === 0 ? 0 : score.total / score.count,
        latestDate: score.latestDate,
      }))
      .sort(
        (first, second) =>
          first.averageScore - second.averageScore ||
          second.latestDate.localeCompare(first.latestDate),
      )[0]

    if (!lowestGradeTopic) {
      logExamGeneration('topic-selection-empty', {
        studentId,
        subjectId,
        gradeCount: grades.length,
      })

      return null
    }

    logExamGeneration('topic-selected-from-lowest-grade', {
      studentId,
      subjectId,
      topicId: lowestGradeTopic.topicId,
      averageScore: lowestGradeTopic.averageScore,
      latestGradeDate: lowestGradeTopic.latestDate,
      gradeCount: grades.length,
    })

    return {
      topicId: lowestGradeTopic.topicId,
      selectionSource: 'lowest_grade',
      averageScore: lowestGradeTopic.averageScore,
      latestGradeDate: lowestGradeTopic.latestDate,
    }
  }

  private async createFallbackQuestions(
    topicName: string,
    topicId: string,
    difficultyLevelId: string,
    questionTypeId: string,
    missingCount: number,
  ): Promise<QuestionWithOptions[]> {
    if (!this.repository.isUsingRealDb()) {
      logExamGeneration('fallback-questions-create-mock', {
        topicId,
        topicName,
        missingQuestionCount: missingCount,
      })

      const questions = await this.repository.saveQuestionsWithOptions(
        deterministicFallbackQuestions(topicId, missingCount).map((question) => ({
          topicId,
          difficultyLevelId,
          questionTypeId,
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          options: question.options,
        })),
      )

      logExamGeneration('fallback-questions-saved', {
        topicId,
        generatedQuestionCount: questions.length,
        generatedQuestionIds: questions.map((question) => question.id),
        source: 'deterministic_mock',
      })

      return questions
    }

    logExamGeneration('fallback-questions-create-ai', {
      topicId,
      topicName,
      missingQuestionCount: missingCount,
      model: 'claude-3-5-sonnet-latest',
    })

    const message = await getAnthropic().messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1600,
      messages: [
        {
          role: 'user',
          content: buildQuestionPrompt(topicName, missingCount),
        },
      ],
    })
    const firstBlock = message.content[0]
    const rawText = firstBlock && firstBlock.type === 'text' ? firstBlock.text : parseClaudeText(message.content)
    const parsed = generatedQuestionSchema.parse(JSON.parse(rawText) as unknown)

    const questions = await this.repository.saveQuestionsWithOptions(
      parsed.questions.map((question) => ({
        topicId,
        difficultyLevelId,
        questionTypeId,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        options: question.options,
      })),
    )

    logExamGeneration('fallback-questions-saved', {
      topicId,
      generatedQuestionCount: questions.length,
      generatedQuestionIds: questions.map((question) => question.id),
      source: 'claude_fallback',
    })

    return questions
  }
}

export const questionService = new QuestionService()
