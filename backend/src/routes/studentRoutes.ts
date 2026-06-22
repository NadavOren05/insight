import { Router } from 'express'
import {
  getStudentOverviewController,
  getSubjectDetailController,
} from '../controllers/studentController.js'

export const studentRoutes = Router()

studentRoutes.get('/:id/overview', getStudentOverviewController)
studentRoutes.get('/:id/subject/:subjectId', getSubjectDetailController)
