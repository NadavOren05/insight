import type { RequestHandler } from 'express'
import { z } from 'zod'
import { aiService } from '../services/aiService.js'

const generateLessonSchema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
})

export const generateLessonController: RequestHandler = async (request, response, next) => {
  try {
    const { studentId, topicId } = generateLessonSchema.parse(request.body)
    const lesson = await aiService.generateLesson(studentId, topicId)

    response.json(lesson)
  } catch (error) {
    next(error)
  }
}
