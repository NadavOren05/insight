import { Router } from 'express'
import {
  finishExamController,
  getExamPracticeController,
  retryExamController,
  submitExamController,
} from '../controllers/examController.js'

export const examRoutes = Router()

examRoutes.get('/:examId/practice', getExamPracticeController)
examRoutes.post('/:examId/submit', submitExamController)
examRoutes.post('/:examId/retry', retryExamController)
examRoutes.delete('/:examId', finishExamController)
