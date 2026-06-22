import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { env } from '../lib/env.js'
import { AppError } from '../middleware/appError.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type { GeneratedLessonResponse, PracticeQuestion } from '../types/api.js'
import type { QuestionWithOptions } from '../types/database.js'

interface GenerateExamInput {
  studentId: string
  topicId: string
  difficultyLevelId?: string | undefined
  recommendationId?: string | undefined
}

const MIN_QUESTION_COUNT = 5

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

export class QuestionService {
  private readonly repository: StudentRepository

  public constructor(repository: StudentRepository = studentRepository) {
    this.repository = repository
  }

  public async generateExamBackedLesson(input: GenerateExamInput): Promise<GeneratedLessonResponse> {
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
    const generatedQuestions =
      missingCount > 0
        ? await this.createFallbackQuestions(topic.name, input.topicId, difficultyLevelId, questionType.id, missingCount)
        : []
    const selectedQuestions = [...dbQuestions, ...generatedQuestions].slice(0, MIN_QUESTION_COUNT)

    const exam = await this.repository.createGeneratedExam({
      studentId: input.studentId,
      topicId: input.topicId,
      recommendationId: input.recommendationId ?? null,
      title: `תרגול קצר: ${topic.name}`,
      generationReason: missingCount > 0 ? 'DB inventory was insufficient; AI fallback filled gaps.' : 'DB inventory',
    })

    await this.repository.addQuestionsToExam(
      exam.id,
      selectedQuestions.map((question) => question.id),
    )
    await this.repository.updateParentActionStatus({
      studentId: input.studentId,
      recommendationId: input.recommendationId ?? null,
      status: 'in_progress',
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

  private async createFallbackQuestions(
    topicName: string,
    topicId: string,
    difficultyLevelId: string,
    questionTypeId: string,
    missingCount: number,
  ): Promise<QuestionWithOptions[]> {
    if (!this.repository.isUsingRealDb()) {
      return this.repository.saveQuestionsWithOptions(
        deterministicFallbackQuestions(topicId, missingCount).map((question) => ({
          topicId,
          difficultyLevelId,
          questionTypeId,
          questionText: question.questionText,
          correctAnswer: question.correctAnswer,
          options: question.options,
        })),
      )
    }

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

    return this.repository.saveQuestionsWithOptions(
      parsed.questions.map((question) => ({
        topicId,
        difficultyLevelId,
        questionTypeId,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        options: question.options,
      })),
    )
  }
}

export const questionService = new QuestionService()
