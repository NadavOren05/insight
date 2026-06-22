import type { RequestHandler } from 'express'
import { z } from 'zod'
import { studentService } from '../services/studentService.js'

const studentParamsSchema = z.object({
  id: z.string().min(1),
})

const subjectParamsSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
})

export const getStudentOverviewController: RequestHandler = async (request, response, next) => {
  try {
    const { id } = studentParamsSchema.parse(request.params)
    const overview = await studentService.getOverview(id)

    response.json(overview)
  } catch (error) {
    next(error)
  }
}

export const getSubjectDetailController: RequestHandler = async (request, response, next) => {
  try {
    const { id, subjectId } = subjectParamsSchema.parse(request.params)
    const subjectDetail = await studentService.getSubjectDetail(id, subjectId)

    response.json(subjectDetail)
  } catch (error) {
    next(error)
  }
}
