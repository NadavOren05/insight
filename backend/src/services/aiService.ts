import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { env } from '../lib/env.js'
import { studentRepository, type StudentRepository } from '../repositories/studentRepository.js'
import type { StudentAIAnalysis } from '../types/database.js'
import { runAnalysisPipeline } from '../services/aiAnalysis.js'

const getAnthropic = (): Anthropic =>
  new Anthropic({
    apiKey: env.CLAUDE_API_KEY ?? '',
  })

const analysisSchema = z.object({
  parentSummary: z.string(),
  riskLevel: z.number().int().min(1).max(10).nullable(),
  trend: z.string().nullable(),
  attendanceFlag: z.boolean(),
})

const buildAnalysisPrompt = (studentId: string, subjectId: string): string =>
  [
    'You are Insight, an academic assistant for parents.',
    'Return only valid JSON matching: { "parentSummary": string, "riskLevel": number | null, "trend": string | null, "attendanceFlag": boolean }.',
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
    // const cachedAnalysis = await this.repository.findAnalysisForToday(studentId)

    // if (cachedAnalysis) {
    //   return cachedAnalysis
    // }

    if (!env.USE_REAL_DB) {
      return this.repository.saveAnalysis({
        studentId,
        parentSummary: 'ניתוח mock מצביע על צורך בתרגול קצר וממוקד לפי נושא.',
        riskLevel: 5,
        trend: 'stable',
        attendanceFlag: false,
      })
    }

    await Promise.all([
      this.repository.listGradesForSubject(studentId, subjectId),
      this.repository.listAttendanceForSubject(studentId, subjectId),
    ])

    const analysisResult = await runAnalysisPipeline(studentId, subjectId);
    const { trend, riskLevel, confidenceScore } = analysisResult || {};
    
    // const message = await getAnthropic().messages.create({
    //   model: 'claude-3-5-sonnet-latest',
    //   max_tokens: 1200,
    //   messages: [
    //     {
    //       role: 'user',
    //       content: buildAnalysisPrompt(studentId, subjectId),
    //     },
    //   ],
    // })

    // const firstBlock = message.content[0]
    // const rawText = firstBlock && firstBlock.type === 'text' ? firstBlock.text : parseClaudeText(message.content)
    // const parsedResponse = analysisSchema.parse(JSON.parse(rawText) as unknown)

    return this.repository.saveAnalysis({
      studentId,
      parentSummary: 'ניתוח מצביע על צורך בתרגול קצר וממוקד לפי נושא.',
      riskLevel: riskLevel ?? 5,
      trend: trend ?? 'stable',
      attendanceFlag: false,
    })
  }
}


export const aiService = new AIService()