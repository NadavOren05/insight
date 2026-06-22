import type { RequestHandler } from 'express'
import { z } from 'zod'
import { questionService } from '../services/questionService.js'

const generateLessonSchema = z.object({
  studentId: z.string().min(1),
  topicId: z.string().min(1),
  difficultyLevelId: z.string().min(1).optional(),
  recommendationId: z.string().min(1).optional(),
})

export const generateLessonController: RequestHandler = async (request, response, next) => {
  try {
    const lesson = await questionService.generateExamBackedLesson(generateLessonSchema.parse(request.body))

    response.json(lesson)
  } catch (error) {
    next(error)
  }
}
