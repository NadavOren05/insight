import { Router } from 'express'
import {
  generateSubjectPracticeController,
  getStudentOverviewController,
  getSubjectDetailController,
} from '../controllers/studentController.js'

export const studentRoutes = Router()

studentRoutes.get('/:id/overview', getStudentOverviewController)
studentRoutes.get('/:id/subject/:subjectId', getSubjectDetailController)
studentRoutes.post('/:id/subject/:subjectId/generate-practice', generateSubjectPracticeController)
