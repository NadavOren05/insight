import type { RequestHandler } from 'express'
import { z } from 'zod'
import { questionService } from '../services/questionService.js'

const examParamsSchema = z.object({
  examId: z.string().min(1),
})

const submitExamSchema = z.object({
  studentId: z.string().min(1),
  answers: z.array(
    z.object({
      examQuestionId: z.string().min(1),
      selectedOptionId: z.string().min(1),
    }),
  ),
})

export const getExamPracticeController: RequestHandler = async (request, response, next) => {
  try {
    const { examId } = examParamsSchema.parse(request.params)
    const exam = await questionService.getExamPractice(examId)

    response.json(exam)
  } catch (error) {
    next(error)
  }
}

export const submitExamController: RequestHandler = async (request, response, next) => {
  try {
    const { examId } = examParamsSchema.parse(request.params)
    const body = submitExamSchema.parse(request.body)
    const result = await questionService.submitExam({
      examId,
      studentId: body.studentId,
      answers: body.answers,
    })

    response.json(result)
  } catch (error) {
    next(error)
  }
}

export const retryExamController: RequestHandler = async (request, response, next) => {
  try {
    const { examId } = examParamsSchema.parse(request.params)
    const result = await questionService.retryExam(examId)

    response.json(result)
  } catch (error) {
    next(error)
  }
}

export const finishExamController: RequestHandler = async (request, response, next) => {
  try {
    const { examId } = examParamsSchema.parse(request.params)
    const result = await questionService.finishExam(examId)

    response.json(result)
  } catch (error) {
    next(error)
  }
}
