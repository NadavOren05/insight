import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { env } from '../lib/env.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type { GeneratedLessonResponse } from '../types/api.js'
import type { RiskLevel, StudentAIAnalysis, TopicStatus } from '../types/database.js'

const getAnthropic = (): Anthropic =>
  new Anthropic({
    apiKey: env.CLAUDE_API_KEY ?? '',
  })

const analysisSchema = z.object({
  summary: z.string(),
  riskLevel: z.enum(['red', 'yellow', 'green']),
  topics: z.array(
    z.object({
      topicId: z.string(),
      status: z.enum(['needs-support', 'medium', 'strong']),
      explanation: z.string().nullable(),
    }),
  ),
})

type ClaudeAnalysis = z.infer<typeof analysisSchema>

const fallbackRiskLevel = (analysis: ClaudeAnalysis): RiskLevel => analysis.riskLevel

const buildAnalysisPrompt = (studentId: string, subjectId: string): string =>
  [
    'You are Insight, an academic assistant for parents.',
    'Return only valid JSON matching: { "summary": string, "riskLevel": "red" | "yellow" | "green", "topics": [{ "topicId": string, "status": "needs-support" | "medium" | "strong", "explanation": string | null }] }.',
    `Analyze student ${studentId} in subject ${subjectId}. Explain why the child is struggling and how the parent should act tonight.`,
  ].join('\n')

const parseClaudeText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value)
}

export class AIService {
  private readonly repository: StudentRepository

  public constructor(repository: StudentRepository = studentRepository) {
    this.repository = repository
  }

  public async getOrCreateAnalysis(
    studentId: string,
    subjectId: string,
  ): Promise<StudentAIAnalysis> {
    const cachedAnalysis = await this.repository.findAnalysisForToday(studentId, subjectId)

    if (cachedAnalysis) {
      return cachedAnalysis
    }

    if (!env.USE_REAL_DB) {
      return this.repository.saveAnalysis({
        studentId,
        subjectId,
        summary: 'ניתוח mock מצביע על צורך בתרגול קצר וממוקד לפי נושא.',
        riskLevel: 'yellow',
        rawResponse: { source: 'mock' },
      })
    }

    await Promise.all([
      this.repository.listGradesForSubject(studentId, subjectId),
      this.repository.listAttendanceForSubject(studentId, subjectId),
    ])

    const message = await getAnthropic().messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: buildAnalysisPrompt(studentId, subjectId),
        },
      ],
    })

    const firstBlock = message.content[0]
    const rawText = firstBlock && firstBlock.type === 'text' ? firstBlock.text : parseClaudeText(message.content)
    const parsedResponse = analysisSchema.parse(JSON.parse(rawText) as unknown)

    const analysis = await this.repository.saveAnalysis({
      studentId,
      subjectId,
      summary: parsedResponse.summary,
      riskLevel: fallbackRiskLevel(parsedResponse),
      rawResponse: parsedResponse,
    })

    await this.repository.saveAnalysisTopics(
      parsedResponse.topics.map((topic) => ({
        analysisId: analysis.id,
        topicId: topic.topicId,
        status: topic.status as TopicStatus,
        explanation: topic.explanation,
      })),
    )

    return analysis
  }

  public async generateLesson(studentId: string, topicId: string): Promise<GeneratedLessonResponse> {
    return {
      studentId,
      topicId,
      lessonExplanation: {
        title: 'הסבר קצר לפני תרגול',
        steps: [
          'להתחיל בדוגמה אחת פשוטה.',
          'לבקש מהילד להסביר את הצעד הראשון.',
          'לעצור אחרי הצלחה קטנה כדי לשמר ביטחון.',
        ],
        example: `תרגול ממוקד בנושא ${topicId}`,
      },
      practiceQuestions: [
        {
          id: 'question-1',
          prompt: `שאלה קצרה בנושא ${topicId}`,
          answer: 'תשובה לדוגמה',
          hint: 'חפש את מילת המפתח בשאלה.',
        },
      ],
      parentPedagogicalGuide: {
        goal: 'לתת להורה דרך פעולה קצרה וברורה לערב הקרוב.',
        coachingTips: ['לשאול לפני שמתקנים', 'לתת חיזוק על דרך החשיבה'],
        stopWhen: 'לעצור אחרי 10 דקות או אם מופיע תסכול.',
      },
    }
  }
}

export const aiService = new AIService()
